'use client'

import { useState } from 'react'
import { DemoTabs, ScreenColumn } from '@/components/showcase/screen-caption'
import { WorkerHomeScreen } from '@/components/heatguard/daytime/worker-home-screen'
import { HourlyCheckScreen, type CheckResult } from '@/components/heatguard/daytime/hourly-check-screen'
import { DangerAlertScreen, type AlertStage } from '@/components/heatguard/daytime/danger-alert-screen'
import { useFlash } from '@/components/heatguard/use-flash'

export function DaytimePage() {
  const [stage, setStage] = useState<AlertStage>('alert')
  const [highlight, flash] = useFlash<'check' | 'alert'>()

  const handleSubmit = (result: CheckResult) => {
    if (result === 'danger') {
      setStage('alert')
      flash('alert')
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-8">
      <ScreenColumn id="W-04" title="作業員・職長 共通ホーム（待機・気象連動）">
        <WorkerHomeScreen onStartCheck={() => flash('check')} />
      </ScreenColumn>
      <ScreenColumn id="W-04_2" title="日中の定時チェック">
        <HourlyCheckScreen onSubmit={handleSubmit} highlighted={highlight === 'check'} />
      </ScreenColumn>
      <ScreenColumn
        id="W-05"
        title="日中危険アラート発令（2段階）"
        footer={
          <DemoTabs
            label="デモ切替（画面外）"
            value={stage}
            onChange={setStage}
            tabs={[
              { value: 'alert', label: 'State 1 発令直後' },
              { value: 'resting', label: 'State 2 休憩中' },
            ]}
          />
        }
      >
        <DangerAlertScreen stage={stage} onStageChange={setStage} highlighted={highlight === 'alert'} />
      </ScreenColumn>
    </div>
  )
}
