export type Cell = 'g' | 'y' | 'r' | 'n' | 'f'
export type Status = 'normal' | 'caution' | 'alert' | 'responding' | 'leave'
export type Sleep = '7時間以上' | '6時間' | '5時間以下'

export type Worker = {
  id: string
  name: string
  lang: string
  age: number
  company: string
  tier: string
  leaderName: string
  leaderTel: string
  isLeader?: boolean
  status: Status
  statusNote?: string
  sys: number
  dia: number
  pulse: number
  sleep: Sleep
  cumulative?: boolean
  latest: string
  timeline: Cell[]
  history: string[]
}

export type Company = { name: string; tier: string; workers: Worker[] }
export type Site = { id: string; name: string; companies: Company[] }

export const TIMES = ['9:00', '10:00', '10:30', '11:00', '13:00', '14:00', '15:00', '16:00']
export const CURRENT_TIME_INDEX = 5

export const BP_LIMIT = { sys: 180, dia: 110 }

export const LANG_LABELS: Record<string, string> = {
  JP: '日本語 (JP)',
  VI: 'ベトナム語 (VI)',
  EN: '英語 (EN)',
  ZH: '中国語 (ZH)',
  ID: 'インドネシア語 (ID)',
}

const SUZUKI_TEL = '090-1234-5678'
const TANAKA_TEL = '090-2345-6789'
const YAMAMOTO_TEL = '090-3456-7890'

