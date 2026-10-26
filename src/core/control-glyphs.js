/* Original MacBar.qml Glyph paths, MIT Copyright (c) 2026 Rickky. See third_party/deep-port/LICENSE.
Pinned 1bdb51870b621100fd2709f66c8f8e00ab17b9c4; only twelve CC glyph branches, no logos/assets. */
(function(root){function draw(ctx,kind,color,size=18,level=3,flag=false){ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.scale(size/18,size/18);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';var i2;
            var PI = Math.PI;
            function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); }
            function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
            function poly(p, fill) {
                ctx.beginPath(); ctx.moveTo(p[0], p[1]);
                for (var i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
                if (fill) { ctx.closePath(); ctx.fill(); } else ctx.stroke();
            }
            // filled polygon with rounded corners (radius r), used by the media icons
            function rpoly(p, r) {
                var n = p.length / 2;
                ctx.beginPath();
                ctx.moveTo((p[0] + p[2 * (n - 1)]) / 2, (p[1] + p[2 * (n - 1) + 1]) / 2);
                for (var q = 0; q < n; q++) {
                    var x = p[2 * q], y = p[2 * q + 1];
                    var nx = p[2 * ((q + 1) % n)], ny = p[2 * ((q + 1) % n) + 1];
                    ctx.arcTo(x, y, (x + nx) / 2, (y + ny) / 2, r);
                }
                ctx.closePath(); ctx.fill();
            }
            function rrect(x, y, w, h, r) {
                ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
            }

switch(kind){
case "wifi":{
                var radii = [3.8, 7.2, 10.6];
                for (i2 = 0; i2 < 3; i2++) {
                    if (i2 >= level) ctx.globalAlpha = 0.3; else ctx.globalAlpha = 1;
                    ctx.beginPath(); ctx.arc(9, 14.6, radii[i2], -PI * 0.75, -PI * 0.25); ctx.stroke();
                }
                ctx.globalAlpha = 1;
                circ(9, 14.6, 1.3); ctx.fill();
                if (flag) line(2.5, 2.5, 15.5, 15.5);
            
break;}
case "bluetooth":{
                poly([5, 5.5, 13, 12.5, 9, 16, 9, 2, 13, 5.5, 5, 12.5], false);
                if (flag) line(2.5, 2.5, 15.5, 15.5);
            
break;}
case "airplane":{
                line(9, 1.8, 9, 16.2);
                poly([2, 10.5, 9, 7, 16, 10.5], false);
                poly([6, 15.5, 9, 13.5, 12, 15.5], false);
            
break;}
case "moon":{
                circ(9, 9, 6.8); ctx.fill();
                ctx.globalCompositeOperation = "destination-out";
                circ(12.2, 6.4, 5.6); ctx.fill();
                ctx.globalCompositeOperation = "source-over";
            
break;}
case "sun":{
                var r = 2.2 + level * 0.5, a = r + 2.2, b = a + 1.2 + level * 0.4;
                circ(9, 9, r); ctx.stroke();
                for (i2 = 0; i2 < 8; i2++) {
                    var ang = i2 * PI / 4;
                    line(9 + Math.cos(ang) * a, 9 + Math.sin(ang) * a, 9 + Math.cos(ang) * b, 9 + Math.sin(ang) * b);
                }
            
break;}
case "nightshift":{
                ctx.beginPath(); ctx.arc(9, 11, 4, PI, PI * 2); ctx.stroke();
                line(2, 11, 16, 11);
                line(5.5, 14.5, 12.5, 14.5);
                line(9, 3.2, 9, 5);
                line(3.6, 5.6, 4.9, 6.9);
                line(14.4, 5.6, 13.1, 6.9);
            
break;}
case "coffee":{
                ctx.beginPath(); ctx.moveTo(3.5, 7.5); ctx.lineTo(12, 7.5); ctx.lineTo(12, 11.5);
                ctx.quadraticCurveTo(12, 15, 7.75, 15); ctx.quadraticCurveTo(3.5, 15, 3.5, 11.5); ctx.closePath(); ctx.stroke();
                ctx.beginPath(); ctx.arc(12.4, 10, 2.2, -PI * 0.5, PI * 0.5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(6, 2.6); ctx.quadraticCurveTo(7.2, 4, 6, 5.4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(9.4, 2.6); ctx.quadraticCurveTo(10.6, 4, 9.4, 5.4); ctx.stroke();
            
break;}
case "speaker":{
                poly([2.2, 7, 5.4, 7, 9.2, 3.6, 9.2, 14.4, 5.4, 11, 2.2, 11], true);
                if (level <= 0) {
                    line(12, 6.8, 16, 11.2); line(16, 6.8, 12, 11.2);
                } else {
                    for (i2 = 1; i2 <= Math.min(2, Math.ceil(level / 1.5)); i2++) {
                        ctx.beginPath(); ctx.arc(9.2, 9, 2.4 + i2 * 3.0, -0.62, 0.62); ctx.stroke();
                    }
                }
            
break;}
case "record":{
                circ(9, 9, 7); ctx.stroke();
                circ(9, 9, 3.7); ctx.fill();
            
break;}
case "note":{
                line(7, 12.5, 7, 3.5); line(7, 3.5, 14, 2.2); line(14, 2.2, 14, 11);
                circ(5.2, 13, 2); ctx.fill();
                circ(12.2, 11.6, 2); ctx.fill();
            
break;}
case "contrast":{
                circ(9, 9, 6.5); ctx.stroke();
                ctx.beginPath(); ctx.arc(9, 9, 6.5, -PI / 2, PI / 2, false); ctx.closePath(); ctx.fill();
            
break;}
case "gamepad":{
                // game controller: rounded body, d-pad, two buttons
                ctx.beginPath();
                ctx.moveTo(5, 5); ctx.lineTo(13, 5);
                ctx.bezierCurveTo(16.4, 5, 17.4, 9.5, 16.6, 12.6); ctx.bezierCurveTo(16.1, 14.4, 14.2, 14.6, 13.1, 13.2);
                ctx.lineTo(11.8, 11.6); ctx.lineTo(6.2, 11.6); ctx.lineTo(4.9, 13.2);
                ctx.bezierCurveTo(3.8, 14.6, 1.9, 14.4, 1.4, 12.6); ctx.bezierCurveTo(0.6, 9.5, 1.6, 5, 5, 5);
                ctx.closePath(); ctx.stroke();
                line(5.3, 7.4, 5.3, 10.2); line(3.9, 8.8, 6.7, 8.8);
                circ(12.4, 8.0, 0.9); ctx.fill();
                circ(14.0, 9.6, 0.9); ctx.fill();
            
break;}
}ctx.restore();}
if(typeof module==='object')module.exports={draw};else root.airControlGlyphs={draw};})(typeof window==='object'?window:null);
