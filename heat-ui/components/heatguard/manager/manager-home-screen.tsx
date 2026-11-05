'use client'

import { WorkerHomeScreen } from '@/components/heatguard/daytime/worker-home-screen'

export function ManagerHomeScreen() {
  return (
    <WorkerHomeScreen
      label="A-01 管理者ホーム画面"
      time="14:30"
      company="〇〇鉄筋工業"
      role="職長"
      name="鈴木 一郎"
      counts={{ good: 3, bad: 1 }}
      teamsPush={{
        title: 'Microsoft Teams｜熱中症アラート通知',
        body: '〇〇工務店 大和 太郎さんに危険アラートが発生しました（14:25 めまい申告）',
      }}
      onStartCheck={() => undefined}
    />
  )
}
