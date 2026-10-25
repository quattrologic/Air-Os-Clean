"""Lossless ICO/ICNS assembly from actual master-SVG Chromium PNG renders."""
from pathlib import Path
import struct,shutil
root=Path(__file__).resolve().parents[1]/'assets/brand'
sizes=[16,32,48,64,128,256];images=[(root/f'png/app-{s}.png').read_bytes() for s in sizes]
offset=6+16*len(sizes);entries=[]
for s,b in zip(sizes,images):
 entries.append(struct.pack('<BBBBHHII',s if s<256 else 0,s if s<256 else 0,0,0,1,32,len(b),offset));offset+=len(b)
(root/'air-os.ico').write_bytes(struct.pack('<HHH',0,1,len(sizes))+b''.join(entries)+b''.join(images))
chunks=[]
for tag,s in [('icp4',16),('icp5',32),('icp6',64),('ic07',128),('ic08',256),('ic09',512),('ic10',1024),('ic11',32),('ic12',64),('ic13',256),('ic14',512)]:
 b=(root/f'png/app-{s}.png').read_bytes();chunks.append(tag.encode()+struct.pack('>I',8+len(b))+b)
b=b''.join(chunks);(root/'air-os.icns').write_bytes(b'icns'+struct.pack('>I',8+len(b))+b)
shutil.copyfile(root/'png/app-180.png',root/'png/apple-touch-icon.png')
print('ICO:6 native PNG entries; ICNS:11 native PNG entries; no resampling')
