/* Tản Đà AI · files.js — mã nguồn, sửa trực tiếp */
import { ri } from "./content.js";
import { $, slug, toast } from "./core.js";

export const CRC = (()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;} return t; })();

export const crc32 = b => { let c=0xFFFFFFFF; for (let i=0;i<b.length;i++) c=CRC[(c^b[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };

export function zipStore(files){ // files: [{name, data:Uint8Array}]
  const enc=new TextEncoder(), parts=[], central=[]; let off=0;
  for (const f of files){
    const nm=enc.encode(f.name), d=f.data, crc=crc32(d);
    const h=new DataView(new ArrayBuffer(30)); h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(8,0,true); h.setUint16(10,0,true); h.setUint16(12,0x21,true); h.setUint32(14,crc,true); h.setUint32(18,d.length,true); h.setUint32(22,d.length,true); h.setUint16(26,nm.length,true); h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer), nm, d);
    const c=new DataView(new ArrayBuffer(46)); c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint16(10,0,true); c.setUint16(12,0,true); c.setUint16(14,0x21,true); c.setUint32(16,crc,true); c.setUint32(20,d.length,true); c.setUint32(24,d.length,true); c.setUint16(28,nm.length,true); c.setUint32(42,off,true);
    central.push(new Uint8Array(c.buffer), nm); off += 30+nm.length+d.length;
  }
  const csize=central.reduce((a,b)=>a+b.length,0);
  const e=new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,csize,true); e.setUint32(16,off,true);
  return new Blob([...parts,...central,new Uint8Array(e.buffer)]);
}

export const xe = s => String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

export function wRun(t,{b,i,sz}={}){ return `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${b?"<w:b/>":""}${i?"<w:i/>":""}<w:sz w:val="${sz||26}"/></w:rPr><w:t xml:space="preserve">${xe(t)}</w:t></w:r>`; }

export function wPara(t,o={}){ return `<w:p><w:pPr>${o.center?'<w:jc w:val="center"/>':'<w:jc w:val="both"/>'}<w:spacing w:before="${o.before||0}" w:after="80"/>${o.ind?'<w:ind w:left="360"/>':""}</w:pPr>${wRun(t,o)}</w:p>`; }

export function wTable(rows){ const cols=rows[0].length, w=Math.floor(9000/cols);
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>${["top","left","bottom","right","insideH","insideV"].map(s=>`<w:${s} w:val="single" w:sz="4" w:space="0" w:color="444444"/>`).join("")}</w:tblBorders></w:tblPr><w:tblGrid>${Array(cols).fill(`<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>`+
  rows.map((r,ri)=>`<w:tr>${r.map(c=>`<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr>${String(c).split("\n").map(line=>`<w:p>${wRun(line,{b:ri===0,sz:24})}</w:p>`).join("")}</w:tc>`).join("")}</w:tr>`).join("")+`</w:tbl><w:p/>`; }

export function makeDocx(blocks){ // [{t:'h1'|'h2'|'h3'|'p'|'li'|'center'|'table', text, rows}]
  const body = blocks.map(b=>{
    if (b.t==="h1") return wPara(b.text,{b:1,center:1,sz:28,before:120});
    if (b.t==="center") return wPara(b.text,{center:1,i:b.i,b:b.b});
    if (b.t==="h2") return wPara(b.text,{b:1,before:160});
    if (b.t==="h3") return wPara(b.text,{b:1,i:1,before:80});
    if (b.t==="li") return wPara("– "+b.text,{ind:1});
    if (b.t==="table") return wTable(b.rows);
    return wPara(b.text,{b:b.b});
  }).join("");
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const enc=new TextEncoder();
  return zipStore([
    {name:"[Content_Types].xml", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`)},
    {name:"_rels/.rels", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`)},
    {name:"word/document.xml", data:enc.encode(doc)}
  ]);
}

export async function unzipText(buf, filter){ // returns {name: text}
  const u=new Uint8Array(buf), dv=new DataView(buf); let e=-1;
  for (let i=u.length-22;i>=Math.max(0,u.length-70000);i--) if (dv.getUint32(i,true)===0x06054b50){e=i;break;}
  if (e<0) throw new Error("Không đọc được file (không phải định dạng Office).");
  const n=dv.getUint16(e+10,true); let p=dv.getUint32(e+16,true); const out={}; const dec=new TextDecoder();
  for (let k=0;k<n;k++){
    const method=dv.getUint16(p+10,true), csz=dv.getUint32(p+20,true), nl=dv.getUint16(p+28,true), xl=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true), lo=dv.getUint32(p+42,true);
    const name=dec.decode(u.slice(p+46,p+46+nl)); p+=46+nl+xl+cl;
    if (!filter(name)) continue;
    const start=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true); const raw=u.slice(start,start+csz);
    if (method===0) out[name]=dec.decode(raw);
    else if (method===8){ const ds=new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw")); out[name]=await new Response(ds).text(); }
  }
  return out;
}

