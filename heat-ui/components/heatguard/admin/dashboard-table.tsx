'use client'

import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Frown, Meh, Shield, Smile } from 'lucide-react'
import {
  COLUMN_LABELS,
  CURRENT_TIME_INDEX,
  LANG_LABELS,
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
const TIME_COL = 55
const VISIBLE_TIMES = 4

function potchiTone(status: Status) {
  if (status === 'alert' || status === 'responding') return 'red'
  if (status === 'caution') return 'orange'
  return null
}

function TimelineFace({ cell }: { cell: Cell }) {
  const label = CELL_LABELS[cell]
  if (cell === 'f') return <span className="sr-only">{label}</span>
  if (cell === 'n') {
    return (
      <span role="img" aria-label={label} className="mx-auto flex size-4 items-center justify-center">
        <span className="size-1.5 rounded-full border border-line" />
      </span>
    )
  }
  const Icon = cell === 'g' ? Smile : cell === 'y' ? Meh : Frown
  const color = cell === 'g' ? 'text-blue-600' : cell === 'y' ? 'text-amber-500' : 'text-red-600'
  return <Icon role="img" aria-label={label} className={cn('mx-auto size-4', color)} />
}

const MARK_COL = 'flex w-6 shrink-0 items-center justify-center'
const NAME_LIMIT = 10

function displayName(name: string) {
  const chars = [...name]
  if (chars.length <= NAME_LIMIT) return name
  return `${chars.slice(0, NAME_LIMIT).join('')}・・・`
}

function LeadingMark({ worker }: { worker: Worker }) {
  const tone = potchiTone(worker.status)
  if (!worker.isLeader && !tone) return <span className={MARK_COL} />
  return (
    <span className={cn(MARK_COL, 'gap-0.5')}>
      {worker.isLeader && <Shield className="size-3.5 text-zinc-400" aria-label="職長" />}
      {tone && (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', tone === 'red' ? 'bg-red-500' : 'bg-orange-500')}
          aria-label={tone === 'red' ? '異常' : '要注意'}
        />
      )}
    </span>
  )
}

const STATUS_PILL: Record<Status, { label: string; tone?: 'red' | 'orange' }> = {
  normal: { label: '良好' },
  caution: { label: '要注意', tone: 'orange' },
  alert: { label: '異常', tone: 'red' },
  responding: { label: '異常/対応中', tone: 'red' },
  leave: { label: '早退' },
}

function isAbnormal(status: Status) {
  return status === 'alert' || status === 'responding'
}

function rowBgClass(status: Status, selected: boolean) {
  if (isAbnormal(status)) return selected ? 'bg-red-100' : 'bg-red-50'
  return selected ? 'bg-canvas' : 'bg-white'
}

function StatusLabel({ status }: { status: Status }) {
  const { label, tone } = STATUS_PILL[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[10px] text-zinc-500',
        tone === 'red' && 'border border-red-500',
        tone === 'orange' && 'border border-orange-500',
        !tone && 'border border-line',
      )}
    >
      {tone && <span className={cn('size-1.5 rounded-full', tone === 'red' ? 'bg-red-500' : 'bg-orange-500')} aria-hidden />}
      {label}
    </span>
  )
}

type DashboardTableProps = {
  sites: Site[]
  columns: Record<ColumnKey, boolean>
  filter: FilterKey
  selectedId: string | null
  compact?: boolean
  onSelect: (worker: Worker) => void
}

