import sharp from "sharp";
function lin(v){const c=v/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;}
const p="docs/phase10-baseline/section-9/after/live-sphere-strip-32.png";
const meta=await sharp(p).metadata();
const order=["ASML","GOOG","COST","MSFT","INTC","IBM","CBRS","NBIS"];
console.log("strip:",meta.width+"x"+meta.height,"tiles:",meta.width/32);
const raw=await sharp(p).removeAlpha().raw().toBuffer();
const W=meta.width;
const rows=[];
for(let t=0;t<meta.width/32;t++){
  const L=[];
  for(let y=11;y<=20;y++) for(let x=5;x<=26;x++){
    const px=t*32+x; const o=(y*W+px)*3;
    L.push(0.2126*lin(raw[o])+0.7152*lin(raw[o+1])+0.0722*lin(raw[o+2]));
  }
  const m=L.reduce((s,v)=>s+v,0)/L.length;
  rows.push({tile:t,ticker:order[t]??"?",equatorialMean:Number(m.toFixed(4)),inWindow:m>=0.16&&m<=0.55});
}
console.table(rows);
