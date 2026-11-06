'use client'

import { useState } from 'react'
import { DemoTabs, SCREEN_GRID, ScreenColumn } from '@/components/showcase/screen-caption'
import { ManagerHomeScreen } from '@/components/heatguard/manager/manager-home-screen'
import { AlertListScreen } from '@/components/heatguard/manager/alert-list-screen'
import {
  AlertResponseScreen,
  type ResponseStep,
  type TreatmentId,
  type Viewer,
} from '@/components/heatguard/manager/alert-response-screen'

export function ManagerPage() {
  const [step, setStep] = useState<ResponseStep>('pending')
  const [treatment, setTreatment] = useState<TreatmentId | null>(null)
  const [viewer, setViewer] = useState<Viewer>('self')

  const changeStep = (next: ResponseStep) => {
    setStep(next)
    if (next !== 'choosing') setTreatment(null)
  }

  return (
    <div className={SCREEN_GRID}>
      <ScreenColumn id="A-01" title="管理者ホーム（Teams通知 ＆ 部下アラート）">
        <ManagerHomeScreen />
      </ScreenColumn>
      <ScreenColumn id="A-03" title="アラート者リスト（同時発生）">
        <AlertListScreen />
      </ScreenColumn>
      <ScreenColumn
        id="A-02"
        title="アラート対応 ＆ 処置内容4択記録"
        footer={
          <div className="space-y-2">
            <DemoTabs
              label="デモ切替（画面外）"
              value={step}
              onChange={changeStep}
              tabs={[
                { value: 'pending', label: '1 向かう' },
                { value: 'responding', label: '2 対応完了' },
                { value: 'choosing', label: '3 処置内容' },
              ]}
            />
            <DemoTabs
              label="表示端末"
              value={viewer}
              onChange={setViewer}
              tabs={[
                { value: 'self', label: '自分（鈴木 一郎）' },
                { value: 'other', label: '他の管理者' },
              ]}
            />
          </div>
        }
      >
        <AlertResponseScreen
          step={step}
          onStepChange={changeStep}
          treatment={treatment}
          onTreatmentChange={setTreatment}
          viewer={viewer}
        />
      </ScreenColumn>
    </div>
  )
}