export function DashboardTable({ sites, columns, filter, selectedId, compact = false, onSelect }: DashboardTableProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showTimeline, setShowTimeline] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ x: 0, scroll: 0, moved: false })
  const toggle = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }))
  const showAge = columns.age
  const showCompany = columns.company
  const showLeader = columns.leader
  const showVitals = columns.vitals
  const frozenSpan = 3 + Number(showAge) + Number(showCompany) + Number(showLeader) + Number(showVitals)
  const lastFrozen = showLeader ? 'leader' : showVitals ? 'vitals' : showCompany ? 'company' : showAge ? 'age' : 'status'
  const seam = (key: string) => (key === lastFrozen ? 'border-r border-zinc-100' : undefined)
  const padX = compact ? 'px-2.5' : 'px-[17px]'

  useLayoutEffect(() => {
    if (!showTimeline || !scrollRef.current) return
    const start = Math.max(0, CURRENT_TIME_INDEX - (VISIBLE_TIMES - 2))
    scrollRef.current.scrollLeft = start * TIME_COL
  }, [showTimeline])

  const onSlideStart = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    drag.current = { x: e.clientX, scroll: el.scrollLeft, moved: false }
    el.setPointerCapture(e.pointerId)
  }

  const onSlideMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el || !el.hasPointerCapture(e.pointerId)) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 3) drag.current.moved = true
    el.scrollLeft = drag.current.scroll - dx
  }

  const onSlideEnd = (e: PointerEvent<HTMLDivElement>) => {
    scrollRef.current?.releasePointerCapture(e.pointerId)
  }

  const selectWorker = (w: Worker) => {
    if (drag.current.moved) return
    onSelect(w)
  }

  const frozenHead = (
    <tr className="border-b border-line text-[10px] text-zinc-400">
      <th scope="col" className={cn('sticky left-0 z-10 whitespace-nowrap bg-white py-2 font-medium', padX)}>
        氏名
      </th>
      <th scope="col" className={cn('whitespace-nowrap py-2 font-medium', padX)}>
        言語
      </th>
      <th scope="col" className={cn('whitespace-nowrap py-2 font-medium', padX)}>
        ステート
      </th>
      {showAge && (
        <th scope="col" className={cn('whitespace-nowrap py-2 font-medium', padX)}>
          {COLUMN_LABELS.age}
        </th>
      )}
      {showCompany && (
        <th scope="col" className={cn('whitespace-nowrap py-2 font-medium', padX)}>
          所属
        </th>
      )}
      {showVitals && (
        <th scope="col" className={cn('whitespace-nowrap py-2 font-medium', padX)}>
          バイタル
        </th>
      )}
      {showLeader && (
        <th scope="col" className={cn('whitespace-nowrap py-2 font-medium', padX)}>
          {COLUMN_LABELS.leader}
        </th>
      )}
    </tr>
  )

  const frozenBodies = sites.map((site) => {
    const total = site.companies.reduce((n, c) => n + c.workers.length, 0)
    return (
      <tbody key={site.id}>
        <tr className="h-10 border-b border-line">
          <th colSpan={frozenSpan} scope="rowgroup" className="h-10 bg-canvas p-0 font-normal text-zinc-400">
            <button
              type="button"
              onClick={() => toggle(site.id)}
              aria-expanded={!collapsed[site.id]}
              className="sticky left-0 flex h-full items-center gap-1.5 px-3 text-xs font-normal whitespace-nowrap text-zinc-400"
            >
              <ChevronDown className={cn('size-3.5 text-zinc-400 transition-transform', collapsed[site.id] && '-rotate-90')} aria-hidden />
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
              <tr key={key} className="h-10 border-b border-line">
                <th colSpan={frozenSpan} scope="rowgroup" className="h-10 p-0 font-normal text-zinc-400">
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-expanded={!collapsed[key]}
                    className={cn('sticky left-0 flex h-full items-center text-xs font-normal whitespace-nowrap text-zinc-400', padX)}
                  >
                    <span className={MARK_COL}>
                      <ChevronDown className={cn('size-3 text-zinc-400 transition-transform', collapsed[key] && '-rotate-90')} aria-hidden />
                    </span>
                    {company.name}
                    <span>（{company.tier}）</span>
                  </button>
                </th>
              </tr>,
              ...(collapsed[key]
                ? []
                : rows.map((w) => {
                    const selected = selectedId === w.id
                    const rowBg = rowBgClass(w.status, selected)
                    const alertRow = isAbnormal(w.status)
                    return (
                      <tr
                        key={w.id}
                        onClick={() => selectWorker(w)}
                        aria-selected={selected}
                        className={cn('group h-10 cursor-pointer border-b border-line whitespace-nowrap transition-colors', rowBg)}
                      >
                        <td className={cn('sticky left-0 z-[1] py-1.5', padX, rowBg, alertRow ? 'group-hover:bg-red-100' : 'group-hover:bg-canvas')}>
                          <span className="flex items-center">
                            <LeadingMark worker={w} />
                            <span className="text-xs font-medium text-zinc-500" title={w.name}>
                              {displayName(w.name)}
                            </span>
                          </span>
                        </td>
                        <td className={cn('py-1.5', padX)}>
                          <span className="text-[10px] text-zinc-500" title={LANG_LABELS[w.lang]}>
                            {w.lang}
                          </span>
                        </td>
                        <td className={cn('py-1.5', padX, seam('status'))}>
                          <StatusLabel status={w.status} />
                        </td>
                        {showAge && (
                          <td className={cn('py-1.5', padX, seam('age'))}>
                            <span className="text-xs text-zinc-500">{w.age}歳</span>
                          </td>
                        )}
                        {showCompany && (
                          <td className={cn('py-1.5', padX, seam('company'))}>
                            <span className="text-xs text-zinc-500">{w.company}</span>
                          </td>
                        )}
                        {showVitals && (
                          <td className={cn('py-1.5', padX, seam('vitals'))}>
                            <span className={cn('font-mono text-xs', isBpOver(w) ? 'text-red-600' : 'text-zinc-500')}>
                              {w.sys}/{w.dia}
                            </span>
                          </td>
                        )}
                        {showLeader && (
                          <td className={cn('py-1.5', padX, seam('leader'))}>
                            <span className="text-xs text-zinc-500">{w.leaderName}</span>
                          </td>
                        )}
                      </tr>
                    )
                  })),
            ]
          })}
      </tbody>
    )
  })

  const timeBodies = sites.map((site) => (
    <tbody key={site.id}>
      <tr className="h-10 border-b border-line">
        <th colSpan={TIMES.length} className="h-10 bg-canvas p-0 font-normal" />
      </tr>
      {!collapsed[site.id] &&
        site.companies.map((company) => {
          const key = `${site.id}-${company.name}`
          const [leader, ...members] = company.workers
          const rows = [leader, ...members.filter((w) => matchesFilter(w, filter))]
          return [
            <tr key={key} className="h-10 border-b border-line">
              <th colSpan={TIMES.length} className="h-10 p-0 font-normal" />
            </tr>,
            ...(collapsed[key]
              ? []
              : rows.map((w) => {
                  const selected = selectedId === w.id
                  const rowBg = rowBgClass(w.status, selected)
                  const alertRow = isAbnormal(w.status)
                  return (
                    <tr
                      key={w.id}
                        onClick={() => selectWorker(w)}
                      aria-selected={selected}
                      className={cn('group h-10 cursor-pointer border-b border-line whitespace-nowrap transition-colors', rowBg)}
                    >
                      {w.timeline.map((c, i) => (
                        <td
                          key={TIMES[i]}
                          style={{ minWidth: TIME_COL }}
                          className={cn('px-0.5 py-1.5', i === CURRENT_TIME_INDEX && (alertRow ? 'bg-red-100' : 'bg-canvas'))}
                        >
                          <TimelineFace cell={c} />
                        </td>
                      ))}
                    </tr>
                  )
                })),
          ]
        })}
    </tbody>
  ))

  return (
    <div className={cn('flex w-full items-stretch', !compact && 'min-w-max')}>
      <div className={cn(compact ? 'min-w-0 overflow-x-auto [scrollbar-width:thin]' : 'shrink-0')}>
        <table className="w-max border-collapse text-left text-xs">
          <thead>{frozenHead}</thead>
          {frozenBodies}
        </table>
      </div>

      <div className="relative min-w-[220px] flex-1">
        <button
          type="button"
          aria-expanded={showTimeline}
          aria-controls="worker-timeline"
          onClick={() => setShowTimeline((v) => !v)}
          className="absolute top-1.5 -left-2 z-10 flex size-4 items-center justify-center text-zinc-400 hover:text-zinc-600"
        >
          {showTimeline ? <ChevronRight className="size-3" aria-hidden /> : <ChevronLeft className="size-3" aria-hidden />}
          <span className="sr-only">{showTimeline ? '体調タイムラインを隠す' : '体調タイムラインを表示'}</span>
        </button>

        {showTimeline && (
          <div id="worker-timeline" className="h-full w-full">
            <div
              ref={scrollRef}
              onPointerDown={onSlideStart}
              onPointerMove={onSlideMove}
              onPointerUp={onSlideEnd}
              onPointerCancel={onSlideEnd}
              className="h-full w-full cursor-grab overflow-x-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-[10px] text-zinc-400">
                    {TIMES.map((t, i) => (
                      <th
                        key={t}
                        scope="col"
                        style={{ minWidth: TIME_COL }}
                        className={cn('px-0.5 py-2 text-center font-mono font-medium', i === CURRENT_TIME_INDEX && 'text-zinc-500')}
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                {timeBodies}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
