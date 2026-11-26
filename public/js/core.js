/* Lõi: tiện ích DOM, trạng thái chung, bộ định tuyến */
export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const ico = n => `<svg class="i"><use href="#i-${n}"/></svg>`;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const clone = o => JSON.parse(JSON.stringify(o));
export const uid = () => Math.random().toString(36).slice(2, 9);
export const nowHM = () => { const d=new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
export const today = () => { const d=new Date(); return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0"); };
export const shorten = (t,n=12) => { const w=String(t).replace(/^[–\-•]\s*/,"").split(/\s+/); return w.length>n ? w.slice(0,n).join(" ")+"…" : w.join(" "); };
export const slug = s => String(s||"tai-lieu").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").toLowerCase().slice(0,60) || "tai-lieu";
export function toast(t){ const el=$("#toast"); el.textContent=t; el.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>el.hidden=true, 2800); }
export function loading(t){ return `<div class="row muted small"><div class="spin"></div><span>${esc(t)}</span></div>`; }

/* ---------- trạng thái chung ---------- */
export const S = {
  user: null, view: null,
  aiMode: "checking",                         // checking | live | mock
  clock: "work",                              // mô phỏng khung giờ: work | after
  policy: { teacher:{personal:"block", entertain:"block"}, student:{personal:"block", entertain:"block"}, staff:{personal:"block", entertain:"block"},
            after:{ teacher:{personal:"block",entertain:"block"}, student:{personal:"warn",entertain:"block"}, staff:{personal:"block",entertain:"block"} } },
  cls: { classroom:{ math:false, code:false, ai:false }, exam:false, allowSolve:false },
  usage: { calls:0, blocked:0, warned:0, byPurpose:{}, log:[] },
  skills: [],
  flows: [{ id:"flow-mau", name:"Chuẩn bị bài dạy mới", desc:"Soạn đầy đủ cho một bài dạy mới, từ giáo án đến slide và đề kiểm tra ngắn — mẫu để tham khảo cách viết.",
    steps:["Soạn giáo án chi tiết cho bài học, bám theo khung chương trình hiện hành.","Từ giáo án vừa soạn, làm slide bài giảng súc tích, có ví dụ minh họa.","Ra đề kiểm tra 15 phút bám sát nội dung bài học, kèm đáp án."] }],
  leaves: [],
  qbank: 214
};
export const can = p => !!(S.user && S.user.perms && S.user.perms.includes(p));
export const honor = () => { const m=String(S.user&&S.user.name||"").match(/^(Thầy|Cô|Chị|Anh)\s/); return m ? m[1].toLowerCase() : "bạn"; };
export const Honor = () => { const h=honor(); return h[0].toUpperCase()+h.slice(1); };

/* ---------- định tuyến ---------- */
export const VIEWS = {};          // id → (container) => void
export const TITLES = {};         // id → tiêu đề trang
export const hooks = { beforeGo: [], afterGo: [] };
let navProvider = () => [];
export function setNav(fn){ navProvider = fn; }

export function go(v){
  for (const h of hooks.beforeGo){ const r=h(v); if (r) v=r; }
  if (!VIEWS[v]) v = S.user && S.user.role==="student" ? "s-home" : "t-home";
  S.view = v;
  $("#nav").innerHTML = navProvider().map(([id,label,icon,ext])=>{
    if (!id) return `<div class="sec">${label}</div>`;
    if (ext) return `<a href="${ext}" target="_blank" rel="noopener">${ico(icon)}<span>${label}</span></a>`;
    return `<button data-go="${id}" ${id===v?'aria-current="page"':""}>${ico(icon)}<span>${label}</span></button>`;
  }).join("");
  const view=$("#view"); view.innerHTML=""; view.classList.remove("full");
  $("#viewTitle").textContent = typeof TITLES[v]==="function" ? TITLES[v]() : (TITLES[v]||"");
  VIEWS[v](view);
  for (const h of hooks.afterGo) h(v);
  if (!view.classList.contains("full")) window.scrollTo(0,0);
}
document.addEventListener("click", e => { const b=e.target.closest("[data-go]"); if (b){ e.preventDefault(); go(b.dataset.go); } });
