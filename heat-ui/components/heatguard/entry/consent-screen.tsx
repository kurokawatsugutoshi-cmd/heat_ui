'use client'

import { useState } from 'react'
import { ScanFace } from 'lucide-react'
import { PhoneFrame } from '@/components/showcase/device-frames'
import { type Lang } from '@/components/showcase/phone-header'
import { ActionButton } from '@/components/heatguard/mobile-ui'
import { SCREEN_BODY, WorkerFooter, WorkerHeader } from '@/components/heatguard/worker-chrome'
import { cn } from '@/lib/utils'

const consent: Record<Lang, { title: string; body: string[] }> = {
  JP: {
    title: '健康データ・要配慮個人情報の取り扱いについて',
    body: [
      '本システムは、熱中症予防および安全管理を目的として、体調・血圧・脈拍・睡眠時間等の健康データを取得します。',
      '取得したデータは、元請安全衛生管理者および所属会社の職長のみが閲覧し、安全管理の目的外には利用いたしません。',
      'データは暗号化して保管し、工事終了後、法令に定める保管期間を経過した時点で破棄します。',
    ],
  },
  VI: {
    title: 'Về việc xử lý dữ liệu sức khỏe và thông tin cá nhân nhạy cảm',
    body: [
      'Hệ thống thu thập dữ liệu sức khỏe như thể trạng, huyết áp, mạch và thời gian ngủ nhằm phòng ngừa say nắng và quản lý an toàn.',
      'Dữ liệu chỉ được người quản lý an toàn vệ sinh của nhà thầu chính và tổ trưởng của công ty bạn xem, không sử dụng ngoài mục đích quản lý an toàn.',
      'Dữ liệu được mã hóa khi lưu trữ và được hủy sau khi hết thời hạn lưu trữ theo pháp luật kể từ khi kết thúc công trình.',
    ],
  },
  EN: {
    title: 'Handling of Health Data and Sensitive Personal Information',
    body: [
      'This system collects health data such as physical condition, blood pressure, pulse and sleep hours for heatstroke prevention and safety management.',
      'The data is viewed only by the prime contractor’s safety and health manager and your company’s foreman, and is never used for purposes other than safety management.',
      'The data is stored encrypted and destroyed after the legally required retention period following completion of the construction work.',
    ],
  },
  ZH: {
    title: '关于健康数据及需特别注意的个人信息的处理',
    body: [
      '本系统以预防中暑及安全管理为目的，收集身体状况、血压、脉搏、睡眠时间等健康数据。',
      '所收集的数据仅由总包安全卫生管理人员及所属公司的班长查看，不会用于安全管理以外的目的。',
      '数据加密保存，并在工程结束后、法定保存期限届满时销毁。',
    ],
  },
  ID: {
    title: 'Penanganan Data Kesehatan dan Informasi Pribadi Sensitif',
    body: [
      'Sistem ini mengumpulkan data kesehatan seperti kondisi tubuh, tekanan darah, denyut nadi, dan jam tidur untuk pencegahan heatstroke dan manajemen keselamatan.',
      'Data hanya dilihat oleh manajer K3 kontraktor utama dan mandor perusahaan Anda, dan tidak digunakan di luar tujuan manajemen keselamatan.',
      'Data disimpan dalam bentuk terenkripsi dan dimusnahkan setelah masa simpan sesuai hukum berakhir sejak pekerjaan konstruksi selesai.',
    ],
  },
}

export function ConsentScreen({ onAgree }: { onAgree?: () => void }) {
  const [lang, setLang] = useState<Lang>('JP')
  const doc = consent[lang]

  return (
    <PhoneFrame label="W-01 入場QR自動認証と初回同意画面" time="7:41" frame="dark" className="bg-canvas text-ink">
      <WorkerHeader lang={lang} onLangChange={setLang} />
      <div className={cn(SCREEN_BODY, 'bg-canvas')}>
        <section className="-mx-1 rounded-2xl bg-white px-4 py-3">
          <p className="type-read flex items-center gap-2">
            <ScanFace className="size-5 shrink-0 text-blue-600" aria-hidden />
            顔認証ゲート通過データと照合完了
          </p>
          <p className="type-body mt-1 pl-7">大和ハウス 〇〇新築工事現場（入場時刻 07:41）</p>
        </section>

        <section className="-mx-1 flex min-h-0 flex-1 flex-col rounded-2xl bg-white">
          <p className="type-label px-4 py-3">{doc.title}</p>
          <div tabIndex={0} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-3">
            {doc.body.map((p) => (
              <p key={p} className="type-body">
                {p}
              </p>
            ))}
          </div>
        </section>

        <div className="space-y-2">
          <ActionButton onClick={onAgree}>同意して朝のチェックへ進む</ActionButton>
          <p className="type-caption text-center">※この同意画面は初回入場時のみ表示されます</p>
        </div>
      </div>
      <WorkerFooter />
    </PhoneFrame>
  )
}
