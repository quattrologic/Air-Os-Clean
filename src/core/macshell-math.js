/* MacBar.qml calcValue, MIT Copyright (c) 2026 Rickky; input bounded to protect parser stack. */
(function(root){
    function calcValue(expr) {
        if(String(expr||" ").length>256)return null; var t=String(expr || "").replace(/[xX×]/g, "*").replace(/÷/g, "/");
        if (!/^[0-9+\-*/%.()\s]+$/.test(t) || !/[0-9]/.test(t)) return null;
        var i=0;
        function ws(){ while(i<t.length && /\s/.test(t[i])) i++; }
        function atom(){ ws(); if(t[i]==="+"){i++;return atom();} if(t[i]==="-"){i++;return -atom();} if(t[i]==="("){i++;var v=sum();ws();if(t[i]!==")")throw 0;i++;return v;} var m=t.substring(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw 0;i+=m[0].length;return Number(m[0]); }
        function term(){ var v=atom(); for(;;){ws();var op=t[i];if(op!=="*"&&op!=="/"&&op!=="%")break;i++;var r=atom();if((op==="/"||op==="%")&&r===0)throw 0;v=op==="*"?v*r:(op==="/"?v/r:v%r);}return v; }
        function sum(){var v=term();for(;;){ws();var op=t[i];if(op!=="+"&&op!=="-")break;i++;var r=term();v=op==="+"?v+r:v-r;}return v;}
        try { var v=sum(); ws(); return i===t.length && isFinite(v) ? v : null; } catch(e){ return null; }
    }

const ccCatalog=Object.freeze([{"id": "wifi", "label": "Wi-Fi", "glyph": "wifi", "w": 2, "h": 1}, {"id": "bluetooth", "label": "Bluetooth", "glyph": "bluetooth", "w": 2, "h": 1}, {"id": "airplane", "label": "Airplane Mode", "glyph": "airplane", "w": 1, "h": 1}, {"id": "focus", "label": "Focus", "glyph": "moon", "w": 2, "h": 1}, {"id": "nightshift", "label": "Night Shift", "glyph": "nightshift", "w": 1, "h": 1}, {"id": "keepawake", "label": "Keep Awake", "glyph": "coffee", "w": 1, "h": 1}, {"id": "darkmode", "label": "Dark Mode", "glyph": "contrast", "w": 1, "h": 1}, {"id": "gaming", "label": "Game Mode", "glyph": "gamepad", "w": 2, "h": 1}, {"id": "record", "label": "Screen Recording", "glyph": "record", "w": 2, "h": 1}, {"id": "nowplaying", "label": "Now Playing", "glyph": "note", "w": 2, "h": 2}, {"id": "display", "label": "Display", "glyph": "sun", "w": 4, "h": 1}, {"id": "sound", "label": "Sound", "glyph": "speaker", "w": 4, "h": 1}].map(Object.freeze));
const ccDefault=Object.freeze(["wifi","nowplaying","bluetooth","airplane","focus","record","nightshift","keepawake","display","sound"]);
const ccCellH=66,ccGap=6,ccSliderGap=10;const ccDef=id=>ccCatalog.find(d=>d.id===id)||(Number.isInteger(id)&&id>=0&&id<4?{id,w:2,h:1}:null);
    function ccLayout(ids) {
        var cols = 4, occ = [], out = [], seen = {}, rows = 0;
        function isFree(r, c, w, h) {
            for (var y = r; y < r + h; y++) for (var x = c; x < c + w; x++) if (occ[y] && occ[y][x]) return false;
            return true;
        }
        function mark(r, c, w, h) {
            for (var y = r; y < r + h; y++) { if (!occ[y]) occ[y] = []; for (var x = c; x < c + w; x++) occ[y][x] = true; }
        }
        for (var i = 0; i < ids.length; i++) {
            var d = ccDef(ids[i]);
            if (!d || seen[d.id]) continue;
            seen[d.id] = true;
            var placed = false;
            for (var r = 0; !placed; r++) {
                for (var c = 0; c + d.w <= cols; c++) {
                    if (isFree(r, c, d.w, d.h)) {
                        mark(r, c, d.w, d.h);
                        out.push({ id: d.id, col: c, row: r, w: d.w, h: d.h });
                        rows = Math.max(rows, r + d.h);
                        placed = true;
                        break;
                    }
                }
            }
        }
        // pixel layout: tiles sit ccGap apart; the two slider tiles (Display, Sound) keep the wider ccSliderGap around them
        var sliderRow = [], ys = [];
        for (var k = 0; k < out.length; k++) {
            if (out[k].id === "display" || out[k].id === "sound")
                for (var rr = out[k].row; rr < out[k].row + out[k].h; rr++) sliderRow[rr] = true;
        }
        for (var r2 = 0; r2 < rows; r2++)
            ys[r2] = r2 === 0 ? 0 : ys[r2 - 1] + ccCellH + ((sliderRow[r2] || sliderRow[r2 - 1]) ? ccSliderGap : ccGap);
        for (var m = 0; m < out.length; m++) {
            out[m].y = ys[out[m].row];
            out[m].hpx = ys[out[m].row + out[m].h - 1] + ccCellH - ys[out[m].row];
        }
        return { items: out, rows: rows, total: rows > 0 ? ys[rows - 1] + ccCellH : 0 };
    }

function clockTime(now){var hour=now.getHours()%12;if(hour===0)hour=12;return hour+':'+('0'+now.getMinutes()).slice(-2);}
if(typeof module==='object')module.exports={calcValue,ccLayout,clockTime,ccCatalog,ccDefault};else root.airMacShellMath={calcValue,ccLayout,clockTime,ccCatalog,ccDefault};})(typeof window==='object'?window:null);
