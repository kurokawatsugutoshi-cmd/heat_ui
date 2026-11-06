'use client'

import { History, X } from 'lucide-react'
import { LANG_LABELS, isBpOver, type Worker } from '@/components/heatguard/admin/dashboard-data'

function Flag({ tone, children }: { tone: 'red' | 'amber'; children: React.ReactNode }) {
  return (
    <span
      className={
        tone === 'red'
          ? 'ml-1.5 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-700'
          : 'ml-1.5 rounded border border-line bg-white px-1.5 py-0.5 text-xs font-medium text-ink'
      }
    >
      {children}
    </span>
  )
}

export function WorkerDrawer({ worker, onClose }: { worker: Worker; onClose: () => void }) {
  const basics: { label: string; value: React.ReactNode }[] = [
    { label: '氏名', value: worker.name },
    { label: '使用言語', value: LANG_LABELS[worker.lang] ?? worker.lang },
    { label: '年齢', value: `${worker.age}歳` },
    { label: '所属会社', value: `${worker.company}（${worker.tier}）` },
    { label: '担当職長', value: worker.leaderName },
    {
      label: '職長緊急TEL',
      value: (
        <a href={`tel:${worker.leaderTel.replaceAll('-', '')}`} className="text-blue-700 underline underline-offset-2 hover:text-blue-800">
          {worker.leaderTel}
        </a>
      ),
    },
  ]

  return (
    <aside
      aria-label={`${worker.name}の詳細情報`}
      className="flex w-[380px] shrink-0 flex-col border-l border-line bg-canvas animate-in slide-in-from-right-8 duration-300"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="type-label">M-02 作業員 詳細情報</h2>
        <button
          type="button"
          onClick={onClose}
          className="type-button flex h-[42px] items-center gap-1 rounded-lg bg-white px-2.5 text-ink hover:bg-canvas"
        >
          閉じる
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-white p-4">
          {basics.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="type-caption">{row.label}</dt>
              <dd className="type-label mt-0.5">{row.value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h3 className="type-label mb-2">本日のバイタル・報告ステータス</h3>
          <dl className="divide-y divide-line rounded-2xl bg-white text-sm">
            <div className="px-4 py-2.5">
              <dt className="type-caption">朝の血圧・脈拍</dt>
              <dd className="type-body mt-0.5">
                <span className="font-semibold tabular-nums">
                  {worker.sys} / {worker.dia} mmHg
                </span>
                （脈拍 {worker.pulse} bpm）
                {isBpOver(worker) && <Flag tone="red">基準超過</Flag>}
              </dd>
            </div>
            <div className="px-4 py-2.5">
              <dt className="type-caption">昨日の睡眠時間</dt>
              <dd className="type-label mt-0.5">
                {worker.sleep}
                {worker.sleep === '5時間以下' && <Flag tone="amber">要注意</Flag>}
              </dd>
            </div>
            <div className="px-4 py-2.5">
              <dt className="type-caption">最新ステータス</dt>
              <dd className="type-label mt-0.5">{worker.latest}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="type-label mb-2 flex items-center gap-1.5">
            <History className="size-4 text-quiet" aria-hidden />
            直近7日間の不調・引き継ぎ履歴
          </h3>
          <div className="rounded-2xl bg-white p-3">
            {worker.history.length > 0 ? (
              <ul className="type-body space-y-2 leading-relaxed">
                {worker.history.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : (
              <p className="type-meta">直近7日間の不調申告なし</p>
            )}
          </div>
        </section>
      </div>
    </aside>
  )
}
