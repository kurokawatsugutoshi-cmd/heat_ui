'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, Download, Settings } from 'lucide-react'
import { IpadFrame } from '@/components/showcase/device-frames'
import { FILTERS, SITES, type ColumnKey, type FilterKey, type Worker } from '@/components/heatguard/admin/dashboard-data'
import { DashboardTable } from '@/components/heatguard/admin/dashboard-table'
import { WorkerDrawer } from '@/components/heatguard/admin/worker-drawer'
import { SettingsModal } from '@/components/heatguard/admin/settings-modal'
import { cn } from '@/lib/utils'
import { numeric } from '@/components/heatguard/numeric-font'

type Kpi = { label: string; value: string; sub?: string; accent: string }

const kpis: Kpi[] = [
  { label: '本日の入場者数', value: '142', sub: '登録: 146名中', accent: 'text-ink' },
  { label: '朝の要注意', value: '6', accent: 'text-orange-500' },
  { label: 'アラート発生', value: '1', accent: 'text-red-600' },
  { label: '定時チェック未入力', value: '2', accent: 'text-orange-500' },
]

/** 左が現在、右端のいちばん高い線がこの先の最高気温。線を重ねて黄から赤へ。 */
const HEAT_CRESTS = [
  'M0.0 127.6C4.2 127.8 16.7 128.9 25.0 129.1C33.3 129.3 41.7 129.2 50.0 128.7C58.3 128.2 66.7 127.4 75.0 126.3C83.3 125.2 91.7 123.7 100.0 122.0C108.3 120.4 116.7 118.3 125.0 116.3C133.3 114.3 141.7 112.1 150.0 109.9C158.3 107.8 166.7 105.6 175.0 103.7C183.3 101.8 191.7 99.9 200.0 98.3C208.3 96.7 216.7 95.3 225.0 94.2C233.3 93.0 241.7 92.1 250.0 91.4C258.3 90.6 266.7 90.1 275.0 89.6C283.3 89.1 291.7 88.7 300.0 88.3C308.3 87.8 316.7 87.4 325.0 86.8C333.3 86.2 341.7 85.5 350.0 84.6C358.3 83.7 366.7 82.5 375.0 81.3C383.3 80.1 395.8 78.0 400.0 77.3',
  'M0.0 133.9C4.2 133.5 16.7 132.7 25.0 131.5C33.3 130.4 41.7 128.7 50.0 126.9C58.3 125.2 66.7 123.0 75.0 121.0C83.3 118.9 91.7 116.6 100.0 114.6C108.3 112.5 116.7 110.4 125.0 108.6C133.3 106.8 141.7 105.2 150.0 103.8C158.3 102.4 166.7 101.3 175.0 100.4C183.3 99.5 191.7 98.9 200.0 98.4C208.3 97.9 216.7 97.6 225.0 97.3C233.3 97.0 241.7 96.9 250.0 96.6C258.3 96.2 266.7 95.9 275.0 95.4C283.3 94.8 291.7 94.2 300.0 93.3C308.3 92.3 316.7 91.2 325.0 89.9C333.3 88.6 341.7 87.0 350.0 85.4C358.3 83.8 366.7 81.6 375.0 80.1C383.3 78.5 395.8 76.8 400.0 76.1',
  'M0.0 130.1C4.2 129.2 16.7 126.5 25.0 124.5C33.3 122.6 41.7 120.4 50.0 118.5C58.3 116.6 66.7 114.7 75.0 113.1C83.3 111.6 91.7 110.2 100.0 109.1C108.3 108.0 116.7 107.3 125.0 106.7C133.3 106.1 141.7 105.8 150.0 105.5C158.3 105.3 166.7 105.3 175.0 105.2C183.3 105.0 191.7 105.1 200.0 104.8C208.3 104.6 216.7 104.3 225.0 103.8C233.3 103.3 241.7 102.5 250.0 101.6C258.3 100.6 266.7 99.4 275.0 97.9C283.3 96.5 291.7 94.8 300.0 93.1C308.3 91.3 316.7 89.3 325.0 87.4C333.3 85.5 341.7 83.4 350.0 81.5C358.3 79.6 366.7 77.6 375.0 76.0C383.3 74.4 395.8 72.7 400.0 72.0',
]
const HEAT_CREST_FRAMES = `${HEAT_CRESTS.join(';')};${HEAT_CRESTS[0]}`
const HEAT_LINE_OFFSETS = [30, 24, 18, 12, 6, 0]

