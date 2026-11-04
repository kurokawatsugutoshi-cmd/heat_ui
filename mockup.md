<!DOCTYPE html>
<html lang="ja">
<head>
 <meta charset="UTF-8">
 <script src="https://cdn.tailwindcss.com"></script>
 <style>
   body { background: #1e1e24; font-family: 'Hiragino Sans', 'Meiryo', sans-serif; padding: 40px; }
   .phone-frame { width: 320px; border: 10px solid #0f172a; border-radius: 36px; background: #fff; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
   .pc-frame { width: 760px; border: 10px solid #0f172a; border-radius: 20px; background: #0f172a; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
 </style>
</head>
<body class="flex flex-wrap gap-10 items-start justify-center">

 <!-- ① 朝の入場チェック画面 -->
 <div>
   <p class="text-white text-sm mb-2 font-bold">① 朝の体調・バイタル画面（差し替え用）</p>
   <div class="phone-frame p-4">
     <div class="flex justify-between items-center border-b pb-2 mb-3">
       <span class="text-xs font-bold text-slate-700">👤 大和 太郎 さん</span>
       <span class="text-[10px] bg-slate-100 border px-2 py-0.5 rounded font-bold text-slate-600">🌐 JP / VI</span>
     </div>
     <p class="text-center font-bold text-sm text-slate-800 mb-2">今日の体調は？</p>
     <div class="grid grid-cols-3 gap-2 mb-3">
       <div class="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-2 text-center">
         <div class="text-2xl">😊</div>
         <div class="text-xs font-bold text-emerald-700 mt-1">良い</div>
       </div>
       <div class="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
         <div class="text-2xl">😐</div>
         <div class="text-xs font-bold text-amber-700 mt-1">普通</div>
       </div>
       <div class="bg-rose-50 border border-rose-200 rounded-xl p-2 text-center">
         <div class="text-2xl">😵</div>
         <div class="text-xs font-bold text-rose-700 mt-1">悪い</div>
       </div>
     </div>
     <div class="bg-slate-50 rounded-lg p-2.5 mb-2 border border-slate-200">
       <p class="text-[11px] font-bold text-slate-600 mb-1.5">朝の血圧・脈拍（選択式）</p>
       <div class="grid grid-cols-3 gap-1.5 text-center">
         <div class="bg-white border rounded py-1 text-xs font-bold text-slate-800">上 120 ▾</div>
         <div class="bg-white border rounded py-1 text-xs font-bold text-slate-800">下 80 ▾</div>
         <div class="bg-white border rounded py-1 text-xs font-bold text-slate-800">脈 72 ▾</div>
       </div>
     </div>
     <div class="bg-slate-50 rounded-lg p-2 mb-3 border border-slate-200 flex justify-between items-center">
       <span class="text-[11px] font-bold text-slate-600">睡眠はとれた？</span>
       <div class="flex gap-1">
         <span class="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">7h以上</span>
         <span class="bg-white border text-slate-600 text-[10px] px-2 py-1 rounded">6h</span>
         <span class="bg-white border text-slate-600 text-[10px] px-2 py-1 rounded">5h以下</span>
       </div>
     </div>
     <button class="w-full bg-blue-900 text-white font-bold text-xs py-3 rounded-xl">完了して入場する</button>
   </div>
 </div>

 <!-- ③ 日中の危険対応・休憩報告画面 -->
 <div>
   <p class="text-white text-sm mb-2 font-bold">③ 日中の休憩報告・アラート画面（WBGT削除版）</p>
   <div class="phone-frame bg-rose-700 p-4 text-white">
     <div class="text-center text-3xl mb-1">⚠️</div>
     <h3 class="text-center font-bold text-base mb-2">危険アラート発令！</h3>
     <div class="bg-rose-800/80 border border-rose-400/40 rounded-xl p-3 text-xs leading-relaxed mb-3">
       直ちに作業を中断し、最寄りの休憩所で水分・塩分を補給してください。
     </div>
     <div class="bg-white text-slate-800 rounded-xl p-3 mb-3">
       <p class="text-[11px] font-bold text-rose-700 mb-1">📋 応急処置フローチャート</p>
       <ul class="text-[11px] space-y-1 text-slate-600">
         <li>1. 日陰・クールスポットへ移動</li>
         <li>2. 衣服を緩め、首・脇の下を冷却</li>
         <li>3. 水分・塩分を摂取し経過観察</li>
       </ul>
     </div>
     <button class="w-full bg-white text-rose-700 font-bold text-xs py-2.5 rounded-xl mb-2 shadow">👍 水分補給・休憩に入りました</button>
     <button class="w-full bg-amber-400 text-slate-900 font-bold text-xs py-2.5 rounded-xl shadow">📞 工事課員へ直通電話（緊急連絡）</button>
   </div>
 </div>

 <!-- ④ 管理者通知画面 -->
 <div>
   <p class="text-white text-sm mb-2 font-bold">④ 管理者通知画面（エリア削除・血圧表示版）</p>
   <div class="phone-frame p-4">
     <div class="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg flex justify-between items-center text-xs font-bold mb-3">
       <span>🚨 警告アラート発生</span>
       <span>14:25</span>
     </div>
     <div class="flex items-center gap-3 mb-3 border-b pb-3">
       <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg">👤</div>
       <div>
         <div class="text-[10px] text-slate-500 font-bold">〇〇鉄筋工業（一次請け）</div>
         <div class="text-sm font-bold text-slate-800">グエン・ヴァン さん</div>
       </div>
     </div>
     <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs space-y-1">
       <div class="font-bold text-rose-600">⚠️ 異常検知の内容：</div>
       <div class="text-slate-700 text-[11px]">・朝の血圧：<span class="font-bold text-rose-600">180 / 110</span>（基準超過）</div>
       <div class="text-slate-700 text-[11px]">・睡眠時間：5時間以下</div>
       <div class="text-slate-700 text-[11px]">・定期報告：<span class="font-bold text-rose-600">体調不良（めまい）</span></div>
     </div>
     <div class="bg-blue-50 text-blue-800 text-[11px] font-bold px-2.5 py-1.5 rounded mb-3 text-center border border-blue-200">
       🔄 ステータス：鈴木職長が声かけ中
     </div>
     <div class="grid grid-cols-2 gap-2">
       <button class="bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-lg">📞 本人に電話</button>
       <button class="bg-blue-900 text-white font-bold text-xs py-2.5 rounded-lg">✅ 救護完了を記録</button>
     </div>
   </div>
 </div>

 <!-- ⑤ 全体ダッシュボード画面 -->
 <div>
   <p class="text-white text-sm mb-2 font-bold">⑤ 全体ダッシュボード画面（WBGT削除・未入力追加版）</p>
   <div class="pc-frame p-5 text-white">
     <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
       <div class="font-bold text-sm">🏢 大和ハウス 〇〇新築工事現場 リアルタイム安全モニター</div>
       <div class="flex gap-2">
         <span class="bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded font-bold">⚙️ 設問・基準値設定</span>
         <span class="bg-blue-600 text-white text-xs px-3 py-1 rounded font-bold">📥 労基署レポート出力(CSV/PDF)</span>
       </div>
     </div>
     <div class="grid grid-cols-4 gap-3 mb-4">
       <div class="bg-slate-800 border border-slate-700 rounded-xl p-3">
         <div class="text-[11px] text-slate-400">本日の入場・入力完了</div>
         <div class="text-2xl font-bold mt-1">142 <span class="text-xs font-normal">名</span></div>
       </div>
       <div class="bg-slate-800 border border-amber-500/40 rounded-xl p-3">
         <div class="text-[11px] text-amber-300">朝の体調「要注意(黄)」</div>
         <div class="text-2xl font-bold text-amber-400 mt-1">6 <span class="text-xs font-normal">名 (血圧・睡眠)</span></div>
       </div>
       <div class="bg-rose-950/80 border border-rose-500 rounded-xl p-3">
         <div class="text-[11px] text-rose-300">警告アラート(赤)</div>
         <div class="text-2xl font-bold text-white mt-1">1 <span class="text-xs font-normal text-rose-200">名 (鈴木対応中)</span></div>
       </div>
       <div class="bg-slate-800 border border-slate-700 rounded-xl p-3">
         <div class="text-[11px] text-emerald-300">定期報告の未入力者</div>
         <div class="text-2xl font-bold text-emerald-400 mt-1">4 <span class="text-xs font-normal">名 (自動催促済)</span></div>
       </div>
     </div>
     <div class="bg-slate-800 rounded-xl p-3 border border-slate-700 text-xs">
       <div class="font-bold text-slate-300 mb-2">■ 作業員別 時系列タイムライン（朝バイタル・1時間ごとの休憩報告）</div>
       <table class="w-full text-left border-collapse">
         <thead>
           <tr class="text-slate-400 border-b border-slate-700 text-[11px]">
             <th class="py-1.5">作業員名 / 所属</th>
             <th>朝バイタル</th>
             <th>10:00</th>
             <th>11:00</th>
             <th>13:00</th>
             <th>14:00</th>
             <th>対応ステータス</th>
           </tr>
         </thead>
         <tbody class="divide-y divide-slate-700 text-[11px]">
           <tr class="bg-rose-950/30">
             <td class="py-2 font-bold">グエン・ヴァン <span class="text-slate-400 font-normal">(〇〇鉄筋)</span></td>
             <td class="text-amber-400 font-bold">🟡 180/110</td>
             <td>🟢 補給済</td>
             <td>🟢 補給済</td>
             <td class="text-amber-400">🟡 注意</td>
             <td class="text-rose-400 font-bold">🔴 不調申告</td>
             <td><span class="bg-blue-600 px-2 py-0.5 rounded text-[10px]">鈴木職長が声かけ中</span></td>
           </tr>
           <tr>
             <td class="py-2 font-bold">山本 誠 <span class="text-slate-400 font-normal">(山本組)</span></td>
             <td class="text-emerald-400">🟢 125/80</td>
             <td>🟢 補給済</td>
             <td>🟢 補給済</td>
             <td>🟢 補給済</td>
             <td class="text-slate-400">⚪ 未入力</td>
             <td><span class="bg-slate-700 px-2 py-0.5 rounded text-[10px]">リマインド送信済</span></td>
           </tr>
         </tbody>
       </table>
     </div>
   </div>
 </div>

</body>
</html>