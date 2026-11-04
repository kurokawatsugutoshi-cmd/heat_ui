'use client'

import { useState } from 'react'
import { Clock, Columns3, ListChecks, MapPin, Megaphone, ShieldUser, X, type LucideIcon } from 'lucide-react'
import { COLUMN_LABELS, type ColumnKey } from '@/components/heatguard/admin/dashboard-data'
import { cn } from '@/lib/utils'

const NOTICE_MAX = 120

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm text-slate-700">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-md border transition-colors',
          checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-slate-100',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-[18px] rounded bg-white shadow-sm transition-all',
            checked ? 'left-[21px]' : 'left-0.5 border border-slate-300',
          )}
        />
      </button>
    </div>
  )
}

function Section({ n, icon: Icon, title, children }: { n: string; icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <Icon className="size-4 text-blue-600" aria-hidden />
        <span className="text-slate-500">{n}.</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

const inputClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
const fieldLabel = 'block text-sm text-slate-600'

type SettingsModalProps = {
  columns: Record<ColumnKey, boolean>
  onColumnsChange: (c: Record<ColumnKey, boolean>) => void
  onClose: () => void
  onSave: () => void
}

export function SettingsModal({ columns, onColumnsChange, onClose, onSave }: SettingsModalProps) {
  const [questions, setQuestions] = useState({ mood: true, bp: true, pulse: true, sleep: true })
  const [draftColumns, setDraftColumns] = useState(columns)
  const [cycle, setCycle] = useState<'00' | '30'>('00')
  const [notice, setNotice] = useState('')

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-5xl rounded-lg border border-slate-200 bg-slate-50 shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between rounded-t-lg border-b border-slate-200 bg-white px-6 py-4">
          <h2 id="settings-title" className="text-lg font-bold text-slate-900">
            設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="閉じる"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <Section n="1" icon={ListChecks} title="設問・アラート基準値設定">
            <Switch label="体調" checked={questions.mood} onChange={(v) => setQuestions({ ...questions, mood: v })} />
            <Switch label="血圧" checked={questions.bp} onChange={(v) => setQuestions({ ...questions, bp: v })} />
            <Switch label="脈拍" checked={questions.pulse} onChange={(v) => setQuestions({ ...questions, pulse: v })} />
            <Switch label="睡眠" checked={questions.sleep} onChange={(v) => setQuestions({ ...questions, sleep: v })} />
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-200 pt-3">
              <label className={fieldLabel}>
                最高血圧
                <input className={inputClass} defaultValue="180" inputMode="numeric" />
              </label>
              <label className={fieldLabel}>
                最低血圧
                <input className={inputClass} defaultValue="110" inputMode="numeric" />
              </label>
              <label className={fieldLabel}>
                睡眠
                <span className="mt-1 flex items-center gap-1">
                  <input className={cn(inputClass, 'mt-0 w-12')} defaultValue="5" inputMode="numeric" />
                  <span className="whitespace-nowrap text-xs text-slate-500">時間以下</span>
                </span>
              </label>
            </div>
          </Section>

          <Section n="2" icon={ShieldUser} title="管理権限設定（RBAC）">
            <ul className="space-y-2 text-sm">
              {[
                { lv: 'Level 1', role: '本部', scope: '全現場横断' },
                { lv: 'Level 2', role: '現場監督', scope: '担当現場すべて' },
                { lv: 'Level 3', role: '職長', scope: '自社作業員のみ' },
              ].map((r) => (
                <li key={r.lv} className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2">
                  <span className="font-semibold text-blue-700">{r.lv}</span>
                  <span className="ml-2 font-semibold text-slate-900">{r.role}</span>
                  <span className="text-slate-600">（{r.scope}）</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section n="3" icon={MapPin} title="現場現在地指定（気象・WBGT連携）">
            <div className="space-y-2">
              <label className={fieldLabel}>
                郵便番号
                <input className={inputClass} defaultValue="530-8241" />
              </label>
              <label className={fieldLabel}>
                地域
                <input className={inputClass} defaultValue="大阪府大阪市北区" />
              </label>
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm text-emerald-700">
                自動取得済：気温 33.5℃ / WBGT 31.2℃
              </p>
            </div>
          </Section>

          <Section n="4" icon={Clock} title="定時休憩サイクル・未回答通知設定">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="定時休憩サイクル">
              {(
                [
                  { v: '00', l: '00分基準', s: '10:00, 11:00…' },
                  { v: '30', l: '30分基準', s: '10:30, 11:30…' },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={cycle === o.v}
                  onClick={() => setCycle(o.v)}
                  className={cn(
                    'rounded-md border px-3 py-2 text-left',
                    cycle === o.v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span className="block text-sm font-semibold">{o.l}</span>
                  <span className="text-xs text-slate-500">（{o.s}）</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className={fieldLabel}>
                本人リマインド
                <span className="mt-1 flex items-center gap-1">
                  <input className={cn(inputClass, 'mt-0')} defaultValue="5" inputMode="numeric" />
                  <span className="whitespace-nowrap text-xs text-slate-500">分後</span>
                </span>
              </label>
              <label className={fieldLabel}>
                上長アラート
                <span className="mt-1 flex items-center gap-1">
                  <input className={cn(inputClass, 'mt-0')} defaultValue="10" inputMode="numeric" />
                  <span className="whitespace-nowrap text-xs text-slate-500">分後</span>
                </span>
              </label>
            </div>
          </Section>

          <Section n="5" icon={Columns3} title="テーブル表示カラム設定">
            {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((k) => (
              <Switch
                key={k}
                label={COLUMN_LABELS[k]}
                checked={draftColumns[k]}
                onChange={(v) => setDraftColumns({ ...draftColumns, [k]: v })}
              />
            ))}
          </Section>

          <Section n="6" icon={Megaphone} title="現場一斉お知らせ投稿">
            <label className={fieldLabel}>
              作業員の W-04 ホームへ表示するテキスト（最大120文字）
              <textarea
                value={notice}
                maxLength={NOTICE_MAX}
                onChange={(e) => setNotice(e.target.value)}
                rows={4}
                className={cn(inputClass, 'resize-none leading-relaxed')}
              />
            </label>
            <p className="mt-1 text-right text-xs text-slate-400 tabular-nums">
              {notice.length} / {NOTICE_MAX}
            </p>
          </Section>
        </div>

        <div className="flex justify-end gap-2 rounded-b-lg border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              onColumnsChange(draftColumns)
              onSave()
              onClose()
            }}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            設定を保存する
          </button>
        </div>
      </div>
    </div>
  )
}
