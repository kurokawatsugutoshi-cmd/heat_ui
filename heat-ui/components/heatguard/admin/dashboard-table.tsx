'use client'

import { useState } from 'react'
import { ChevronDown, Shield } from 'lucide-react'
import {
  COLUMN_LABELS,
  CURRENT_TIME_INDEX,
  TIMES,
  isBpOver,
  matchesFilter,
  type Cell,
  type ColumnKey,
  type FilterKey,
  type Site,
  type Status,
  type Worker,
} from '@/components/heatguard/admin/dashboard-data'
import { cn } from '@/lib/utils'

const CELL_LABELS: Record<Cell, string> = { g: '良好', y: '注意', r: '異常', n: '未入力', f: '予定' }

export function TimelineDot({ cell }: { cell: Cell }) {
  const label = CELL_LABELS[cell]
  if (cell === 'f') return <span className="sr-only">{label}</span>
  const className = {
    g: 'size-1.5 bg-zinc-300',
    y: 'size-2 bg-amber-500',
    r: 'size-2.5 bg-red-600 ring-4 ring-red-100',
    n: 'size-2 border border-zinc-400 bg-white',
  }[cell]
  return <span role="img" aria-label={label} className={cn('mx-auto block rounded-full', className)} />
}

function StatusLabel({ status }: { status: Status }) {
  switch (status) {
    case 'alert':
      return <span className="inline-block rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white">アラート</span>
    case 'caution':
      return <span className="inline-block rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">要注意</span>
    case 'missing':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700">
          <span className="size-1.5 rounded-full border border-zinc-500" aria-hidden />
          未入力
        </span>
      )
    case 'leave':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="size-1.5 rounded-full bg-zinc-300" aria-hidden />
          早退
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          作業中
        </span>
      )
  }
}

type DashboardTableProps = {
  sites: Site[]
  columns: Record<ColumnKey, boolean>
  filter: FilterKey
  selectedId: string | null
  onSelect: (worker: Worker) => void
}