export const unxml = s => s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&");

export async function readOffice(file){
  const buf=await file.arrayBuffer(), name=file.name.toLowerCase();
  if (name.endsWith(".docx")){ const f=await unzipText(buf, n=>n==="word/document.xml"); const x=f["word/document.xml"]||"";
    return x.split(/<\/w:p>/).map(p=>unxml((p.match(/<w:t[^>]*>[^<]*<\/w:t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,"")).join(""))).filter(s=>s.trim()); }
  if (name.endsWith(".pptx")){ const f=await unzipText(buf, n=>/^ppt\/slides\/slide\d+\.xml$/.test(n));
    return Object.keys(f).sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/))).flatMap((k,i)=>[`[Slide ${i+1}]`, ...f[k].split(/<\/a:p>/).map(p=>unxml((p.match(/<a:t>[^<]*<\/a:t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,"")).join(""))).filter(s=>s.trim())]); }
  if (/\.(txt|md|csv)$/.test(name)) return (await file.text()).split(/\r?\n/).filter(s=>s.trim());
  throw new Error("Bản demo đọc được .docx, .pptx, .txt. PDF sẽ hỗ trợ ở bản chính thức.");
}

export function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=()=>rej(new Error("load "+src)); document.head.appendChild(s); }); }

/* Tải file về máy */
export function saveFile(filename, blob){
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast("Đã tải "+filename);
}
/* Xuất PowerPoint từ danh sách slide [{title, bullets, note, quiz?, layout?}] */
export async function exportPptx(slides, theme, title){
  try{
    if (!window.PptxGenJS) await loadScript("/vendor/pptxgen.bundle.js");
    const p=new PptxGenJS(); p.layout="LAYOUT_16x9";
    const T={"th-board":{bg:"0E4A3D",title:"F2B233",ink:"F3F7F5"},"th-sun":{bg:"FFF8E6",title:"B86E00",ink:"2B2410"},"th-clean":{bg:"FFFFFF",title:"175E82",ink:"1C2421"}}[theme]||{bg:"0E4A3D",title:"F2B233",ink:"F3F7F5"};
    slides.forEach(x=>{ const sl=p.addSlide(); sl.background={color:T.bg};
      if (theme==="th-sun") sl.addShape(p.ShapeType.rect,{x:0,y:0,w:0.4,h:5.625,fill:{color:"F2B233"}});
      const isTitle=x.layout==="title";
      sl.addText(x.title||"",{x:0.6,y:isTitle?1.6:0.4,w:8.8,h:1,fontSize:isTitle?36:28,bold:true,color:T.title,fontFace:"Arial"});
      if (x.quiz){ sl.addText(x.quiz.q||"",{x:0.6,y:1.4,w:8.8,h:1,fontSize:22,color:T.ink}); (x.quiz.opts||[]).forEach((o,j)=>sl.addText("ABCD"[j]+". "+o,{x:0.6+(j%2)*4.4,y:2.6+Math.floor(j/2),w:4.2,h:0.8,fontSize:20,color:T.ink,bold:j===x.quiz.ans})); }
      else sl.addText((x.bullets||[]).map(t=>({text:t,options:{bullet:!isTitle,breakLine:true}})),{x:0.6,y:isTitle?2.7:1.5,w:8.8,h:3.4,fontSize:isTitle?18:22,color:T.ink,valign:"top",fontFace:"Arial"});
      if (x.note) sl.addNotes(x.note); });
    saveFile(slug(title)+".pptx", await p.write({outputType:"blob"}));
  }catch(e){ console.error(e); toast("Không tạo được file PowerPoint."); }
}

