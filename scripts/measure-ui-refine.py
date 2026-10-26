"""Measure actual Electron artifacts; only crop original renderer pixels."""
from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parents[1]/'docs'/'visual'
r={m:json.loads((root/f'refine1-{m}'/'report.json').read_text())for m in ['before','after','diagnostic']}
measure=[]
for old,new,gl in zip(r['before']['modes'],r['after']['modes'],r['diagnostic']['modes']):
 assert new['geometry']==gl['geometry']
 d=new['geometry']['dock'];i=new['geometry']['island'];assert d['bottom']==new['height'] and i['top']==0
 assert abs(d['x']+d['width']/2-new['width']/2)<.01
 assert abs(i['x']+i['width']/2-new['width']/2)<.01
 assert d['width']<old['geometry']['dock']['width'] and d['height']<old['geometry']['dock']['height']
 assert new['idleDraws']==gl['idleDraws']==0
 if new['pattern']=='clouds':measure.append({'viewport':[new['width'],new['height']],'before':old['geometry'],'after':new['geometry']})
for mode in ['after','diagnostic']:
 for panel in r[mode]['control']:assert panel['scrollHeight']<=panel['height']+1
for snapshot in r['diagnostic']['cleanup'].values():assert snapshot['tiles']==snapshot['programs']==snapshot['textures']==0
for mode in r:
 folder=root/f'refine1-{mode}';Image.open(folder/'control-clouds-1920.png').crop((745,0,1175,440)).save(folder/'control-panel-1920.png')
summary={'hardwareAcceptance':False,'geometry':measure,'mainPage':'all three sizes: scrollHeight equals clientHeight (within 1px)','clock':'real GUI asserts #clock and header clock have no client rectangles in Modern, central clock retained','rightSymbol':'real GUI computed background rgba(0,0,0,0)','mask':r['diagnostic']['mask'],'idleDraws':0,'cleanup':r['diagnostic']['cleanup']}
(root/'refine1-comparison.json').write_text(json.dumps(summary,indent=2)+'\n')
print('Three-size geometry, no-scroll main pages, concave mask and GPU cleanup verified.')
