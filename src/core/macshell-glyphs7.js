/* MIT Rickky2026; original generic WGlyph.qml paths; third_party/tahoe7. */
(function(root){function draw(ctx,kind,color="white",size=18,level=3,flag=false){ctx.save();ctx.scale(size/18,size/18);ctx.strokeStyle=ctx.fillStyle=color;ctx.lineWidth=1.5;ctx.lineCap=ctx.lineJoin="round";const PI=Math.PI;let i2;
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
if(kind==="moon") {
            circ(9, 9, 6.8); ctx.fill();
            ctx.globalCompositeOperation = "destination-out";
            circ(12.2, 6.4, 5.6); ctx.fill();
            ctx.globalCompositeOperation = "source-over";
        }
else if(kind==="speaker") {
            poly([2.2, 7, 5.4, 7, 9.2, 3.6, 9.2, 14.4, 5.4, 11, 2.2, 11], true);
            if (level <= 0) {
                line(12, 6.8, 16, 11.2); line(16, 6.8, 12, 11.2);
            } else {
                for (i2 = 1; i2 <= Math.min(2, Math.ceil(level / 1.5)); i2++) {
                    ctx.beginPath(); ctx.arc(9.2, 9, 2.4 + i2 * 3.0, -0.62, 0.62); ctx.stroke();
                }
            }
        }
else if(kind==="folder") {
            ctx.beginPath();
            ctx.moveTo(2.2, 13);
            ctx.lineTo(2.2, 5.6);
            ctx.arcTo(2.2, 3.8, 4, 3.8, 1.8);
            ctx.lineTo(6.6, 3.8);
            ctx.lineTo(8.2, 5.8);
            ctx.lineTo(14, 5.8);
            ctx.arcTo(15.8, 5.8, 15.8, 7.6, 1.8);
            ctx.lineTo(15.8, 13);
            ctx.arcTo(15.8, 15.2, 13.6, 15.2, 2.2);
            ctx.lineTo(4.4, 15.2);
            ctx.arcTo(2.2, 15.2, 2.2, 13, 2.2);
            ctx.closePath(); ctx.stroke();
        }
else if(kind==="layers") {
            ctx.beginPath(); ctx.moveTo(9, 2.4); ctx.lineTo(15.6, 5.8); ctx.lineTo(9, 9.2); ctx.lineTo(2.4, 5.8); ctx.closePath(); ctx.stroke();
            poly([2.4, 9.2, 9, 12.6, 15.6, 9.2], false);
            poly([2.4, 12.4, 9, 15.8, 15.6, 12.4], false);
        }
else if(kind==="clipboard") {
            rrect(3.6, 3.4, 10.8, 12.6, 2); ctx.stroke();
            rrect(6.4, 1.9, 5.2, 3.4, 1.2); ctx.stroke();
            line(6.4, 9, 11.6, 9);
            line(6.4, 12, 10, 12);
        }
else if(kind==="lock") {
            rrect(3.6, 8, 10.8, 7.8, 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(6, 8); ctx.lineTo(6, 6); ctx.arc(9, 6, 3, PI, 0, false); ctx.lineTo(12, 8); ctx.stroke();
        }
else if(kind==="close") {
            line(5, 5, 13, 13); line(13, 5, 5, 13);
        }
else if(kind==="gear") {
            circ(9, 9, 2.6); ctx.stroke();
            for (i2 = 0; i2 < 8; i2++) {
                var g2 = i2 * PI / 4;
                line(9 + Math.cos(g2) * 5.6, 9 + Math.sin(g2) * 5.6, 9 + Math.cos(g2) * 7.6, 9 + Math.sin(g2) * 7.6);
            }
            circ(9, 9, 5.6); ctx.stroke();
        }
ctx.restore();}
if(typeof module==="object")module.exports={draw};else root.airWGlyphs={draw};})(typeof window==="object"?window:null);
