# R1.1: Windows-only signing prerequisites and fail-closed native verification.
[CmdletBinding()]
param([ValidateSet('Probe','Prepare','VerifyPackage','VerifyInstalled','Cleanup')][string]$Action='Probe', [ValidateSet('certificate','artifact')][string]$Mode='certificate')
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$PSNativeCommandUseErrorActionPreference=$false # Explicit native exit checks below, including negative probe.
if (-not $IsWindows) { throw 'Native Windows required; no emulated signature acceptance.' }
$private = Join-Path $env:RUNNER_TEMP 'air-r11-signing'
function Get-SignTool {
    $sdk = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits/10/bin'
    $tools = @(Get-ChildItem "$sdk/*/x64/signtool.exe" | Sort-Object { [version]$_.Directory.Parent.Name } -Descending)
    if ($tools.Count -eq 0) { throw 'BLOCKED: Windows SDK x64 SignTool is missing.' }
    return $tools[0].FullName
}
function Assert-Chain($Certificate) {
    if ($Certificate.Subject -eq $Certificate.Issuer) { throw 'Self-signed leaf certificates are not accepted.' }
    $chain = [Security.Cryptography.X509Certificates.X509Chain]::new()
    try {
        $chain.ChainPolicy.RevocationMode = 'Online'
        $chain.ChainPolicy.RevocationFlag = 'ExcludeRoot'
        $chain.ChainPolicy.VerificationFlags = 'NoFlag'
        $chain.ChainPolicy.ApplicationPolicy.Add([Security.Cryptography.Oid]::new('1.3.6.1.5.5.7.3.3'))
        if (-not $chain.Build($Certificate)) { throw 'Trusted code-signing chain/revocation validation failed.' }
    } finally { $chain.Dispose() }
}
function Assert-Publisher($Certificate) {
    if ($Certificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName,$false) -cne $env:AIR_SIGNING_PUBLISHER) { throw 'Unexpected signing publisher.' }
    if ($Certificate.PublicKey.Oid.Value -ne '1.2.840.113549.1.1.1') { throw 'This SAC-targeted channel requires an RSA signing identity.' }
    Assert-Chain $Certificate
}
function Get-Executables([string]$Root) {
    foreach ($file in Get-ChildItem -LiteralPath $Root -Recurse -File) {
        if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Executable inventory may not traverse reparse files.' }
        $stream = [IO.File]::OpenRead($file.FullName)
        try {
            $header = [byte[]]::new(64)
            if ($stream.Read($header,0,64) -ne 64 -or $header[0] -ne 77 -or $header[1] -ne 90) { continue }
            $offset = [BitConverter]::ToUInt32($header,60)
            if ($offset -gt $stream.Length-4) { continue }
            $stream.Position=$offset
            if ($stream.ReadByte() -eq 80 -and $stream.ReadByte() -eq 69 -and $stream.ReadByte() -eq 0 -and $stream.ReadByte() -eq 0) { $file }
        } finally { $stream.Dispose() }
    }
}
function Test-File($File,[string]$Relative) {
    $sig=Get-AuthenticodeSignature -LiteralPath $File
    if ($sig.Status -ne 'Valid' -or $sig.SignatureType -ne 'Authenticode' -or $null -eq $sig.SignerCertificate -or $null -eq $sig.TimeStamperCertificate) { throw "Missing valid embedded signature/timestamp: $Relative" }
    Assert-Publisher $sig.SignerCertificate
    $log=Join-Path $private 'signtool-verification.log'
    & (Get-SignTool) verify /pa /all /v /tw $File *> $log
    if ($LASTEXITCODE -ne 0) { throw "SignTool chain/signature/timestamp verification failed: $Relative" }
    [pscustomobject]@{file=$Relative;status='Valid';signer=$sig.SignerCertificate.Thumbprint;timestamp=$sig.TimeStamperCertificate.Thumbprint;chainVerified=$true;signToolVerified=$true;rsa=$true;sha256=(Get-FileHash -LiteralPath $File -Algorithm SHA256).Hash.ToLowerInvariant()}
}
if ($Action -eq 'Cleanup') {
    $state=Join-Path $private 'imported-certificates.json'
    if (Test-Path -LiteralPath $state) {
        foreach ($entry in @(Get-Content -LiteralPath $state -Raw | ConvertFrom-Json)) {
            $certPath='Cert:\CurrentUser\My\'+$entry.thumbprint
            if (Test-Path -LiteralPath $certPath) { if ($entry.privateKey) { Remove-Item -LiteralPath $certPath -DeleteKey -Force } else { Remove-Item -LiteralPath $certPath -Force } }
        }
    }
    if (Test-Path -LiteralPath $private) { Remove-Item -LiteralPath $private -Recurse -Force }
    return
}
if (-not (Test-Path -LiteralPath $private)) { New-Item -ItemType Directory -Path $private | Out-Null }
# Secret files live outside the checkout; only the current ephemeral runner user can read them.
$acl=Get-Acl -LiteralPath $private
$acl.SetAccessRuleProtection($true,$false)
$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.WindowsIdentity]::GetCurrent().Name,'FullControl','ContainerInherit,ObjectInherit','None','Allow'))
Set-Acl -LiteralPath $private -AclObject $acl
if ($Action -eq 'Probe') {
    $tool=Get-SignTool
    $unsigned=Join-Path $private 'unsigned-negative-fixture.exe'
    [IO.File]::WriteAllBytes($unsigned,[byte[]](77,90,0,0))
    & $tool verify /pa /all /tw $unsigned *> (Join-Path $private 'negative-signtool.log')
    if ($LASTEXITCODE -eq 0) { throw 'Unsigned negative fixture incorrectly accepted.' }
    Remove-Item -LiteralPath $unsigned -Force
    Write-Output 'Native Windows SDK SignTool present; unsigned negative fixture rejected. No positive signing/SAC test performed.'
    exit 0
}
if ($Action -eq 'Prepare') {
    & node scripts/windows-signing.cjs status $Mode
    if ($LASTEXITCODE -ne 0) { throw 'Signing preflight failed.' }
    if ($Mode -eq 'certificate') {
        try {
            if (-not $env:AIR_WINDOWS_CERTIFICATE_PFX -or -not $env:AIR_WINDOWS_CERTIFICATE_PASSWORD) { throw 'Required protected credentials missing.' }
            $pfx=Join-Path $private 'identity.pfx'
            [IO.File]::WriteAllBytes($pfx,[Convert]::FromBase64String($env:AIR_WINDOWS_CERTIFICATE_PFX))
            $password=ConvertTo-SecureString $env:AIR_WINDOWS_CERTIFICATE_PASSWORD -AsPlainText -Force
            $data=Get-PfxData -FilePath $pfx -Password $password
            if (@($data.EndEntityCertificates).Count -ne 1) { throw 'One certificate identity required.' }
            if (Test-Path -LiteralPath ('Cert:\CurrentUser\My\'+$data.EndEntityCertificates[0].Thumbprint)) { throw 'Refusing to overwrite an existing signing identity.' }
            $before=@(Get-ChildItem Cert:\CurrentUser\My | ForEach-Object Thumbprint)
            try { $imported=@(Import-PfxCertificate -FilePath $pfx -CertStoreLocation Cert:\CurrentUser\My -Password $password) }
            finally {
                # Record even partially imported new identities for the unconditional cleanup.
                @(Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.Thumbprint -notin $before } | ForEach-Object { @{thumbprint=$_.Thumbprint;privateKey=$_.HasPrivateKey} }) | ConvertTo-Json -AsArray | Set-Content -LiteralPath (Join-Path $private 'imported-certificates.json')
            }
            $leaf=@($imported | Where-Object HasPrivateKey)
            if ($leaf.Count -ne 1) { throw 'Exactly one private signing identity required.' }
            Assert-Publisher $leaf[0]
            $env:AIR_SIGNING_CERT_SHA1=$leaf[0].Thumbprint
            Remove-Item -LiteralPath $pfx -Force
        } catch { throw 'BLOCKED: protected certificate could not be loaded/validated; check credentials, RSA publisher identity and trusted CA chain.' }
    }
    & node scripts/windows-signing.cjs config $Mode
    if ($LASTEXITCODE -ne 0) { throw 'BLOCKED: signing configuration is incomplete.' }
    "R11_SIGNING_CONFIG=$(Join-Path $private 'config.json')" >> $env:GITHUB_ENV
    return
}
if (-not $env:AIR_SIGNING_PUBLISHER -or $env:GITHUB_SHA -notmatch '^[a-f0-9]{40}$') { throw 'Verified build identity/publisher required.' }
if ($Action -eq 'VerifyPackage') {
    $root=(Resolve-Path dist).Path
    $installers=@(Get-ChildItem -LiteralPath $root -File | Where-Object Name -Like '*-Windows-x64.exe')
    if ($installers.Count -ne 1) { throw 'Exactly one current installer required.' }
    $files=@($installers)+@(Get-Executables (Join-Path $root 'win-unpacked'))
    $scope='package'
} else {
    $root=(Resolve-Path -LiteralPath (Split-Path $env:AIR_R1_EXE -Parent)).Path
    $files=@(Get-Executables $root)
    if (-not ($files.Name -contains 'Air-OS.exe') -or -not ($files.Name -match '(?i)uninstall.*\.exe$')) { throw 'Installed app and signed NSIS uninstaller required.' }
    $scope='installed'
}
$records=@(foreach ($file in $files) { Test-File $file.FullName ([IO.Path]::GetRelativePath($root,$file.FullName).Replace('\','/')) })
if ($records.Count -lt 2) { throw 'Executable inventory incomplete.' }
[ordered]@{schema=1;status='VERIFIED';platform='win32';commit=$env:GITHUB_SHA;scope=$scope;smartAppControl='NOT_TESTED';files=$records} | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath "dist/r11-$scope-signatures.json"
Write-Output "Verified $($records.Count) embedded signatures, timestamps and trusted publisher chains. Smart App Control NOT TESTED."