function TemperatureCard({ compact }: { compact: boolean }) {
  return (
    <li className="relative min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_6px_16px_-8px_rgba(15,23,42,0.22)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg className="heat-time-wave absolute inset-0 h-full w-full" viewBox="0 0 400 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heat-time" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E4C15A" />
              <stop offset="52%" stopColor="#E39258" />
              <stop offset="100%" stopColor="#D9655C" />
            </linearGradient>
            <path id="heat-crest" fill="none" d={HEAT_CRESTS[0]}>
              <animate attributeName="d" dur="11s" repeatCount="indefinite" calcMode="linear" values={HEAT_CREST_FRAMES} />
            </path>
          </defs>
          {HEAT_LINE_OFFSETS.map((dy) => (
            <use
              key={dy}
              href="#heat-crest"
              transform={`translate(0 ${dy})`}
              stroke="url(#heat-time)"
              strokeWidth={dy === 0 ? 1.6 : 1.15}
              vectorEffect="non-scaling-stroke"
              opacity={dy === 0 ? 0.85 : 0.22 + (30 - dy) / 90}
            />
          ))}
        </svg>
      </div>
      <div className="relative">
        <p className="text-xs text-zinc-600">現在の気温（大阪市北区）</p>
        <p className="mt-2 flex items-baseline">
          <span className={cn(numeric.className, 'tracking-[0.005em] tabular-nums text-ink', compact ? 'text-[41.4px]/none' : 'text-[55.2px]/none')}>
            33<span className="text-[70%]">.5</span>
          </span>
          <span className="ml-1 text-sm text-zinc-600">℃</span>
        </p>
      </div>
      <span className="absolute bottom-4 left-4 inline-flex h-4 items-center gap-1 rounded-full border border-red-500 bg-white px-1.5 text-[10px] leading-none text-zinc-500">
        <span className="size-1.5 rounded-full bg-red-500" aria-hidden />
        厳重警戒
      </span>
    </li>
  )
}

const siteOptions = [
  { value: 'all', label: '全現場横断（Level 1 本部）' },
  { value: 'daiwa', label: '大和ハウス 〇〇新築工事現場' },
  { value: 'kaishu', label: '△△改修工事現場' },
]

export function AdminDashboard() {
  const [site, setSite] = useState('all')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({ age: true, company: true, leader: false, vitals: true })
  const [selected, setSelected] = useState<Worker | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const visibleSites = site === 'all' ? SITES : SITES.filter((s) => s.id === site)

  return (
    <IpadFrame label="M-01 事務所・本部 全体ダッシュボード">
      <div className="relative flex min-h-full overflow-hidden bg-canvas text-ink">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line bg-canvas px-8 py-4">
          <div className="leading-tight">
            <p className="type-label tracking-wide">HEATGUARD</p>
            <p className="type-caption tracking-wider text-sub-ink">SAFETY MONITOR</p>
          </div>

          <label className="relative flex items-center">
            <span className="sr-only">現場切替</span>
            <select
              value={site}
              onChange={(e) => {
                setSite(e.target.value)
                setSelected(null)
              }}
              className="cursor-pointer appearance-none rounded-md border border-line bg-white py-1.5 pr-7 pl-2.5 text-xs font-medium text-ink outline-none"
            >
              {siteOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3 text-quiet" aria-hidden />
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('CSV / PDF を出力しました')}
                className="type-button flex h-[42px] items-center gap-1.5 rounded-lg bg-white px-3.5 text-ink hover:bg-canvas"
              >
                <Download className="size-4" aria-hidden />
                CSV / PDF出力
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="type-button flex h-[42px] items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-white hover:bg-blue-700"
              >
                <Settings className="size-4" aria-hidden />
                設定
              </button>
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 px-8 pb-8">
          <ul className={cn('grid gap-3 py-6', selected ? 'grid-cols-2' : 'grid-cols-5')}>
            {kpis.map((k) => (
              <li key={k.label} className="min-w-0 rounded-2xl bg-white p-4 shadow-[0_6px_16px_-8px_rgba(15,23,42,0.22)]">
                <p className="text-xs text-zinc-600">{k.label}</p>
                <p className="mt-2 flex items-baseline">
                  <span className={cn(numeric.className, 'tracking-[0.005em] tabular-nums', selected ? 'text-[41.4px]/none' : 'text-[55.2px]/none', k.accent)}>{k.value}</span>
                  <span className="ml-1 text-sm text-zinc-600">名</span>
                </p>
                {k.sub ? <p className="mt-5 type-caption">{k.sub}</p> : null}
              </li>
            ))}
            <TemperatureCard compact={Boolean(selected)} />
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2 pb-3">
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
                    filter === f.key ? 'border-blue-600 type-label' : 'border-transparent type-meta hover:text-ink',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className={cn('min-w-0 rounded-2xl bg-white', selected ? 'overflow-hidden' : 'overflow-x-auto')}>
          <DashboardTable
            sites={visibleSites}
            columns={columns}
            filter={filter}
            selectedId={selected?.id ?? null}
            compact={Boolean(selected)}
            onSelect={(w) => setSelected((cur) => (cur?.id === w.id ? null : w))}
          />
          </div>
        </div>
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
            className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-ink px-4 py-3 type-button text-white animate-in fade-in slide-in-from-bottom-2"
          >
            <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />
            {toast}
          </div>
        )}
      </div>
    </IpadFrame>
  )
}
