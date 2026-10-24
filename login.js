'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const loginForm = $("#login-form");
  const createForm = $("#create-form");
  const accountsBox = $("#saved-accounts");
  const loginError = $("#login-error");
  const createError = $("#create-error");
  const setError = (element, message) => {
    element.textContent = message || "";
    element.hidden = !message;
  };
  let accounts = [];
  let selectedAccount = null;
  let authBusy = false;
  let disposed = false;
  let accountsRequest = 0;
  let clockTimer = null;
  const listeners = new AbortController();
  const listen = (target, type, handler) => target.addEventListener(type, handler, {signal:listeners.signal});
  const input = $("#login-password");
  function syncPassword() {
    document.body.classList.toggle("has-password", input.value.length > 0);
  }
  function engage(value) {
    document.body.classList.toggle("is-engaged", value);
  }
  function setBusy(value) {
    authBusy = value;
    document.body.classList.toggle("is-auth-busy", value);
    loginForm.setAttribute("aria-busy", String(value));
    createForm.setAttribute("aria-busy", String(value));
    input.readOnly = value;
    $("#login-submit").disabled = value || !selectedAccount;
    $("#switch-create").disabled = value;
    $("#switch-login").disabled = value;
    accountsBox.querySelectorAll("button").forEach(button => button.disabled = value);
  }

  function setMode(next) {
    if (authBusy || disposed) return;
    const creating = next === "create";
    input.value = ""; syncPassword(); engage(false);
    document.body.classList.toggle("is-creating", creating);
    loginForm.hidden = creating;
    createForm.hidden = !creating;
    setError(loginError, "");
    setError(createError, "");
    if (creating) $("#create-display-name").focus();
    else document.body.focus();
  }
  function selectAccount(account, button) {
    if (authBusy || disposed) return;
    selectedAccount = account;
    $("#login-username").value = account.username;
    $("#login-profile-name").textContent = account.displayName || account.username;
    $("#login-profile-subtitle").textContent = "Air-OS Benutzerkonto";
    $("#login-password").value = ""; syncPassword();
    $("#login-avatar").textContent = Array.from((account.displayName || account.username).trim())[0]?.toLocaleUpperCase() || "?";
    $("#login-submit").disabled = false;
    setError(loginError, "");
    accountsBox.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
    if (accountsBox.children.length > 1) accountsBox.hidden = false;
  }
  function renderAccounts() {
    accountsBox.replaceChildren();
    accountsBox.hidden = accounts.length < 2;
    accounts.forEach(account => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "saved-account";
      button.innerHTML = '<span class="saved-account-avatar"></span><span></span>';
      button.querySelector(".saved-account-avatar").textContent = (account.displayName || account.username).trim().charAt(0).toLocaleUpperCase("de-DE");
      button.querySelector("span:last-child").textContent = account.displayName || account.username;
      button.title = "Als " + account.username + " anmelden";
      button.addEventListener("click", () => { if (!authBusy) { selectAccount(account, button); input.focus(); } });
      accountsBox.appendChild(button);
    });
    if (accounts.length) selectAccount(accounts[0], accountsBox.querySelector("button"));
  }
  async function loadAccounts() {
    const request = ++accountsRequest;
    $("#retry-accounts").hidden = true;
    $("#login-submit").disabled = true;
    try {
      const result = await window.airOS.accounts();
      if (disposed || request !== accountsRequest) return;
      accounts = result;
      renderAccounts();
      setMode(accounts.length ? "login" : "create");
    } catch {
      if (disposed || request !== accountsRequest) return;
      setError(loginError, "Konten konnten nicht gelesen werden. Bitte erneut versuchen.");
      $("#retry-accounts").hidden = false;
    }
  }
  listen($("#retry-accounts"), "click", loadAccounts);

  $("#switch-create").addEventListener("click", () => setMode("create"));
  $("#switch-login").addEventListener("click", () => setMode(accounts.length ? "login" : "create"));

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (authBusy || disposed || !selectedAccount || input.value.length === 0) return;
    setError(loginError, "");
    setBusy(true);
    const button = $("#login-submit");
    button.disabled = true;
    try {
      const result = await window.airOS.login({
        username: $("#login-username").value.trim(),
        password: $("#login-password").value
      });
      if (!disposed && (!result || !result.ok)) setError(loginError, result && result.error || "Anmeldung fehlgeschlagen.");
    } catch {
      if (!disposed) setError(loginError, "Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      if (!disposed) {
        setBusy(false); input.value = ""; syncPassword(); input.focus();
      }
    }
  });

  createForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (authBusy || disposed) return;
    setError(createError, "");
    const password = $("#create-password").value;
    if (password !== $("#create-confirm").value) {
      setError(createError, "Die Passwörter stimmen nicht überein.");
      $("#create-confirm").focus();
      return;
    }
    setBusy(true);
    const button = $("#create-submit");
    button.disabled = true;
    button.querySelector("span").textContent = "Konto wird erstellt …";
    try {
      const result = await window.airOS.createAccount({
        displayName: $("#create-display-name").value.trim(),
        username: $("#create-username").value.trim(),
        password
      });
      if (!disposed && (!result || !result.ok)) setError(createError, result && result.error || "Das Konto konnte nicht erstellt werden.");
    } catch {
      if (!disposed) setError(createError, "Konto konnte nicht erstellt werden. Bitte versuche es erneut.");
    } finally {
      if (!disposed) {
        setBusy(false); button.disabled = false;
        button.querySelector("span").textContent = "Konto erstellen";
        $("#create-password").value = ""; $("#create-confirm").value = "";
      }
    }
  });

  // Port of MacLock's local clock; no OS credentials, PAM or global keyboard hook.
  function updateClock() {
    clearTimeout(clockTimer); clockTimer = null;
    if (disposed || document.hidden) return;
    const now = new Date();
    $("#login-clock").textContent = window.airMacLockLayout.time(now);
    $("#login-clock").dateTime = now.toISOString();
    $("#maclock-date").textContent = window.airMacLockLayout.date(now, document.documentElement.lang || undefined);
    clockTimer = setTimeout(updateClock, 1000);
  }
  function resize() { document.body.style.setProperty("--maclock-u", window.airMacLockLayout.layout(window.innerHeight).u); }
  listen(window, "resize", resize);
  listen(document, "visibilitychange", updateClock);
  listen(input, "input", syncPassword);
  listen(input, "focus", () => engage(true));
  listen(input, "blur", () => { if (!input.value && !authBusy) engage(false); });
  for (const type of ["keydown", "keyup"]) listen(input, type, event => {
    $("#login-caps").hidden = !event.getModifierState?.("CapsLock");
  });
  listen(document, "keydown", event => {
    if (authBusy || document.body.classList.contains("is-creating") || !$("#sleep-overlay").hidden) return;
    if (event.key === "Escape") {
      input.value = ""; syncPassword(); engage(false); input.blur(); document.body.focus(); event.preventDefault();
    } else if (event.ctrlKey && event.key.toLowerCase() === "u" && event.target === input) {
      input.value = ""; syncPassword(); event.preventDefault();
    } else if (event.target === document.body && selectedAccount && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) {
      if (event.key.length === 1) { input.focus(); input.value += event.key; syncPassword(); event.preventDefault(); }
      else if (event.key === "Enter") { input.focus(); event.preventDefault(); }
    }
  });
  listen(window, "pagehide", () => {
    disposed = true; accountsRequest++; clearTimeout(clockTimer); listeners.abort();
    input.value = ""; $("#create-password").value = ""; $("#create-confirm").value = "";
  });
  resize(); updateClock();

  const sleepOverlay = $("#sleep-overlay");
  const wake = () => { sleepOverlay.hidden = true; document.body.focus(); };
  $("#sleep-button").addEventListener("click", () => { sleepOverlay.hidden = false; sleepOverlay.focus(); });
  sleepOverlay.addEventListener("click", wake);
  sleepOverlay.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") wake(); });
  window.addEventListener("keydown", event => { if (!sleepOverlay.hidden && event.key !== "Tab") wake(); });
  $("#restart-button").addEventListener("click", async () => {
    const button = $("#restart-button"); button.disabled = true;
    try { await window.airOS.restart(); } catch { window.location.reload(); }
  });
  $("#shutdown-button").addEventListener("click", async () => {
    const button = $("#shutdown-button"); button.disabled = true;
    try { await window.airOS.quit(); } catch { button.disabled = false; setError(loginError, "Ausschalten ist nur in der installierten Air-OS-App verfügbar."); }
  });

  loadAccounts();
})();
