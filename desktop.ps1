# Tản Đà AI – cầu nối điều khiển máy tính (Windows) cho tính năng computer-use.
# computer.js chạy file này 1 lần rồi giữ tiến trình sống: mỗi dòng stdin là 1 lệnh JSON,
# mỗi dòng stdout là 1 kết quả JSON {"id":..,"ok":true|false,...}. Tọa độ ở đây là pixel THẬT
# của màn hình chính; việc quy đổi từ ảnh đã thu nhỏ do computer.js làm.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.IO;
using System.Threading;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

public static class Desk {
  [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] static extern int GetSystemMetrics(int i);
  [DllImport("user32.dll")] static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] static extern bool GetCursorPos(out POINT p);
  [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint n, INPUT[] inputs, int size);

  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public InputUnion u; }
  [StructLayout(LayoutKind.Explicit)] struct InputUnion { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
  [StructLayout(LayoutKind.Sequential)] struct MOUSEINPUT { public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr dwExtraInfo; }
  [StructLayout(LayoutKind.Sequential)] struct KEYBDINPUT { public ushort wVk, wScan; public uint dwFlags, time; public IntPtr dwExtraInfo; }

  const uint INPUT_MOUSE = 0, INPUT_KEYBOARD = 1;
  const uint KEYUP = 0x2, EXTENDED = 0x1, UNICODE = 0x4;
  const uint WHEEL = 0x800, HWHEEL = 0x1000;

  public static int W, H;
  public static void Init(){ SetProcessDPIAware(); W = GetSystemMetrics(0); H = GetSystemMetrics(1); }

  static void Send(INPUT i){
    if (SendInput(1, new[]{ i }, Marshal.SizeOf(typeof(INPUT))) == 0)
      throw new Exception("SendInput bị chặn (cửa sổ đang chạy quyền Administrator hoặc màn hình đang khóa?)");
  }
  static void Mouse(uint flags, uint data){ var i = new INPUT{ type = INPUT_MOUSE }; i.u.mi.dwFlags = flags; i.u.mi.mouseData = data; Send(i); }
  static bool IsExt(int vk){ return (vk >= 0x21 && vk <= 0x28) || vk == 0x2D || vk == 0x2E || vk == 0x5B || vk == 0x5C || vk == 0x5D || vk == 0x2C || vk == 0x6F || vk == 0x90; }
  static void Key(int vk, bool up){
    var i = new INPUT{ type = INPUT_KEYBOARD }; i.u.ki.wVk = (ushort)vk;
    i.u.ki.dwFlags = (up ? KEYUP : 0) | (IsExt(vk) ? EXTENDED : 0); Send(i);
  }
  static void Down(int[] vks){ if (vks != null) foreach (var k in vks) Key(k, false); }
  static void Up(int[] vks){ if (vks != null) for (int j = vks.Length - 1; j >= 0; j--) Key(vks[j], true); }
  static uint BtnFlag(string b, bool up){
    if (b == "right") return up ? 0x10u : 0x08u;
    if (b == "middle") return up ? 0x40u : 0x20u;
    return up ? 0x04u : 0x02u;
  }

  // Chụp vùng (x,y,w,h) của màn hình rồi thu về đúng tw×th, trả PNG base64.
  public static string Shot(int x, int y, int w, int h, int tw, int th){
    using (var src = new Bitmap(w, h, PixelFormat.Format24bppRgb)){
      using (var g = Graphics.FromImage(src)) g.CopyFromScreen(x, y, 0, 0, new Size(w, h));
      using (var dst = new Bitmap(tw, th, PixelFormat.Format24bppRgb)){
        using (var g = Graphics.FromImage(dst)){ g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.DrawImage(src, 0, 0, tw, th); }
        using (var ms = new MemoryStream()){ dst.Save(ms, ImageFormat.Png); return Convert.ToBase64String(ms.ToArray()); }
      }
    }
  }
  public static void Move(int x, int y){ SetCursorPos(x, y); }
  public static string Cursor(){ POINT p; GetCursorPos(out p); return "\"x\":" + p.X + ",\"y\":" + p.Y; }
  public static void Click(int x, int y, string btn, int n, int[] mods){
    if (x >= 0) { SetCursorPos(x, y); Thread.Sleep(30); }
    Down(mods);
    try { for (int k = 0; k < n; k++){ Mouse(BtnFlag(btn, false), 0); Mouse(BtnFlag(btn, true), 0); Thread.Sleep(40); } }
    finally { Up(mods); }
  }
  public static void Button(string btn, bool up){ Mouse(BtnFlag(btn, up), 0); }
  public static void Drag(int x0, int y0, int x1, int y1, int[] mods){
    SetCursorPos(x0, y0); Thread.Sleep(30); Down(mods);
    try {
      Mouse(BtnFlag("left", false), 0);
      for (int s = 1; s <= 20; s++){ SetCursorPos(x0 + (x1 - x0) * s / 20, y0 + (y1 - y0) * s / 20); Thread.Sleep(10); }
      Mouse(BtnFlag("left", true), 0);
    } finally { Up(mods); }
  }
  public static void Scroll(int x, int y, string dir, int amount, int[] mods){
    if (x >= 0) { SetCursorPos(x, y); Thread.Sleep(30); }
    Down(mods);
    try {
      for (int k = 0; k < amount; k++){
        if (dir == "up") Mouse(WHEEL, 120); else if (dir == "down") Mouse(WHEEL, unchecked((uint)-120));
        else if (dir == "right") Mouse(HWHEEL, 120); else Mouse(HWHEEL, unchecked((uint)-120));
        Thread.Sleep(20);
      }
    } finally { Up(mods); }
  }
  public static void Keys(int[] vks, int repeat){ for (int k = 0; k < repeat; k++){ Down(vks); Thread.Sleep(20); Up(vks); Thread.Sleep(30); } }
  public static void Hold(int[] vks, int ms){ Down(vks); try { Thread.Sleep(ms); } finally { Up(vks); } }
  // Gõ chữ bằng KEYEVENTF_UNICODE: gõ được tiếng Việt có dấu, không phụ thuộc bộ gõ/bàn phím đang chọn.
  public static void Type(string text){
    foreach (char c in text){
      if (c == '\r') continue;
      if (c == '\n'){ Key(0x0D, false); Key(0x0D, true); }
      else {
        var i = new INPUT{ type = INPUT_KEYBOARD }; i.u.ki.wScan = c; i.u.ki.dwFlags = UNICODE; Send(i);
        i.u.ki.dwFlags = UNICODE | KEYUP; Send(i);
      }
      Thread.Sleep(8);
    }
  }
}
'@

