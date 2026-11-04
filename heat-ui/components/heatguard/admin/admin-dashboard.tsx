'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, Download, Settings } from 'lucide-react'
import { BrowserFrame } from '@/components/showcase/device-frames'
import { FILTERS, SITES, type ColumnKey, type FilterKey, type Worker } from '@/components/heatguard/admin/dashboard-data'
import { DashboardTable, TimelineDot } from '@/components/heatguard/admin/dashboard-table'
import { WorkerDrawer } from '@/components/heatguard/admin/worker-drawer'
import { SettingsModal } from '@/components/heatguard/admin/settings-modal'
import { cn } from '@/lib/utils'

type Kpi = { label: string; value: string; sub: string; accent: string }

const kpis: Kpi[] = [
  { label: '本日の入場者数', value: '142', sub: '登録: 146名中', accent: 'text-zinc-900' },
  { label: '朝の要注意', value: '6', sub: '血圧・睡眠・前日引継', accent: 'text-amber-600' },
  { label: 'アラート発生', value: '1', sub: '鈴木職長 対応中', accent: 'font-medium text-red-600' },
  { label: '定時チェック未入力', value: '2', sub: '5分本人通知済・10分上長通知', accent: 'text-zinc-900' },
]

const siteOptions = [
  { value: 'all', label: '全現場横断（Level 1 本部）' },
  { value: 'daiwa', label: '大和ハウス 〇〇新築工事現場' },
  { value: 'kaishu', label: '△△改修工事現場' },
]

const legend = [
  { cell: 'g', label: '良好' },
  { cell: 'y', label: '注意' },
  { cell: 'r', label: '異常' },
  { cell: 'n', label: '未入力' },
] as const

export function AdminDashboard() {
  const [site, setSite] = useState('all')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({ age: true, company: true, leader: true, vitals: true })
  const [selected, setSelected] = useState<Worker | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const visibleSites = site === 'all' ? SITES : SITES.filter((s) => s.id === site)

  return (
    <BrowserFrame url="admin.heatguard.jp/dashboard" label="事務所・本部 全体ダッシュボード">
      <div className="relative min-h-[860px] overflow-hidden bg-white text-zinc-900">
        <header className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-zinc-100 bg-white px-8 py-4">
          <div className="leading-tight">
            <p className="text-base font-bold tracking-wide text-zinc-900">HEATGUARD</p>
            <p className="text-xs font-medium tracking-wider text-zinc-500">SAFETY MONITOR</p>
          </div>

          <label className="relative flex items-center">
            <span className="sr-only">現場切替</span>
            <select
              value={site}
              onChange={(e) => {
                setSite(e.target.value)
                setSelected(null)
              }}
              className="cursor-pointer appearance-none rounded-lg bg-[#F5F5F3] py-2 pr-9 pl-3 text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              {siteOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-zinc-500" aria-hidden />
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="flex items-center gap-2 whitespace-nowrap text-sm text-zinc-600">
              大阪市北区｜気温 33.5℃ / WBGT 31.2℃
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">厳重警戒</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('CSV / PDF を出力しました')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-[#F5F5F3]"
              >
                <Download className="size-4" aria-hidden />
                CSV / PDF出力
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                <Settings className="size-4" aria-hidden />
                設定
              </button>
            </div>
          </div>
        </header>

        <div className="px-8 pb-8">
          <ul className="grid grid-cols-4 gap-8 border-b border-zinc-100 py-6">
            {kpis.map((k) => (
              <li key={k.label}>
                <p className="text-xs font-semibold text-zinc-500">{k.label}</p>
                <p className="mt-2 flex items-baseline">
                  <span className={cn('text-5xl font-normal tracking-tight tabular-nums', k.accent)}>{k.value}</span>
                  <span className="ml-1 text-sm text-zinc-400">名</span>
                </p>
                <p className="mt-2 text-xs text-zinc-400">{k.sub}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-3">
            <div className="flex gap-6" role="tablist" aria-label="表示フィルタ">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'border-b-2 pb-1.5 text-sm transition-colors',
                    filter === f.key ? 'border-zinc-900 font-semibold text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <ul className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              {legend.map(({ cell, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center">
                    <TimelineDot cell={cell} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <DashboardTable
            sites={visibleSites}
            columns={columns}
            filter={filter}
            selectedId={selected?.id ?? null}
            onSelect={(w) => setSelected((cur) => (cur?.id === w.id ? null : w))}
          />
        </div>

        {selected && <WorkerDrawer worker={selected} onClose={() => setSelected(null)} />}
        {settingsOpen && (
          <SettingsModal
            columns={columns}
            onColumnsChange={setColumns}
            onClose={() => setSettingsOpen(false)}
            onSave={() => showToast('設定を保存しました')}
          />
        )}
        {toast && (
          <div
            role="status"
            className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2"
          >
            <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />
            {toast}
          </div>
        )}
      </div>
    </BrowserFrame>
  )
}
