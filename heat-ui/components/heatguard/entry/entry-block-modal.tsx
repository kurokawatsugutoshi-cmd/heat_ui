'use client'

import { CircleAlert } from 'lucide-react'
import { ActionButton } from '@/components/heatguard/mobile-ui'

type EntryBlockModalProps = {
  findings: string[]
  onResolve?: () => void
}

export function EntryBlockModal({ findings, onResolve }: EntryBlockModalProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-center bg-slate-900/40 px-4">
      <div
        role="alertdialog"
        aria-labelledby="entry-block-title"
        className="rounded-2xl bg-white px-5 pt-5 pb-4 shadow-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <h2 id="entry-block-title" className="type-title flex items-center justify-center gap-2 text-ink">
          <CircleAlert className="size-6 shrink-0 text-red-600" aria-hidden />
          入場ストップ
        </h2>

        <p className="mt-3 text-base leading-relaxed text-ink">
          以下の項目が安全基準を超過しているため、作業開始前に職長または現場監督の対面確認を受けてください。
        </p>

        <ul className="mt-3 space-y-1 rounded-md p-3 text-base text-red-600 ring-1 ring-inset ring-red-600">
          {findings.map((f) => (
            <li key={f}>・{f}</li>
          ))}
        </ul>

        <p className="mt-3 rounded-md bg-canvas p-3 text-base leading-relaxed text-ink">
          担当職長（鈴木 一郎）へ自動通知しました。詰所にて待機してください。
        </p>

        <div className="mt-4 space-y-2">
          <p className="type-caption text-center">※対面での状態確認後、職長または監督が操作してください</p>
          <ActionButton onClick={onResolve}>職長押下で解除</ActionButton>
        </div>
      </div>
    </div>
  )
}
