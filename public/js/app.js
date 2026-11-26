/* Tản Đà AI · app.js — mã nguồn, sửa trực tiếp */
import { CH, newThread, seedDocs, useThread } from "./agent.js";
import { aiInit } from "./ai.js";
import { A$, asstReset, buildDrawer } from "./assistant.js";
import { $, $$, S, can, go, hooks, ico, setNav } from "./core.js";
import { ACCOUNTS, CODE_PROBLEMS, DAYN } from "./data.js";
import { SEC, todayIdx } from "./teacher.js";
import "./student.js";
import "./english.js";
import "./teacher.js";
import "./admin.js";

/* Khởi động: đăng nhập, menu, thanh trạng thái */
let loginKind="HS";
function setKind(k){
  loginKind=k; $("#segHS").setAttribute("aria-pressed",k==="HS"); $("#segNV").setAttribute("aria-pressed",k==="NV");
  $("#codeLabel").textContent=k==="HS"?"Mã học sinh":"Mã giáo viên"; $("#loginCode").placeholder=k==="HS"?"VD: HS26-0915":"VD: GV-0108";
  $("#codeHint").textContent=k==="HS"?"Mã in trên thẻ học sinh, do phòng giáo vụ cấp.":"Giáo viên dùng mã GV-, nhân viên văn phòng dùng mã NV-, Ban giám hiệu/quản lý dùng mã QT-.";
  $("#loginErr").textContent="";
}
function doLogin(){
  const code=$("#loginCode").value.trim().toUpperCase(), pw=$("#loginPw").value, err=$("#loginErr");
  if (!code){ err.textContent=loginKind==="HS"?"Nhập mã học sinh.":"Nhập mã giáo viên."; return; }
  if (loginKind==="HS" && !/^HS/.test(code)){ err.textContent="Mã học sinh bắt đầu bằng HS. Giáo viên chọn thẻ bên cạnh."; return; }
  if (loginKind==="NV" && /^HS/.test(code)){ err.textContent="Đây là mã học sinh. Chọn thẻ Học sinh để đăng nhập."; return; }
  const acc=ACCOUNTS[code];
  if (!acc){ err.textContent="Không tìm thấy mã này. Kiểm tra lại hoặc dùng tài khoản demo bên dưới."; return; }
  if (pw!=="123456"){ err.textContent="Mật khẩu chưa đúng. Mật khẩu demo là 123456."; return; }
  S.user={ code, ...acc };
  $("#login").hidden=true; $("#app").hidden=false;
  $("#whoName").textContent=acc.name; $("#whoMeta").textContent=acc.meta; $("#whoAvatar").textContent=acc.short;
  $("#crumb").textContent = acc.role==="student" ? "Học sinh · "+acc.group : acc.pos+" · "+acc.group;
  if (acc.role==="staff"){ CH.seeded=null; seedDocs(); CH.general=newThread("doc"); useThread(CH.general); A$.userClosed=false; }
  go(acc.role==="student" ? "s-home" : can("teach") ? "t-home" : "doc");
}
function navFor(){
  if (!S.user) return [];
  if (S.user.role==="student") return [["","Học tập"],["s-home","Trang chủ","home"],["math","Toán","sigma"],["code","Tin học","code"],["aiedu","Trí tuệ nhân tạo","brain"],["english","Tiếng Anh","globe"]];
  const nav=[["","Công việc"],["t-home","Tổng quan","home"],["","Soạn với AI"],["doc","Tài liệu","doc"]];
  if (can("teach")) nav.push(["design","Slide bài giảng","palette"],["exam","Đề kiểm tra","exam"],["","Dạy học"],["class","Lớp học & 4 môn","users"],["hw","Chấm bài về nhà","edit"]);
  if (can("teach")) nav.push(["","Quản lý nội bộ"],["a-leave","Xin nghỉ & dạy thay","clock"],["a-profile","Tài liệu tổ","folder"]);
  if (can("teach")) nav.push(["","Tự động hóa AI"],["a-skills","Kỹ năng của AI","bulb"],["a-flows","Quy trình nhiều bước","gauge"]);
  if (can("admin")) nav.push(["","Quản trị AI"],["a-dash","Báo cáo sử dụng AI","chart"],["a-policy","Chính sách sử dụng","shield"],["a-classify","Thử phân loại","filter"],["a-quota","Model & hạn mức","gauge"]);
  return nav;
}
function renderChips(){
  const a=$("#aiChip"), c=$("#clockChip"); if(!a) return;
  if (S.aiMode==="live"){ a.className="chip good"; a.innerHTML='<span class="dot"></span>AI đang hoạt động'; a.title="Gọi AI qua máy chủ của trường"; }
  else if (S.aiMode==="mock"){ a.className="chip warn"; a.innerHTML='<span class="dot"></span>AI mô phỏng'; a.title="Chưa có API key trong config.js, đang dùng nội dung mẫu"; }
  else { a.className="chip"; a.innerHTML='<span class="dot"></span>AI: đang kết nối'; }
  const di=todayIdx(), dn=di<0?"Chủ nhật":DAYN[di];
  c.className="chip "+(S.clock==="work"?"info":"");
  c.innerHTML=ico("clock")+(S.clock==="work"?`Giờ học · ${dn}`:`Ngoài giờ · ${dn}`);
}

/* ---------- khởi động ---------- */
S.codeProblems = CODE_PROBLEMS;
setNav(navFor);
buildDrawer();
$("#segHS").onclick=()=>setKind("HS"); $("#segNV").onclick=()=>setKind("NV");
$$("[data-demo]").forEach(b=>b.onclick=()=>{ if (b.disabled) return; const c=b.dataset.demo; setKind(c.startsWith("HS")?"HS":"NV"); $("#loginCode").value=c; $("#loginPw").value="123456"; $("#loginBtn").focus(); });
$("#loginBtn").addEventListener("click",doLogin);
["#loginCode","#loginPw"].forEach(s=>$(s).addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); doLogin(); } }));
$("#logout").onclick=()=>{ try{ speechSynthesis.cancel(); }catch(e){} Object.values(SEC).forEach(s=>s.mode="home"); asstReset(); S.user=null; $("#app").hidden=true; $("#login").hidden=false; $("#loginPw").value=""; };
hooks.afterGo.push(renderChips);
document.addEventListener("ai-status", renderChips);
aiInit();

