/* MacBar.qml Glyph search/cc/bell branches, MIT Copyright (c) 2026 Rickky.
 * Original path commands unchanged; Qt Canvas reset/requestPaint -> event-driven HTML Canvas.
 * Notice, source SHA and extraction hashes: third_party/tahoe6/. */
(function(root){function draw(ctx,kind,color='#f5f5f7'){const PI=Math.PI;ctx.strokeStyle=ctx.fillStyle=color;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,PI*2);}
function line(x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
            function rrect(x, y, w, h, r) {
                ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
            }
if(kind==="search") {
                circ(7.6, 7.6, 4.8); ctx.stroke();
                line(11.2, 11.2, 15.4, 15.4);}
else if(kind==="cc") {
                rrect(2, 3, 14, 5.2, 2.6); ctx.stroke();
                circ(12.4, 5.6, 1.5); ctx.fill();
                rrect(2, 9.8, 14, 5.2, 2.6); ctx.stroke();
                circ(5.6, 12.4, 1.5); ctx.fill();}
else if(kind==="bell") {
                ctx.beginPath(); ctx.moveTo(3.4, 12.9);
                ctx.bezierCurveTo(4.6, 11.8, 5.0, 10.6, 5.0, 8.2);
                ctx.bezierCurveTo(5.0, 5.6, 6.8, 3.9, 9.0, 3.9);
                ctx.bezierCurveTo(11.2, 3.9, 13.0, 5.6, 13.0, 8.2);
                ctx.bezierCurveTo(13.0, 10.6, 13.4, 11.8, 14.6, 12.9);
                ctx.closePath(); ctx.stroke();
                line(9, 2.2, 9, 3.9);
                ctx.beginPath(); ctx.arc(9, 14.3, 1.7, 0.25, PI - 0.25); ctx.stroke();}
}
if(typeof module==='object')module.exports={draw};else root.airTahoe6Glyphs={draw};})(typeof window==='object'?window:null);
