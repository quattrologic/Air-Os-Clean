"""Compare genuine Electron captures; does not synthesize or redraw UI."""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat
root=Path(__file__).resolve().parents[1]/'docs'/'visual'
reports={m:json.loads((root/f'deep2-{m}'/'report.json').read_text()) for m in ['before','after','diagnostic']}
for entries in zip(*(reports[m]['modes'] for m in reports)):
 assert entries[0]['geometry']==entries[1]['geometry']==entries[2]['geometry']
 assert all(e['idleDraws']==0 for e in entries)
 assert entries[2]['material']['draws']>0 and entries[2]['material']['diagnostic']
for mode in reports:
 folder=root/f'deep2-{mode}'
 # Crop only, same actual viewport pixels. Existing 430px centered host, top0/max420.
 Image.open(folder/'control-clouds-1920.png').crop((745,0,1175,420)).save(folder/'control-panel-1920.png')
for k in ['classic','lost','ended']:
 c=reports['diagnostic']['cleanup'][k]
 assert c['tiles']==c['programs']==c['textures']==0
assert reports['diagnostic']['cleanup']['ended']['disposed']
result={'hardwareAcceptance':False,'os':'Linux Electron44','geometry':'exactly equal before/after/isolated WebGL diagnostic at all three renderer sizes','idleDraws':0,'mask':reports['diagnostic']['mask'],'cleanup':reports['diagnostic']['cleanup'],'keepAwake':'Never activated on this laptop. Isolated host unavailable. Positive lifecycle tests use fake driver.','pixelDifference':{}}
for width in [1920,1650,390]:
 a=Image.open(root/f'deep2-before/control-clouds-{width}.png').convert('RGB')
 b=Image.open(root/f'deep2-after/control-clouds-{width}.png').convert('RGB')
 diff=sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3
 assert diff>0
 result['pixelDifference'][str(width)]=round(diff,3)
(root/'deep2-comparison.json').write_text(json.dumps(result,indent=2)+'\n')
print('Verified three-size geometry, genuine image changes, zero idle draws and cleanup.')
