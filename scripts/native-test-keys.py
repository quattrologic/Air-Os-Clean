"""XTest input only for this isolated Electron/Xvfb fixture's native folder chooser."""
import ctypes as c, ctypes.util, os, sys, time
if os.environ.get('AIR_GUI_TEST_ISOLATED') != '1':
    raise SystemExit('isolated GUI fixture required')
x=c.CDLL(ctypes.util.find_library('X11')); t=c.CDLL(ctypes.util.find_library('Xtst'))
x.XOpenDisplay.argtypes=[c.c_char_p]; x.XOpenDisplay.restype=c.c_void_p
x.XStringToKeysym.argtypes=[c.c_char_p];x.XStringToKeysym.restype=c.c_ulong
x.XKeysymToKeycode.argtypes=[c.c_void_p,c.c_ulong];x.XKeysymToKeycode.restype=c.c_uint
x.XFlush.argtypes=[c.c_void_p];t.XTestFakeKeyEvent.argtypes=[c.c_void_p,c.c_uint,c.c_int,c.c_ulong]
x.XDefaultRootWindow.argtypes=[c.c_void_p];x.XDefaultRootWindow.restype=c.c_ulong
x.XQueryTree.argtypes=[c.c_void_p,c.c_ulong,c.POINTER(c.c_ulong),c.POINTER(c.c_ulong),c.POINTER(c.POINTER(c.c_ulong)),c.POINTER(c.c_uint)]
x.XFetchName.argtypes=[c.c_void_p,c.c_ulong,c.POINTER(c.c_char_p)]
x.XSetInputFocus.argtypes=[c.c_void_p,c.c_ulong,c.c_int,c.c_ulong]
x.XRaiseWindow.argtypes=[c.c_void_p,c.c_ulong]
x.XFree.argtypes=[c.c_void_p]
d=x.XOpenDisplay(None)
if not d: raise SystemExit('isolated X display unavailable')
titles=[]
def find_dialog(w):
    name=c.c_char_p()
    if x.XFetchName(d,w,c.byref(name)) and name.value:
        title=name.value.decode(errors='replace');x.XFree(name);titles.append(title)
        if 'Ordner' in title and 'Air-OS' in title:return w
    root=c.c_ulong();parent=c.c_ulong();children=c.POINTER(c.c_ulong)();count=c.c_uint()
    if x.XQueryTree(d,w,c.byref(root),c.byref(parent),c.byref(children),c.byref(count)):
        found=None
        for i in range(count.value):
            found=find_dialog(children[i])
            if found:break
        if children:x.XFree(children)
        return found
target=find_dialog(x.XDefaultRootWindow(d))
if not target:raise SystemExit('own Air-OS folder dialog not found; isolated display titles: '+repr(titles))
x.XRaiseWindow(d,target);x.XSetInputFocus(d,target,2,0);x.XFlush(d);time.sleep(.2)
def send(name,down):
    key=x.XKeysymToKeycode(d,x.XStringToKeysym(name.encode()));t.XTestFakeKeyEvent(d,key,down,0);x.XFlush(d)
def key(name):send(name,1);send(name,0)
if sys.argv[1]=='--cancel':
    key('Escape');raise SystemExit(0)
send('Control_L',1);key('l');send('Control_L',0);time.sleep(.2)
for ch in sys.argv[1]:
    shift=ch.isupper() or ch=='_'
    if shift:send('Shift_L',1)
    key({'/':'slash','.':'period','-':'minus','_':'underscore'}.get(ch,ch))
    if shift:send('Shift_L',0)
time.sleep(.2);key('Return');time.sleep(.7);send('Alt_L',1);key('o');send('Alt_L',0)
