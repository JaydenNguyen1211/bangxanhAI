/* Kết nối Claude qua máy chủ (/api/claude). Key nằm ở máy chủ, không bao giờ ở trình duyệt.
   Không có key hoặc máy chủ lỗi → mỗi hàm ném {code:"mock"} để giao diện dùng chế độ mô phỏng. */
import { S } from "./core.js";

let health = null;
export async function aiInit(){
  try { const r = await fetch("/api/health"); health = await r.json(); S.aiMode = health.ai ? "live" : "mock"; }
  catch { S.aiMode = "mock"; }
  document.dispatchEvent(new CustomEvent("ai-status"));
  return S.aiMode;
}
export const aiLive = () => S.aiMode === "live";
export const getHealth = () => health;

function toMessages(input){
  if (typeof input === "string") return { messages:[{ role:"user", content:input }] };
  if (Array.isArray(input)) return { messages:input };
  return input;                                   // {system, messages}
}
async function blobToBlock(b){
  const buf = new Uint8Array(await b.arrayBuffer()); let s=""; for (let i=0;i<buf.length;i+=0x8000) s+=String.fromCharCode(...buf.subarray(i,i+0x8000));
  return { type:"image", source:{ type:"base64", media_type:b.type||"image/jpeg", data:btoa(s) } };
}

/** Gọi Claude, nhận chữ theo luồng. opts: {tier:"quick"|"agent"|"default"|"complex", onText(fullText), images:[Blob], signal} */
export async function aiText(input, opts = {}){
  if (!aiLive()) throw { code:"mock" };
  const { system, messages } = toMessages(input);
  const msgs = messages.map(m => ({ ...m }));
  if (opts.images && opts.images.length){
    const last = msgs[msgs.length-1]; const blocks = await Promise.all([...opts.images].map(blobToBlock));
    last.content = [...blocks, { type:"text", text: typeof last.content === "string" ? last.content : "" }];
  }
  S.usage.calls++;
  let r;
  try { r = await fetch("/api/claude", { method:"POST", headers:{ "content-type":"application/json" }, signal:opts.signal,
          body: JSON.stringify({ tier:opts.tier||"default", system, messages:msgs, role:S.user&&S.user.role, max_tokens:opts.maxTokens }) }); }
  catch (e) { throw { code: e && e.name==="AbortError" ? "cancelled" : "network", message:String(e) }; }
  if (!r.ok){
    let e = {}; try { e = await r.json(); } catch {}
    if (e.error === "missing_key"){ S.aiMode = "mock"; document.dispatchEvent(new CustomEvent("ai-status")); throw { code:"mock" }; }
    throw { code: e.error || "upstream_error", message: e.message || ("HTTP " + r.status) };
  }
  const reader = r.body.getReader(), dec = new TextDecoder(); let text = "";
  for (;;){ const { value, done } = await reader.read(); if (done) break; text += dec.decode(value, { stream:true }); if (opts.onText) opts.onText(text); }
  return text;
}

/** Như aiText nhưng trả về giá trị JSON (đọc linh hoạt: cả câu, khối ```json, hoặc đoạn {…}/[…]). */
export async function aiJSON(input, opts = {}){
  const add = "\n\nChỉ trả lời bằng JSON hợp lệ, không thêm chữ nào khác.";
  const inp = typeof input === "string" ? input + add : input;
  const t = await aiText(inp, { ...opts, onText: opts.onProgress ? x => opts.onProgress(x.length) : undefined });
  return parseJSON(t);
}
export function parseJSON(t){
  const s = String(t).trim();
  try { return JSON.parse(s); } catch {}
  const f = s.match(/```(?:json)?\s*([\s\S]*?)```/); if (f){ try { return JSON.parse(f[1]); } catch {} }
  const a = Math.min(...["{","["].map(c => { const i=s.indexOf(c); return i<0?Infinity:i; }));
  const b = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (a < b) { try { return JSON.parse(s.slice(a, b+1)); } catch {} }
  throw { code:"invalid_json", text:s };
}