[Desk]::Init()
[Console]::Out.WriteLine('{"ready":true,"w":' + [Desk]::W + ',"h":' + [Desk]::H + '}')
[Console]::Out.Flush()

while ($true) {
  $line = [Console]::In.ReadLine()
  if ($null -eq $line) { break }
  if (-not $line.Trim()) { continue }
  $id = 0
  try {
    $c = $line | ConvertFrom-Json
    $id = [int]$c.id
    $mods = [int[]]@($c.mods | Where-Object { $null -ne $_ })
    $out = switch ($c.op) {
      'shot'   { '"png":"' + [Desk]::Shot([int]$c.x, [int]$c.y, [int]$c.w, [int]$c.h, [int]$c.tw, [int]$c.th) + '"' }
      'move'   { [Desk]::Move([int]$c.x, [int]$c.y); '' }
      'cursor' { [Desk]::Cursor() }
      'click'  { [Desk]::Click([int]$c.x, [int]$c.y, [string]$c.btn, [int]$c.n, $mods); '' }
      'button' { [Desk]::Button([string]$c.btn, [bool]$c.up); '' }
      'drag'   { [Desk]::Drag([int]$c.x0, [int]$c.y0, [int]$c.x1, [int]$c.y1, $mods); '' }
      'scroll' { [Desk]::Scroll([int]$c.x, [int]$c.y, [string]$c.dir, [int]$c.amount, $mods); '' }
      'keys'   { [Desk]::Keys([int[]]@($c.vks), [int]$c.repeat); '' }
      'hold'   { [Desk]::Hold([int[]]@($c.vks), [int]$c.ms); '' }
      'type'   { [Desk]::Type([string]$c.text); '' }
      default  { throw "Lệnh không hỗ trợ: $($c.op)" }
    }
    $sep = if ($out) { ',' } else { '' }
    [Console]::Out.WriteLine('{"id":' + $id + ',"ok":true' + $sep + $out + '}')
  } catch {
    $msg = ($_.Exception.Message -replace '[\\"]', "'") -replace '[\r\n]+', ' '
    [Console]::Out.WriteLine('{"id":' + $id + ',"ok":false,"error":"' + $msg + '"}')
  }
  [Console]::Out.Flush()
}
