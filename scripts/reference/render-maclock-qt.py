"""Own isolated QtQuick window; unmodified MIT MacShell Glass.qml, never native lock/auth.
Requires PySide6 Essentials+Addons 6.8.2.1 in a test-only virtual environment and Xvfb.
Usage: python render-maclock-qt.py control.json output.png [glass|art]
"""
import json, os, shutil, subprocess, sys, tempfile
from pathlib import Path
from PySide6.QtCore import QUrl, QTimer, qInstallMessageHandler, QObject
from PySide6.QtGui import QGuiApplication
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtQuick import QQuickWindow, QSGRendererInterface
root=Path(__file__).resolve().parents[2]
config_path=Path(sys.argv[1]).resolve(); cfg=json.loads(config_path.read_text()); output=Path(sys.argv[2]).resolve(); mode=sys.argv[3] if len(sys.argv)>3 else 'glass'
os.environ.setdefault('QT_SCALE_FACTOR',str(cfg['dpr']))
messages=[]
def message(kind,context,text):
 messages.append(text); print(text,file=sys.stderr)
qInstallMessageHandler(message)
with tempfile.TemporaryDirectory(prefix='air-original-glass-') as directory:
 d=Path(directory); shutil.copyfile(root/'docs/source-ports/maclock-adaptive/Glass.qml',d/'Glass.qml')
 subprocess.run([str(Path(sys.executable).parent/'pyside6-qsb'),'--glsl','100 es,120,150','-o',str(d/'liquidglass.frag.qsb'),str(root/'ipad/vendor/glass/maclock-original.frag')],check=True)
 w,h=cfg['viewport']['width'],cfg['viewport']['height']; g=cfg['glass']; src=QUrl.fromLocalFile(str((config_path.parent/cfg['source']).resolve())).toString()
 if mode=='glass':
  body=f'''Image {{id:background;anchors.fill:parent;source:{json.dumps(src)};smooth:true;mipmap:true}}
  ShaderEffectSource {{id:tex;sourceItem:background;textureSize:Qt.size({cfg['sourceWidth']},{cfg['sourceHeight']});visible:false;mipmap:true;live:false}}
  Glass {{objectName:"original-glass"; x:{g['x']};y:{g['y']};width:{g['width']};height:{g['height']};cornerR:{g['radius']};thickness:26;tint:.48;shadowAmt:.55;src:tex;frame:frame}}'''
 else:
  body=f'''Image {{id:art;anchors.fill:parent;source:{json.dumps(src)};fillMode:Image.PreserveAspectCrop;visible:false;smooth:true;mipmap:true}}
  MultiEffect {{anchors.fill:parent;source:art;scale:1.25;autoPaddingEnabled:false;blurEnabled:true;blurMax:64;blur:1.0;saturation:.25;brightness:-.16}}
  Rectangle {{anchors.fill:parent;gradient:Gradient {{GradientStop {{position:0;color:Qt.rgba(0,0,0,.22)}}GradientStop {{position:.35;color:"transparent"}}GradientStop {{position:.72;color:"transparent"}}GradientStop {{position:1;color:Qt.rgba(0,0,0,.30)}}}}}}'''
 qml=f'''import QtQuick\nimport QtQuick.Window\nimport QtQuick.Effects\nWindow {{width:{w};height:{h};visible:true;color:"#0c0c10";Item {{id:frame;anchors.fill:parent;{body}}}}}'''
 (d/'Reference.qml').write_text(qml);app=QGuiApplication(sys.argv);engine=QQmlApplicationEngine();engine.load(QUrl.fromLocalFile(str(d/'Reference.qml')));result={'engine':'qt6','physicalIPad':False,'synthetic':True,'mode':mode,'qtVersion':'6.8.2.1','fixture':cfg,'checks':[],'errors':[]}
 def save():
  try:
   if not engine.rootObjects(): raise RuntimeError('Qt reference failed to load')
   window=engine.rootObjects()[0]; api=window.rendererInterface().graphicsApi();result['graphicsApi']=str(api)
   if api!=QSGRendererInterface.OpenGL: raise RuntimeError('Original shader requires an actual Qt OpenGL RHI path')
   if mode=='glass' and window.findChild(QObject,'original-glass').property('failed'): raise RuntimeError('Original Glass.qml reports shader failure')
   image=window.grabWindow();expected=(round(w*cfg['dpr']),round(h*cfg['dpr']));actual=(image.width(),image.height())
   if actual!=expected:raise RuntimeError(f'Unexpected reference size {actual}, expected {expected}')
   if any('shader' in m.lower() and any(x in m.lower() for x in ['failed','error']) for m in messages):raise RuntimeError('Native shader warning: '+str(messages))
   output.parent.mkdir(parents=True,exist_ok=True)
   if not image.save(str(output)):raise RuntimeError('Cannot save original Qt reference')
   result['checks']=['actual original QtQuick OpenGL RHI rendering','unmodified MacShell component and original fragment','identical source/viewport/object geometry/DPR'];result['status']='passed';result['size']=actual;app.exit(0)
  except Exception as error:result['status']='failed';result['errors'].append(str(error));app.exit(1)
 QTimer.singleShot(1800,save);code=app.exec();output.with_suffix('.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'status':result.get('status'),'output':str(output),'graphicsApi':result.get('graphicsApi')}));sys.exit(code)
