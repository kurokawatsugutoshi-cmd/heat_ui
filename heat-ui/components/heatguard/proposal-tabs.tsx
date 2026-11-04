'use client'

import { useState } from 'react'
import { ScreenColumn } from '@/components/showcase/screen-caption'
import { ConsentScreen } from '@/components/heatguard/entry/consent-screen'
import { MorningCheckScreen } from '@/components/heatguard/entry/morning-check-screen'
import { EntryBlockScreen } from '@/components/heatguard/entry/entry-block-screen'
import { DaytimePage } from '@/components/heatguard/daytime/daytime-page'
import { ManagerPage } from '@/components/heatguard/manager/manager-page'
import { AdminDashboard } from '@/components/heatguard/admin/admin-dashboard'
import { useFlash } from '@/components/heatguard/use-flash'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'entry', no: '1', label: '朝の入場', title: '朝の入場：自動認証 ＆ 朝の体調・バイタルチェック' },
  { id: 'daytime', no: '2', label: '作業員の日中運用', title: '作業員の日中運用：ホーム ＆ 定時チェック ＆ 危険アラート' },
  { id: 'manager', no: '3', label: '管理者の初動', title: '管理者（職長・監督）の初動通知 ＆ 対応記録フロー' },
  { id: 'admin', no: '4', label: '本部ダッシュボード', title: '事務所・本部 全体ダッシュボード（Admin PC）' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ProposalTabs() {
  const [active, setActive] = useState<TabId>('entry')
  const [highlight, flash] = useFlash<'morning'>()
  const current = tabs.find((t) => t.id === active)!

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3">
          <div className="leading-tight">
            <p className="text-base font-bold tracking-wide text-blue-950">HEATGUARD</p>
            <p className="text-xs font-semibold tracking-wider text-blue-600">SAFETY MONITOR</p>
          </div>
          <nav aria-label="画面切替" className="flex-1 overflow-x-auto">
            <div role="tablist" className="flex w-max gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={active === t.id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors',
                    active === t.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <span className={active === t.id ? 'text-blue-600' : 'text-slate-400'}>{t.no}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">ページ{current.no}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{current.title}</h1>
        </div>

        <section role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`}>
          {active === 'entry' && (
            <div className="flex flex-wrap justify-center gap-8">
              <ScreenColumn id="W-01" title="入場QR自動認証 ＆ 初回同意">
                <ConsentScreen onAgree={() => flash('morning')} />
              </ScreenColumn>
              <ScreenColumn id="W-02" title="朝の体調・バイタルチェック">
                <MorningCheckScreen highlighted={highlight === 'morning'} onEntered={() => setActive('daytime')} />
              </ScreenColumn>
              <ScreenColumn id="W-03" title="入場制限・上長確認モーダル">
                <EntryBlockScreen />
              </ScreenColumn>
            </div>
          )}
          {active === 'daytime' && <DaytimePage />}
          {active === 'manager' && <ManagerPage />}
          {active === 'admin' && <AdminDashboard />}
        </section>
      </div>
    </main>
  )
}