export const SITES: Site[] = [
  {
    id: 'daiwa',
    name: '大和ハウス 〇〇新築工事現場',
    companies: [
      {
        name: '〇〇鉄筋工業',
        tier: '一次請け',
        workers: [
          {
            id: 'w1',
            name: '鈴木 一郎',
            lang: 'JP',
            age: 52,
            company: '〇〇鉄筋工業',
            tier: '一次請け',
            leaderName: '鈴木 一郎',
            leaderTel: SUZUKI_TEL,
            isLeader: true,
            status: 'normal',
            statusNote: 'グエン・ヴァン 対応中',
            sys: 132,
            dia: 84,
            pulse: 72,
            sleep: '7時間以上',
            latest: '14:00 定時報告：元気（変化なし）',
            timeline: ['g', 'g', 'g', 'g', 'g', 'g', 'f', 'f'],
            history: [],
          },
          {
            id: 'w2',
            name: 'グエン・ヴァン',
            lang: 'VI',
            age: 27,
            company: '〇〇鉄筋工業',
            tier: '一次請け',
            leaderName: '鈴木 一郎',
            leaderTel: SUZUKI_TEL,
            status: 'responding',
            statusNote: '鈴木職長 対応中',
            sys: 180,
            dia: 110,
            pulse: 88,
            sleep: '5時間以下',
            cumulative: true,
            latest: '14:25 めまい申告（鈴木職長が対応中）',
            timeline: ['g', 'y', 'y', 'g', 'y', 'r', 'f', 'f'],
            history: ['10/30 (金) 14:00：少しだるい → 処置「注意して作業継続（翌日引継）」', '10/28 (水) 07:45：睡眠不足（5時間以下）'],
          },
          {
            id: 'w3',
            name: 'チャン・ミン',
            lang: 'VI',
            age: 31,
            company: '〇〇鉄筋工業',
            tier: '一次請け',
            leaderName: '鈴木 一郎',
            leaderTel: SUZUKI_TEL,
            status: 'caution',
            statusNote: '前日引継',
            sys: 138,
            dia: 88,
            pulse: 80,
            sleep: '6時間',
            cumulative: true,
            latest: '14:00 定時報告：少しだるい（バテ気味）',
            timeline: ['g', 'g', 'y', 'y', 'g', 'y', 'f', 'f'],
            history: ['10/30 (金) 14:00：脱水の疑いあり', '10/29 (木) 14:00：少しだるい'],
          },
          {
            id: 'w4',
            name: '佐藤 健',
            lang: 'JP',
            age: 44,
            company: '〇〇鉄筋工業',
            tier: '一次請け',
            leaderName: '鈴木 一郎',
            leaderTel: SUZUKI_TEL,
            status: 'normal',
            statusNote: '10分上長通知',
            sys: 124,
            dia: 78,
            pulse: 70,
            sleep: '7時間以上',
            latest: '14:00 定時チェック未入力（5分本人通知済）',
            timeline: ['g', 'g', 'g', 'g', 'g', 'n', 'f', 'f'],
            history: [],
          },
        ],
      },
      {
        name: '〇〇工務店',
        tier: '二次請け',
        workers: [
          {
            id: 'w5',
            name: '田中 誠',
            lang: 'JP',
            age: 48,
            company: '〇〇工務店',
            tier: '二次請け',
            leaderName: '田中 誠',
            leaderTel: TANAKA_TEL,
            isLeader: true,
            status: 'normal',
            sys: 128,
            dia: 80,
            pulse: 68,
            sleep: '7時間以上',
            latest: '14:00 定時報告：元気（変化なし）',
            timeline: ['g', 'g', 'g', 'g', 'g', 'g', 'f', 'f'],
            history: [],
          },
          {
            id: 'w6',
            name: '大和 太郎',
            lang: 'JP',
            age: 35,
            company: '〇〇工務店',
            tier: '二次請け',
            leaderName: '田中 誠',
            leaderTel: TANAKA_TEL,
            status: 'normal',
            sys: 120,
            dia: 80,
            pulse: 70,
            sleep: '7時間以上',
            latest: '14:00 定時報告：元気（変化なし）',
            timeline: ['g', 'g', 'g', 'g', 'g', 'g', 'f', 'f'],
            history: [],
          },
          {
            id: 'w7',
            name: 'ブディ・サントソ',
            lang: 'ID',
            age: 29,
            company: '〇〇工務店',
            tier: '二次請け',
            leaderName: '田中 誠',
            leaderTel: TANAKA_TEL,
            status: 'caution',
            statusNote: '朝の要注意',
            sys: 150,
            dia: 96,
            pulse: 84,
            sleep: '6時間',
            latest: '14:00 定時報告：元気（変化なし）',
            timeline: ['y', 'g', 'g', 'g', 'y', 'g', 'f', 'f'],
            history: ['10/31 (土) 07:40：朝の血圧やや高め（150/96）'],
          },
        ],
      },
    ],
  },
  {
    id: 'kaishu',
    name: '△△改修工事現場',
    companies: [
      {
        name: '△△建設',
        tier: '一次請け',
        workers: [
          {
            id: 'w8',
            name: '山本 大輔',
            lang: 'JP',
            age: 56,
            company: '△△建設',
            tier: '一次請け',
            leaderName: '山本 大輔',
            leaderTel: YAMAMOTO_TEL,
            isLeader: true,
            status: 'normal',
            sys: 136,
            dia: 86,
            pulse: 74,
            sleep: '7時間以上',
            latest: '14:00 定時報告：元気（変化なし）',
            timeline: ['g', 'g', 'g', 'g', 'g', 'g', 'f', 'f'],
            history: [],
          },
          {
            id: 'w9',
            name: '王 偉',
            lang: 'ZH',
            age: 33,
            company: '△△建設',
            tier: '一次請け',
            leaderName: '山本 大輔',
            leaderTel: YAMAMOTO_TEL,
            status: 'normal',
            statusNote: '5分本人通知済',
            sys: 118,
            dia: 76,
            pulse: 66,
            sleep: '7時間以上',
            latest: '14:00 定時チェック未入力（5分本人通知済）',
            timeline: ['g', 'g', 'g', 'g', 'g', 'n', 'f', 'f'],
            history: [],
          },
          {
            id: 'w10',
            name: 'マイケル・リー',
            lang: 'EN',
            age: 41,
            company: '△△建設',
            tier: '一次請け',
            leaderName: '山本 大輔',
            leaderTel: YAMAMOTO_TEL,
            status: 'leave',
            statusNote: '13:20 早退',
            sys: 142,
            dia: 90,
            pulse: 82,
            sleep: '5時間以下',
            cumulative: true,
            latest: '11:00 頭痛申告 → 処置「本日の作業中止・早退」',
            timeline: ['g', 'y', 'y', 'r', 'n', 'n', 'f', 'f'],
            history: ['10/31 (土) 11:00：頭痛 → 処置「本日の作業中止・早退」', '10/29 (木) 07:45：睡眠不足（5時間以下）'],
          },
        ],
      },
    ],
  },
]

export type ColumnKey = 'age' | 'company' | 'leader' | 'vitals'
export const COLUMN_LABELS: Record<ColumnKey, string> = {
  age: '年齢',
  company: '所属工務店',
  leader: '担当職長名',
  vitals: '朝バイタル・睡眠',
}

export type FilterKey = 'all' | 'attention' | 'missing'
export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'すべて (142)' },
  { key: 'attention', label: 'アラート・要注意 (7)' },
  { key: 'missing', label: '未入力 (2)' },
]

export function matchesFilter(worker: Worker, filter: FilterKey) {
  if (filter === 'attention') return worker.status === 'alert' || worker.status === 'responding' || worker.status === 'caution'
  if (filter === 'missing') return worker.timeline[CURRENT_TIME_INDEX] === 'n' && worker.status !== 'leave'
  return true
}

export function isBpOver(worker: Worker) {
  return worker.sys >= BP_LIMIT.sys || worker.dia >= BP_LIMIT.dia
}
