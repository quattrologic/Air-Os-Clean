"""Rendered evidence only: never draws replacement UI or reads user profile files."""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat
root=Path(__file__).resolve().parents[1]/'docs'/'visual'
folders={name:root/('glass3-'+name) for name in ['before','after','diagnostic']}
reports={name:json.loads((folder/'report.json').read_text()) for name,folder in folders.items()}
assert 'cleanup' in reports['diagnostic'], 'Final diagnostic cleanup run must complete first'
for baseline,soft,shader in zip(*(reports[n]['modes'] for n in ['before','after','diagnostic'])):
 assert baseline['geometry']==soft['geometry']==shader['geometry']
 assert shader['material']['diagnostic'] and shader['material']['draws']>0
 assert soft['material']['failed'] and soft['material']['reason']=='software-gpu'
 assert shader['idleDraws']==0

def difference(a,b,roi=None):
 a,b=Image.open(a).convert('RGB'),Image.open(b).convert('RGB');assert a.size==b.size
 if roi:a,b=a.crop(roi),b.crop(roi)
 d=ImageChops.difference(a,b);return {'meanAbsoluteChannelDifference':round(sum(ImageStat.Stat(d).mean)/3,3),'pixelsChangedMoreThan8':sum(max(p)>8 for p in (d.get_flattened_data() if hasattr(d,'get_flattened_data') else d.getdata())),'pixels':d.width*d.height}

measurements=[]
for width in [1920,1650,390]:
 for wallpaper in ['clouds','grid']:
  name=f'dock-{wallpaper}-{width}.png';d=difference(folders['before']/name,folders['after']/name);assert d['meanAbsoluteChannelDifference']>1
  measurements.append({'type':'CSS fallback before/after (NOT proof of refraction)','width':width,'wallpaper':wallpaper,**d})
 # Same rendered product, same shaders/tint/layout: only lens/dispersion/thickness zeroed in isolated host test.
 d=difference(folders['diagnostic']/f'refraction-on-{width}.png',folders['diagnostic']/f'refraction-off-{width}.png',(45,8,345,14));assert d['meanAbsoluteChannelDifference']>1
 measurements.append({'type':'actual product diagnostic WebGL refraction on/off, clear top band excluding icons','width':width,**d})
def luminance(colour):
 values=[v/255 for v in colour];values=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values];return sum(a*b for a,b in zip(values,[.2126,.7152,.0722]))
contrast=[]
for mode in ['after','diagnostic']:
 for width in [1920,1650,390]:
  image=Image.open(folders[mode]/f'island-grid-{width}.png').convert('RGB')
  backgrounds=[luminance(image.getpixel((x,y))) for y in range(8,image.height-14) for x in range(45,image.width-45) if abs(x-image.width/2)>40]
  ratio=(luminance((242,245,243))+.05)/(max(backgrounds)+.05);assert ratio>=4.5
  contrast.append({'mode':mode,'width':width,'minimumSampledRatio':round(ratio,2),'method':'empty material sidebands excluding clock glyphs and outer edge, conservative foreground #f2f5f3; not a whole UI WCAG audit'})
out={'contrastSidebandSamples':contrast,'hardwareAcceptance':False,'pipeline':'actual sandboxed Electron app, isolated host policy, 16384 material pixels per tile; no source patch or getContext spoofing','measurements':measurements,'mask':reports['diagnostic']['mask'],'geometry':'exactly equal before / software fallback / diagnostic for both wallpapers at all three sizes','idle':'zero additional material GPU draws in recorded 650ms settled windows','performance':reports['diagnostic']['modes'][-1]['material'],'retina':reports['diagnostic']['retina'],'privacy':'only public cloud artwork and generated synthetic PNG, synthetic local accounts and notes'}
(root/'glass3-comparison.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({'renderedComparisons':len(measurements),'refractionMAD':[m['meanAbsoluteChannelDifference']for m in measurements if m['type'].startswith('actual')],'mask':out['mask']}))
