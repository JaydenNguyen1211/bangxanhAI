/* Tản Đà AI · gateway.js — mã nguồn, sửa trực tiếp */
import { $, S, esc, ico } from "./core.js";

export const KW = {
  inappropriate:/(bạo lực|vũ khí|hack|cờ bạc|cá độ|18\+|ma túy|xúc phạm)/i,
  cheat:/(giải hộ|làm hộ|viết hộ|đáp án bài kiểm tra|đáp án đề thi|làm bài thay)/i,
  personal:/(bán hàng|chốt đơn|caption|shop|quảng cáo sản phẩm|vợ tôi|chồng tôi|người yêu|đám cưới|tiệc|chứng khoán|crypto|tiền ảo|vay|mua nhà|thơ tặng|lời chúc sinh nhật|du lịch gia đình|thực đơn giảm cân|nấu ăn|công thức nấu|món ăn|xin việc|viết cv|hồ sơ xin việc|phỏng vấn xin việc|ly hôn|giá vàng|giá xăng|lãi suất ngân hàng)/i,
  entertain:/(phim|truyện cười|game|trò chơi điện tử|bóng đá|tỉ số|idol|tiktok|nhạc hot|xem bói|tử vi|cung hoàng đạo|thời tiết|tin tức|thời sự|chính trị|bầu cử)/i
};

export function classifyLocal(text, role){
  if (KW.inappropriate.test(text)) return {purpose:"Không phù hợp", key:"inappropriate", reason:"Nội dung không phù hợp môi trường học đường."};
  if (role==="student" && KW.cheat.test(text)) return {purpose:"Không phù hợp", key:"cheat", reason:"Yêu cầu làm bài hộ, trái quy định học tập."};
  if (KW.personal.test(text)) return {purpose:"Cá nhân", key:"personal", reason:"Việc cá nhân, không phục vụ dạy học."};
  if (KW.entertain.test(text)) return {purpose:"Giải trí", key:"entertain", reason:"Nội dung giải trí."};
  return {purpose: role==="student"?"Học tập":"Chuyên môn", key:"ok", reason: role==="student"?"Phục vụ học tập.":"Phục vụ công việc chuyên môn."};
}

export function decide(cls, role){
  const r = role;
  if (cls.key==="ok") return "allow";
  if (cls.key==="inappropriate"||cls.key==="cheat") return "block";
  const tbl = S.clock==="work" ? S.policy[r] : S.policy.after[r];
  return tbl[cls.key] || "block";
}

export function gate(text, box, onContinue){
  const role=S.user.role, cls=classifyLocal(text, role), d=decide(cls, S.user.kind);
  if (d==="allow") return true;
  S.usage.log.unshift({when:S.clock==="work"?"09:30":"20:15", who:S.user.group, purpose:cls.purpose, action:d==="block"?"Chặn":"Nhắc nhở"});
  if (d==="block"){ S.usage.blocked++; S.usage.byPurpose[cls.purpose]++;
    const scope = role==="student" ? "AI chỉ dùng cho dạy và học." : "Trợ lý AI của trường chỉ hỗ trợ công việc giáo dục (dạy học, soạn tài liệu, hành chính lớp/trường) và từ chối các yêu cầu ngoài phạm vi này.";
    box.innerHTML = `<div class="banner bad">${ico("shield")}<div><b>Yêu cầu bị chặn theo chính sách của trường.</b> ${esc(cls.reason)} ${scope}<div class="xs muted" style="margin-top:4px">Mục đích AI xác định: ${esc(cls.purpose)} · Nếu bị chặn nhầm, bản chính thức có nút “Xin ngoại lệ” gửi tổ trưởng duyệt.</div></div></div>`;
    return false; }
  S.usage.warned++;
  box.innerHTML = `<div class="banner warn">${ico("shield")}<div><b>Nhắc nhở:</b> ${esc(cls.reason)} Trong giờ làm việc, nhà trường khuyến khích dùng AI cho chuyên môn. <button class="btn sm" id="gateGo" style="margin-left:6px">Vẫn tiếp tục</button><div class="xs muted" style="margin-top:4px">Lần dùng này được ghi nhận vào thống kê tổng hợp (không lưu nội dung).</div></div></div>`;
  $("#gateGo").onclick=()=>{ box.innerHTML=""; S.usage.byPurpose[cls.purpose]++; onContinue && onContinue(); };
  return false;
}