export function DashboardTable({ sites, columns, filter, selectedId, onSelect }: DashboardTableProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }))
  const extraCols = (['leader', 'vitals'] as const).filter((k) => columns[k])
  const colSpan = 2 + extraCols.length + TIMES.length

  const profile = (w: Worker) =>
    [columns.age && `${w.age}歳`, columns.company && w.company].filter(Boolean).join(' · ')

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-xs font-medium text-zinc-500">
            <th scope="col" className="sticky left-0 z-10 w-[260px] min-w-[260px] bg-white py-3 pr-4 font-medium">
              氏名
            </th>
            <th scope="col" className="sticky left-[260px] z-10 w-[140px] min-w-[140px] bg-white px-3 py-3 font-medium">
              ステータス
            </th>
            {extraCols.map((k) => (
              <th key={k} scope="col" className="whitespace-nowrap px-3 py-3 font-medium">
                {COLUMN_LABELS[k]}
              </th>
            ))}
            {TIMES.map((t, i) => (
              <th
                key={t}
                scope="col"
                className={cn('min-w-[60px] px-2 py-3 text-center font-mono font-medium', i === CURRENT_TIME_INDEX && 'bg-[#F8F8F7] text-zinc-900')}
              >
                {t}
                {i === CURRENT_TIME_INDEX && <span className="block font-sans text-[11px] text-zinc-500">現在</span>}
              </th>
            ))}
          </tr>
        </thead>
        {sites.map((site) => {
          const total = site.companies.reduce((n, c) => n + c.workers.length, 0)
          return (
            <tbody key={site.id}>
              <tr className="border-b border-zinc-100">
                <th colSpan={colSpan} scope="rowgroup" className="bg-[#F8F8F7] p-0">
                  <button
                    type="button"
                    onClick={() => toggle(site.id)}
                    aria-expanded={!collapsed[site.id]}
                    className="sticky left-0 flex items-center gap-2 px-3 py-3 text-sm font-bold text-zinc-900"
                  >
                    <ChevronDown className={cn('size-4 text-zinc-400 transition-transform', collapsed[site.id] && '-rotate-90')} aria-hidden />
                    {site.name}（{total}名）
                  </button>
                </th>
              </tr>
              {!collapsed[site.id] &&
                site.companies.map((company) => {
                  const key = `${site.id}-${company.name}`
                  const [leader, ...members] = company.workers
                  const rows = [leader, ...members.filter((w) => matchesFilter(w, filter))]
                  return [
                    <tr key={key} className="border-b border-zinc-100">
                      <th colSpan={colSpan} scope="rowgroup" className="p-0">
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          aria-expanded={!collapsed[key]}
                          className="sticky left-0 flex items-center gap-2 py-3 pr-4 pl-8 text-sm font-bold text-zinc-800"
                        >
                          <ChevronDown className={cn('size-3.5 text-zinc-400 transition-transform', collapsed[key] && '-rotate-90')} aria-hidden />
                          {company.name}
                          <span className="font-normal text-zinc-500">（{company.tier}）</span>
                        </button>
                      </th>
                    </tr>,
                    ...(collapsed[key]
                      ? []
                      : rows.map((w) => {
                          const selected = selectedId === w.id
                          const rowBg = selected ? 'bg-[#F5F5F3]' : 'bg-white'
                          const sub = profile(w)
                          return (
                            <tr
                              key={w.id}
                              onClick={() => onSelect(w)}
                              aria-selected={selected}
                              className={cn('group cursor-pointer border-b border-zinc-100 transition-colors', rowBg)}
                            >
                              <td className={cn('sticky left-0 z-[1] py-3.5 pr-4 pl-14 group-hover:bg-[#FAFAF9]', rowBg)}>
                                <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                                  {w.isLeader && (
                                    <span className="flex items-center gap-0.5 text-[11px] font-medium text-zinc-500">
                                      <Shield className="size-3" aria-hidden />
                                      職長
                                    </span>
                                  )}
                                  <span className="text-sm font-bold text-zinc-900">{w.name}</span>
                                  {w.cumulative && (
                                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">累積注意</span>
                                  )}
                                </div>
                                {sub && <p className="mt-0.5 text-xs leading-tight text-zinc-500">{sub}</p>}
                              </td>
                              <td className={cn('sticky left-[260px] z-[1] px-3 py-3.5 group-hover:bg-[#FAFAF9]', rowBg)}>
                                <StatusLabel status={w.status} />
                                {w.statusNote && <p className="mt-1 truncate text-xs leading-tight text-zinc-400">{w.statusNote}</p>}
                              </td>
                              {extraCols.map((k) => (
                                <td key={k} className="whitespace-nowrap px-3 py-3.5">
                                  {k === 'leader' && <span className="text-sm text-zinc-600">{w.leaderName}</span>}
                                  {k === 'vitals' && (
                                    <span className="flex items-baseline gap-2">
                                      <span className={cn('font-mono text-sm font-semibold', isBpOver(w) ? 'text-red-600' : 'text-zinc-900')}>
                                        {w.sys}/{w.dia}
                                      </span>
                                      <span className={cn('text-xs', w.sleep === '5時間以下' ? 'font-semibold text-amber-600' : 'text-zinc-500')}>
                                        {w.sleep}
                                      </span>
                                    </span>
                                  )}
                                </td>
                              ))}
                              {w.timeline.map((c, i) => (
                                <td key={TIMES[i]} className={cn('px-2 py-3.5', i === CURRENT_TIME_INDEX && 'bg-[#F8F8F7]/60')}>
                                  <TimelineDot cell={c} />
                                </td>
                              ))}
                            </tr>
                          )
                        })),
                  ]
                })}
            </tbody>
          )
        })}
      </table>
    </div>
  )
}
