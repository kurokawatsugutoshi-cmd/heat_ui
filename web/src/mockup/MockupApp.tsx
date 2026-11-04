import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./mockup.css";

type Screen =
  | "gate"
  | "w01"
  | "w01fail"
  | "w03"
  | "w03lock"
  | "w04"
  | "w05"
  | "w06"
  | "w07"
  | "w08"
  | "w09"
  | "w10"
  | "w10alert"
  | "w11"
  | "a01"
  | "a02"
  | "a03"
  | "a04"
  | "a05"
  | "a06"
  | "a07"
  | "a08"
  | "a09"
  | "a10";

type Entry = "arrival" | "break" | "person";
type Level = "normal" | "caution" | "alert";
type Identity = { company: string; name: string; locked: boolean };
type Answers = Record<string, string>;
type Done = { form: "arrival" | "break"; at: string; level: Level };
type Polarity = "positive" | "negative" | null;

type Question = {
  code: string;
  form: "arrival" | "break";
  text: string;
  polarity: Polarity;
  kind: string;
};

type Notice = { title: string; body: string; site: string; from: string; to: string };
type Row = {
  id: string;
  time: string;
  kind: string;
  form: "arrival" | "break";
  site: string;
  company: string;
  name: string;
  companyName: string;
  value: string;
  level: Level;
  action: string;
  values: string[];
  reasons: string[];
};

const SCREENS: Screen[] = [
  "gate",
  "w01",
  "w01fail",
  "w03",
  "w03lock",
  "w04",
  "w05",
  "w06",
  "w07",
  "w08",
  "w09",
  "w10",
  "w10alert",
  "w11",
  "a01",
  "a02",
  "a03",
  "a04",
  "a05",
  "a06",
  "a07",
  "a08",
  "a09",
  "a10",
];

const NAV: { label: string; items: { id: Screen; name: string }[] }[] = [
  { label: "入口", items: [{ id: "gate", name: "遷移の開始" }] },
  {
    label: "作業者",
    items: [
      { id: "w01", name: "W-01 QR着地" },
      { id: "w01fail", name: "W-01 失敗" },
      { id: "w03", name: "W-03 手入力" },
      { id: "w03lock", name: "W-03 個人QR" },
      { id: "w04", name: "W-04 メニュー" },
      { id: "w05", name: "W-05 出社" },
      { id: "w06", name: "W-06 休憩" },
      { id: "w07", name: "W-07 セルフチェック" },
      { id: "w08", name: "W-08 応急処置" },
      { id: "w09", name: "W-09 緊急連絡" },
      { id: "w10", name: "W-10 送信完了" },
      { id: "w10alert", name: "W-10 赤" },
      { id: "w11", name: "W-11 お知らせ" },
    ],
  },
  {
    label: "管理者",
    items: [
      { id: "a01", name: "A-01 ログイン" },
      { id: "a02", name: "A-02 一覧" },
      { id: "a03", name: "A-03 詳細" },
      { id: "a04", name: "A-04 アラート" },
      { id: "a05", name: "A-05 現場・QR" },
      { id: "a06", name: "A-06 電話・閾値" },
      { id: "a07", name: "A-07 設問" },
      { id: "a08", name: "A-08 アカウント" },
      { id: "a09", name: "A-09 お知らせ" },
      { id: "a10", name: "A-10 抽出" },
    ],
  },
];

const CAPTION: Record<Screen, string> = {
  gate: "mockup.md の遷移です。設問文言と閾値は仮です。",
  w01: "設問はありません。続行で本人確認へ進みます。",
  w01fail: "使えないQRは、理由を出したままフォームへ進めません。",
  w03: "置くもの: 氏名・会社。置かない: 血圧・体調設問・顔撮影。",
  w03lock: "個人QRが成功したときは、氏名と会社を表示だけにします。",
  w04: "6つの入口。出社を送ったあとは「送信済み」を出せます。",
  w05: "出社時の設問だけです。はい／いいえに初期選択はなく、必須が埋まるまで送信できません。",
  w06: "休憩時の設問だけです。血圧・脈拍・睡眠はありません。",
  w07: "見るだけです。保存ボタンと判定はありません。",
  w08: "送信の前でも開けます。",
  w09: "この現場の番号です。送信の前でも開けます。",
  w10: "共有端末では「終了（次の人へ）」を主ボタンにします。",
  w10alert: "赤のときは連絡を促します。診断の断定文はありません。",
  w11: "件名と本文です。回答欄はありません。",
  a01: "管理ログインです。作業者フォームへのリンクはありません。",
  a02: "黄と赤の行には「注意」「警告」の文字を併記します。行を押すと詳細です。",
  a03: "値、判定の理由、対応、メモ。メモは作業者画面に出ません。",
  a04: "警告で未完了、出社チェックがない人、休憩間隔の超過（推定）、通知の記録。",
  a05: "電話、出社用と休憩用のQR、再発行。",
  a06: "緊急電話、閾値表（仮）、黄の即時通知スイッチ。",
  a07: "文言と極性は編集できます。値の型は編集しません。",
  a08: "管理者、作業者、個人リンクの発行。",
  a09: "件名・本文・現場・期間。出すと W-11 に載ります。",
  a10: "期間・現場・種別から、見本のCSVを保存します。",
};

const QUESTION_SEED: Question[] = [
  { code: "Q-SYS", form: "arrival", text: "最高血圧", polarity: null, kind: "VK-INT" },
  { code: "Q-DIA", form: "arrival", text: "最低血圧", polarity: null, kind: "VK-INT" },
  { code: "Q-HR", form: "arrival", text: "脈拍", polarity: null, kind: "VK-INT" },
  { code: "Q-SLEEP", form: "arrival", text: "睡眠", polarity: null, kind: "VK-CODE" },
  { code: "Q-JOB-01", form: "arrival", text: "仕事前の体調は問題ない", polarity: "positive", kind: "VK-YN" },
  { code: "Q-JOB-02", form: "arrival", text: "作業を始められる状態である", polarity: "positive", kind: "VK-YN" },
  { code: "Q-JOB-03", form: "arrival", text: "涼しい服装や冷却の用意がある", polarity: "positive", kind: "VK-YN" },
  { code: "Q-JOB-04", form: "arrival", text: "朝の水分を取った", polarity: "positive", kind: "VK-YN" },
  { code: "Q-HS-ARR", form: "arrival", text: "熱中症が疑われる症状がある", polarity: "negative", kind: "VK-YN" },
  { code: "Q-WATER", form: "break", text: "水分を補給した", polarity: "positive", kind: "VK-YN" },
  { code: "Q-SALT", form: "break", text: "塩分を補給した", polarity: "positive", kind: "VK-YN" },
  { code: "Q-COND", form: "break", text: "今の体調は問題ない", polarity: "positive", kind: "VK-YN" },
  { code: "Q-HS-BRK", form: "break", text: "熱中症が疑われる症状がある", polarity: "negative", kind: "VK-YN" },
];

const SELF = [
  ["水", "こまめな水分補給"],
  ["日", "直射日光を避ける"],
  ["湿", "湿度・室温に注意する"],
  ["服", "涼しい服装"],
  ["冷", "冷却グッズ"],
  ["塩", "適切な塩分補給"],
  ["休", "適切な休憩"],
  ["眠", "しっかり眠る"],
];

const AID = ["涼しい場所へ", "体を冷やす", "水分（飲めるなら）", "回復しなければ連絡"];

const ROWS: Row[] = [
  {
    id: "r1",
    time: "8:12",
    kind: "出社",
    form: "arrival",
    site: "A",
    company: "協A",
    companyName: "協力会社A",
    name: "佐藤 健",
    value: "170/95、脈拍88、睡眠5時間",
    level: "alert",
    action: "未",
    values: [
      "最高血圧 170 mmHg",
      "最低血圧 95 mmHg",
      "脈拍 88 bpm",
      "睡眠 5時間",
      "仕事前の体調は問題ない はい",
      "熱中症が疑われる症状がある はい",
    ],
    reasons: ["最高血圧 170（仮: 160以上）→ 警告", "睡眠 5時間 → 注意", "熱中症が疑われる症状がある → 警告"],
  },
  {
    id: "r2",
    time: "9:01",
    kind: "休憩",
    form: "break",
    site: "A",
    company: "協A",
    companyName: "協力会社A",
    name: "鈴木 葵",
    value: "水分:no",
    level: "caution",
    action: "—",
    values: ["水分を補給した いいえ", "塩分を補給した はい", "今の体調は問題ない はい", "熱中症が疑われる症状がある いいえ"],
    reasons: ["水分を補給した いいえ → 注意"],
  },
  {
    id: "r3",
    time: "8:40",
    kind: "出社",
    form: "arrival",
    site: "A",
    company: "協A",
    companyName: "協力会社A",
    name: "高橋 蓮",
    value: "122/78、脈拍72、睡眠7時間以上",
    level: "normal",
    action: "—",
    values: ["最高血圧 122 mmHg", "最低血圧 78 mmHg", "脈拍 72 bpm", "睡眠 7時間以上", "熱中症が疑われる症状がある いいえ"],
    reasons: ["通常"],
  },
];

const LEVEL_WORD: Record<Level, string> = { normal: "通常", caution: "注意", alert: "警告" };
const WITH_NAME = new Set<Screen>(["w03lock", "w04", "w05", "w06", "w07", "w08", "w09", "w10", "w10alert", "w11"]);
const ARRIVAL_REQUIRED = ["sys", "dia", "hr", "sleep", "Q-JOB-01", "Q-JOB-02", "Q-JOB-03", "Q-JOB-04", "Q-HS-ARR"];
const BREAK_REQUIRED = ["Q-WATER", "Q-SALT", "Q-COND", "Q-HS-BRK"];

function isScreen(value: string | null): value is Screen {
  return SCREENS.includes(value as Screen);
}

function readInitial(): Screen {
  const value = new URLSearchParams(window.location.search).get("s");
  return isScreen(value) ? value : "gate";
}

function nowLabel() {
  return new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

function arrivalError(answers: Answers) {
  if (ARRIVAL_REQUIRED.some((key) => !answers[key])) return "";
  const sys = Number(answers.sys);
  const dia = Number(answers.dia);
  const hr = Number(answers.hr);
  if (!Number.isInteger(sys) || sys < 70 || sys > 250) return "最高血圧は 70〜250 の整数です（仮）";
  if (!Number.isInteger(dia) || dia < 40 || dia > 150) return "最低血圧は 40〜150 の整数です（仮）";
  if (!Number.isInteger(hr) || hr < 30 || hr > 200) return "脈拍は 30〜200 の整数です（仮）";
  if (sys <= dia) return "最高血圧は最低血圧より大きい値にしてください";
  return "";
}

function judgeArrival(answers: Answers): Level {
  const sys = Number(answers.sys);
  const dia = Number(answers.dia);
  const hr = Number(answers.hr);
  const alert =
    answers["Q-HS-ARR"] === "yes" ||
    answers["Q-JOB-01"] === "no" ||
    answers["Q-JOB-02"] === "no" ||
    sys >= 160 ||
    dia >= 100 ||
    hr >= 140;
  if (alert) return "alert";
  const caution =
    answers["Q-JOB-03"] === "no" ||
    answers["Q-JOB-04"] === "no" ||
    answers.sleep === "h5" ||
    (sys >= 140 && sys <= 159) ||
    (dia >= 90 && dia <= 99) ||
    (hr >= 120 && hr <= 139);
  return caution ? "caution" : "normal";
}

function judgeBreak(answers: Answers): Level {
  if (answers["Q-HS-BRK"] === "yes" || answers["Q-COND"] === "no") return "alert";
  if (answers["Q-WATER"] === "no" || answers["Q-SALT"] === "no") return "caution";
  return "normal";
}

function demoIdentity(): Identity {
  return { company: "協力会社A", name: "佐藤 健", locked: true };
}

export function MockupApp() {
  const initial = readInitial();
  const [, setParams] = useSearchParams();
  const [stack, setStack] = useState<Screen[]>([initial]);
  const [entry, setEntry] = useState<Entry>(initial === "w06" ? "break" : initial === "w03lock" ? "person" : "arrival");
  const [lang, setLang] = useState("ja");
  const [identity, setIdentity] = useState<Identity | null>(WITH_NAME.has(initial) ? demoIdentity() : null);
  const [draftCompany, setDraftCompany] = useState("");
  const [draftName, setDraftName] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [arrived, setArrived] = useState(false);
  const [result, setResult] = useState<Done | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [phone, setPhone] = useState("000-0000-0000");
  const [notifyCaution, setNotifyCaution] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([
    {
      title: "午後の休憩を増やしてください",
      body: "気温が上がる時間帯です。水分と塩分をこまめに取ってください。",
      site: "サンプル現場A",
      from: "2026-10-31",
      to: "2026-11-30",
    },
  ]);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_SEED);
  const [judge, setJudge] = useState("");
  const [kind, setKind] = useState("");
  const [selectedId, setSelectedId] = useState("r1");
  const [actions, setActions] = useState<Record<string, { status: string; note: string }>>({});
  const [draftStatus, setDraftStatus] = useState("open");
  const [draftNote, setDraftNote] = useState("");
  const [savedFlash, setSavedFlash] = useState("");
  const [qrArrival, setQrArrival] = useState(1);
  const [qrBreak, setQrBreak] = useState(1);
  const [issuedLink, setIssuedLink] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");
  const [exportFrom, setExportFrom] = useState("2026-10-31");
  const [exportTo, setExportTo] = useState("2026-10-31");
  const [exportKind, setExportKind] = useState("all");
  const [noticeDraft, setNoticeDraft] = useState({
    title: "",
    body: "",
    site: "サンプル現場A",
    from: "2026-10-31",
    to: "2026-11-30",
  });

  const screen = stack[stack.length - 1];

  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get("s");
    if (current !== screen) setParams({ s: screen }, { replace: true });
  }, [screen, setParams]);

  function push(next: Screen) {
    setStack((items) => [...items, next]);
  }

  function back() {
    setStack((items) => {
      if (items.length > 1) return items.slice(0, -1);
      const current = items[0];
      if (current === "w07" || current === "w08" || current === "w09" || current === "w11") return ["w04"];
      if (current === "a03") return ["a02"];
      return items;
    });
  }

  function jump(next: Screen) {
    setResult(null);
    setSavedFlash("");
    setLoginError("");
    if (next === "w06") setEntry("break");
    if (next === "w03lock") setEntry("person");
    if (next === "w01" || next === "w01fail" || next === "w03" || next === "w05") setEntry("arrival");
    setIdentity(WITH_NAME.has(next) ? demoIdentity() : null);
    if (next === "w03") {
      setDraftCompany("");
      setDraftName("");
    }
    setStack([next]);
  }

  function start(nextEntry: Entry) {
    setEntry(nextEntry);
    setAnswers({});
    setArrived(false);
    setResult(null);
    setDraftCompany("");
    setDraftName("");
    if (nextEntry === "person") {
      setIdentity(demoIdentity());
      setStack(["w03lock"]);
      return;
    }
    setIdentity(null);
    setStack(["w01"]);
  }

  function rejectIdentity() {
    setIdentity(null);
    setDraftCompany("");
    setDraftName("");
    setAnswers({});
    setArrived(false);
    setStack(["w03"]);
  }

  function confirmManual() {
    if (!draftCompany || !draftName.trim()) return;
    setIdentity({ company: draftCompany, name: draftName.trim(), locked: false });
    push(entry === "break" ? "w06" : entry === "person" ? "w04" : "w05");
  }

  function setAnswer(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function textOf(code: string) {
    return questions.find((item) => item.code === code)?.text ?? code;
  }

  function submitArrival() {
    if (arrivalError(answers)) return;
    setArrived(true);
    setResult({ form: "arrival", at: nowLabel(), level: judgeArrival(answers) });
    push("w10");
  }

  function submitBreak() {
    setResult({ form: "break", at: nowLabel(), level: judgeBreak(answers) });
    push("w10");
  }

  function endSession() {
    setIdentity(null);
    setAnswers({});
    setArrived(false);
    setResult(null);
    setDraftCompany("");
    setDraftName("");
    if (entry === "person") setEntry("arrival");
    setStack(["w01"]);
  }

  const arrivalReady = ARRIVAL_REQUIRED.every((key) => answers[key]) && !arrivalError(answers);
  const breakReady = BREAK_REQUIRED.every((key) => answers[key]);
  const title = NAV.flatMap((group) => group.items).find((item) => item.id === screen)?.name ?? "";
  const wide = screen.startsWith("a") && screen !== "a01";
  const done: Done =
    result ?? {
      form: entry === "break" ? "break" : "arrival",
      at: "8:12",
      level: screen === "w10alert" ? "alert" : "normal",
    };

  const body = renderScreen();

  return (
    <div className="mock-studio">
      <aside className="mock-nav">
        <h1>画面モック</h1>
        <p>mockup.md</p>
        {NAV.map((group) => (
          <div key={group.label}>
            <h2>{group.label}</h2>
            {group.items.map((item) => (
              <button key={item.id} type="button" className={item.id === screen ? "on" : ""} onClick={() => jump(item.id)}>
                {item.name}
              </button>
            ))}
          </div>
        ))}
        <Link to="/">実装アプリへ</Link>
      </aside>
      <div className="mock-stage">
        <div className="mock-stage-head">
          <h2>{title}</h2>
          <p className="mock-caption">{CAPTION[screen]}</p>
        </div>
        {wide ? <div className="mock-desktop">{body}</div> : <div className="mock-phone">{body}</div>}
      </div>
    </div>
  );

  function renderScreen() {
    if (screen.startsWith("a") && screen !== "a01") {
      return (
        <>
          <nav className="mock-side">
            {(
              [
                ["a02", "当日の回答"],
                ["a04", "アラート"],
                ["a05", "現場・QR"],
                ["a06", "電話・閾値"],
                ["a07", "設問"],
                ["a08", "アカウント"],
                ["a09", "お知らせ"],
                ["a10", "抽出"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" className={screen === id ? "on" : ""} onClick={() => jump(id)}>
                {label}
              </button>
            ))}
          </nav>
          <div className="mock-main">{adminBody()}</div>
        </>
      );
    }
    if (screen === "a01") return loginCard();
    return (
      <>
        {screen !== "gate" && (
          <header className="mock-bar">
            <div>
              {screen !== "w01fail" && <span className="mock-site">サンプル現場A</span>}
              {identity && WITH_NAME.has(screen) && <span className="who">{identity.name}</span>}
            </div>
            <label className="lang">
              <span className="sr">言語</span>
              <select value={lang} onChange={(event) => setLang(event.target.value)}>
                <option value="ja">JA</option>
                <option value="en">EN</option>
                <option value="id">ID</option>
                <option value="vi">VI</option>
                <option value="zh-CN">中文</option>
              </select>
            </label>
          </header>
        )}
        {lang !== "ja" && screen !== "gate" && (
          <p className="mock-langnote">レイアウト確認のため、本文はこのモックでは日本語のままです。</p>
        )}
        <div className="sheet">{workerBody()}</div>
      </>
    );
  }

  function workerBody() {
    if (screen === "gate") {
      return (
        <div className="stack">
          <p className="kicker">Mock</p>
          <h1>画面モック</h1>
          <p>現場QR → W-01 → W-03 → 出社または休憩</p>
          <p>個人QR → W-03 → メニュー</p>
          <p>管理 → A-01 → A-02</p>
          <button className="button" type="button" onClick={() => start("arrival")}>
            現場QR（出社）
          </button>
          <button className="button" type="button" onClick={() => start("break")}>
            現場QR（休憩）
          </button>
          <button className="button ghost" type="button" onClick={() => start("person")}>
            個人QR
          </button>
          <button className="button ghost" type="button" onClick={() => jump("a01")}>
            管理コンソール
          </button>
        </div>
      );
    }
    if (screen === "w01") {
      return (
        <div className="stack">
          <h1>{entry === "break" ? "休憩時報告" : "出社時体調チェック"}</h1>
          <button className="button" type="button" onClick={() => push("w03")}>
            続行
          </button>
        </div>
      );
    }
    if (screen === "w01fail") {
      return (
        <div className="stack">
          <p className="error">このQRは使えません</p>
          <button className="button" type="button" onClick={() => setStack(["w01"])}>
            再試行
          </button>
        </div>
      );
    }
    if (screen === "w03") {
      return (
        <div className="stack">
          <h1>本人の確認</h1>
          <p>体調の質問はこの画面にはありません</p>
          <label>
            会社名
            <select value={draftCompany} onChange={(event) => setDraftCompany(event.target.value)}>
              <option value="">選択</option>
              <option>協力会社A</option>
              <option>協力会社B</option>
            </select>
          </label>
          <label>
            氏名
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} autoComplete="name" />
          </label>
          <button className="button" type="button" disabled={!draftCompany || !draftName.trim()} onClick={confirmManual}>
            次へ
          </button>
        </div>
      );
    }
    if (screen === "w03lock") {
      return (
        <div className="stack">
          <h1>本人の確認</h1>
          <p>入場時の確認内容です（変更不可）</p>
          <p>
            会社名　{identity?.company ?? "協力会社A"}
            <br />
            氏名　　{identity?.name ?? "佐藤 健"}
          </p>
          <button className="button" type="button" onClick={() => push("w04")}>
            次へ
          </button>
          <button className="text-link" type="button" onClick={rejectIdentity}>
            自分でない
          </button>
        </div>
      );
    }
    if (screen === "w04") {
      return (
        <div className="stack">
          <h1>メニュー　{identity?.name ?? ""}</h1>
          <div className="mock-menu">
            <button className="button" type="button" onClick={() => push("w05")}>
              出社時体調チェック
              {arrived && <small>送信済み</small>}
            </button>
            <button className="button ghost" type="button" onClick={() => push("w06")}>
              休憩時報告
            </button>
            <button className="button ghost" type="button" onClick={() => push("w07")}>
              セルフチェック
            </button>
            <button className="button ghost" type="button" onClick={() => push("w08")}>
              応急処置
            </button>
            <button className="button ghost" type="button" onClick={() => push("w09")}>
              緊急連絡
            </button>
            <button className="button ghost" type="button" onClick={() => push("w11")}>
              お知らせ
            </button>
          </div>
        </div>
      );
    }
    if (screen === "w05") {
      const block = arrivalError(answers);
      const arrivalFilled = ARRIVAL_REQUIRED.every((key) => answers[key]);
      return (
        <div className="stack">
          <h1>出社時体調チェック</h1>
          <p>
            {identity ? `サンプル現場A / ${identity.company} / ${identity.name}` : "サンプル現場A"}
          </p>
          <p className="disclaimer">診断はしません</p>
          <Vital label={textOf("Q-SYS")} unit="mmHg" value={answers.sys ?? ""} onChange={(value) => setAnswer("sys", value)} />
          <Vital label={textOf("Q-DIA")} unit="mmHg" value={answers.dia ?? ""} onChange={(value) => setAnswer("dia", value)} />
          <Vital label={textOf("Q-HR")} unit="bpm" value={answers.hr ?? ""} onChange={(value) => setAnswer("hr", value)} />
          <fieldset className="question">
            <legend>{textOf("Q-SLEEP")}</legend>
            <div className="mock-sleep">
              {[
                ["ge7", "7時間以上"],
                ["h6", "6時間"],
                ["h5", "5時間"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  className={answers.sleep === code ? "choice on" : "choice"}
                  onClick={() => setAnswer("sleep", code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          {QUESTION_SEED.filter((item) => item.form === "arrival" && item.kind === "VK-YN").map((item) => (
            <Yn key={item.code} legend={textOf(item.code)} value={answers[item.code]} onPick={(value) => setAnswer(item.code, value)} />
          ))}
          <button className="text-link" type="button" onClick={() => push("w07")}>
            セルフチェックへ →
          </button>
          {block && <p className="error">{block}</p>}
          <button className="button" type="button" disabled={!arrivalReady} onClick={submitArrival}>
            送信
          </button>
          {!arrivalFilled && <p className="muted">必須が埋まるまで送信できません</p>}
          <Rescue onAid={() => push("w08")} onCall={() => push("w09")} onMenu={() => setStack(["w04"])} heading />
        </div>
      );
    }
    if (screen === "w06") {
      return (
        <div className="stack">
          <h1>休憩時報告</h1>
          <p>
            {identity?.name ?? "氏名"} / サンプル現場A
          </p>
          {QUESTION_SEED.filter((item) => item.form === "break").map((item) => (
            <Yn key={item.code} legend={textOf(item.code)} value={answers[item.code]} onPick={(value) => setAnswer(item.code, value)} />
          ))}
          <button className="text-link" type="button" onClick={() => setHelpOpen((open) => !open)}>
            頭や首を冷やす（ヘルプ）
          </button>
          {helpOpen && (
            <ul className="help">
              <li>頭や首を冷やす</li>
              <li>爪の色の戻りを見る</li>
              <li>症状が繰り返すときは連絡する</li>
            </ul>
          )}
          <button className="button" type="button" disabled={!breakReady} onClick={submitBreak}>
            送信
          </button>
          <div className="mock-links">
            <button className="text-link" type="button" onClick={() => push("w08")}>
              応急処置
            </button>
            <span>|</span>
            <button className="text-link" type="button" onClick={() => push("w09")}>
              緊急連絡
            </button>
            <span>|</span>
            <button className="text-link" type="button" onClick={() => setStack(["w04"])}>
              メニュー
            </button>
          </div>
        </div>
      );
    }
    if (screen === "w07") {
      return (
        <div className="stack">
          <h1>予防のセルフチェック</h1>
          <p>見るだけ。回答としては保存しません</p>
          <ul className="self-list">
            {SELF.map(([mark, label]) => (
              <li key={label}>
                <span className="mock-mark">{mark}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <button className="button ghost" type="button" onClick={back}>
            戻る
          </button>
        </div>
      );
    }
    if (screen === "w08") {
      return (
        <div className="stack">
          <h1>発症時の流れ</h1>
          <ol className="mock-steps">
            {AID.map((step, index) => (
              <li key={step}>
                <b>{index + 1}</b>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <button className="button" type="button" onClick={() => push("w09")}>
            緊急連絡へ
          </button>
          <button className="button ghost" type="button" onClick={back}>
            戻る
          </button>
        </div>
      );
    }
    if (screen === "w09") {
      return (
        <div className="stack">
          <h1>緊急連絡</h1>
          <p>サンプル現場A</p>
          <p className="phone">{phone}</p>
          <a className="button" href={`tel:${phone}`}>
            この番号に電話する
          </a>
          <button className="button ghost" type="button" onClick={back}>
            戻る
          </button>
        </div>
      );
    }
    if (screen === "w10" || screen === "w10alert") {
      return (
        <div className="stack">
          <h1>受け付けました</h1>
          <p>受付時刻 {done.at}</p>
          <p>{done.form === "arrival" ? "出社時" : "休憩時"}</p>
          {done.level === "alert" && (
            <div className="banner alert">
              <p>職長または現場所長に連絡してください</p>
              <button className="text-link" type="button" onClick={() => push("w09")}>
                緊急連絡へ
              </button>
            </div>
          )}
          <button className="button" type="button" onClick={endSession}>
            終了（次の人へ）
          </button>
          <button className="button ghost" type="button" onClick={() => setStack(["w04"])}>
            続ける
          </button>
        </div>
      );
    }
    return (
      <div className="stack">
        <h1>お知らせ</h1>
        {notices.length === 0 && <p>今表示できるお知らせはありません</p>}
        {notices.map((notice) => (
          <article key={`${notice.title}-${notice.from}`} className="card">
            <h2>{notice.title}</h2>
            <p>{notice.body}</p>
            <p className="muted">
              {notice.site} / {notice.from} 〜 {notice.to}
            </p>
          </article>
        ))}
        <button className="button ghost" type="button" onClick={back}>
          戻る
        </button>
      </div>
    );
  }

  function loginCard() {
    return (
      <form
        className="sheet stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (!loginId.trim() || !loginPw) {
            setLoginError("ログインIDとパスワードを入力してください");
            return;
          }
          setLoginError("");
          jump("a02");
        }}
      >
        <h1>管理コンソール</h1>
        <label>
          ログインID
          <input value={loginId} onChange={(event) => setLoginId(event.target.value)} autoComplete="username" />
        </label>
        <label>
          パスワード
          <input
            type="password"
            value={loginPw}
            onChange={(event) => setLoginPw(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {loginError && <p className="error">{loginError}</p>}
        <button className="button" type="submit">
          ログイン
        </button>
      </form>
    );
  }

  function adminBody() {
    if (screen === "a02") {
      const visible = ROWS.filter((row) => (!judge || row.level === judge) && (!kind || row.form === kind));
      return (
        <section>
          <h1>当日の回答</h1>
          <div className="filters">
            <select aria-label="判定" value={judge} onChange={(event) => setJudge(event.target.value)}>
              <option value="">判定</option>
              <option value="alert">警告</option>
              <option value="caution">注意</option>
              <option value="normal">通常</option>
            </select>
            <select aria-label="種別" value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="">種別</option>
              <option value="arrival">出社</option>
              <option value="break">休憩</option>
            </select>
          </div>
          <div className="table-wrap">
            <table className="mock-table">
              <thead>
                <tr>
                  <th>時刻</th>
                  <th>種別</th>
                  <th>現場</th>
                  <th>会社</th>
                  <th>氏名</th>
                  <th>値</th>
                  <th>判定</th>
                  <th>対応</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className={`lv-${row.level}`}
                    onClick={() => {
                      setSelectedId(row.id);
                      const saved = actions[row.id];
                      setDraftStatus(saved?.status ?? "open");
                      setDraftNote(saved?.note ?? "");
                      setSavedFlash("");
                      push("a03");
                    }}
                  >
                    <td>{row.time}</td>
                    <td>{row.kind}</td>
                    <td>{row.site}</td>
                    <td>{row.company}</td>
                    <td>{row.name}</td>
                    <td>{row.value}</td>
                    <td>{LEVEL_WORD[row.level]}</td>
                    <td>{actions[row.id] ? actionWord(actions[row.id].status) : row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visible.length === 0 && <p>該当する回答はありません。</p>}
        </section>
      );
    }
    if (screen === "a03") {
      const row = ROWS.find((item) => item.id === selectedId) ?? ROWS[0];
      return (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setActions((current) => ({ ...current, [row.id]: { status: draftStatus, note: draftNote } }));
            setSavedFlash("記録しました");
          }}
        >
          <p>
            <button className="text-link" type="button" onClick={back}>
              一覧へ
            </button>
          </p>
          <h1>
            {row.name} / {row.kind}時
          </h1>
          <p>
            <span className={`badge ${row.level}`}>{LEVEL_WORD[row.level]}</span>
          </p>
          <h2>値一覧</h2>
          <ul>
            {row.values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
          <h2>判定の理由</h2>
          <ul>
            {row.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <label>
            対応
            <select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
              <option value="open">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="done">対応済</option>
            </select>
          </label>
          <label>
            メモ
            <textarea value={draftNote} onChange={(event) => setDraftNote(event.target.value)} />
          </label>
          <button className="button" type="submit">
            記録する
          </button>
          {savedFlash && <p>{savedFlash}</p>}
        </form>
      );
    }
    if (screen === "a04") {
      return (
        <section className="stack">
          <h1>アラートと未入力</h1>
          <h2>警告で未完了</h2>
          <ul>
            <li>佐藤 健 / サンプル現場A / 出社 8:12 / 未対応</li>
          </ul>
          <h2>出社チェックがない人</h2>
          <ul>
            <li>サンプル現場A / 協力会社A / 田中 実</li>
          </ul>
          <h2>休憩間隔の超過（推定）</h2>
          <p className="muted">推定です。休んだ事実そのものではありません。</p>
          <ul>
            <li>鈴木 葵 / 75分</li>
          </ul>
          <h2>通知の記録</h2>
          <ul>
            <li>8:12 佐藤 健 の出社判定を現場宛に残しました（メールサーバは未接続）</li>
          </ul>
        </section>
      );
    }
    if (screen === "a05") {
      return (
        <section className="stack">
          <h1>現場・QR</h1>
          <p>サンプル現場A</p>
          <p>
            電話 <strong>{phone}</strong>
          </p>
          <div className="mock-qr">
            <figure>
              <FakeQr seed={qrArrival} />
              <figcaption>出社QR #{qrArrival}</figcaption>
            </figure>
            <figure>
              <FakeQr seed={qrBreak + 3} />
              <figcaption>休憩QR #{qrBreak}</figcaption>
            </figure>
          </div>
          <div className="row-actions">
            <button className="button" type="button" onClick={() => setQrArrival((value) => value + 1)}>
              出社QRを再発行
            </button>
            <button className="button ghost" type="button" onClick={() => setQrBreak((value) => value + 1)}>
              休憩QRを再発行
            </button>
          </div>
          <p className="muted">再発行すると、古いQRはすぐに使えなくなります。</p>
        </section>
      );
    }
    if (screen === "a06") {
      return (
        <section className="stack">
          <h1>電話・閾値</h1>
          <label>
            緊急電話
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className="mock-switch">
            <input type="checkbox" checked={notifyCaution} onChange={(event) => setNotifyCaution(event.target.checked)} />
            黄の即時通知
          </label>
          <h2>閾値表（仮）</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>条件</th>
                  <th>レベル</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>最高血圧 160以上</td>
                  <td>警告</td>
                </tr>
                <tr>
                  <td>最高血圧 140〜159</td>
                  <td>注意</td>
                </tr>
                <tr>
                  <td>最低血圧 100以上</td>
                  <td>警告</td>
                </tr>
                <tr>
                  <td>最低血圧 90〜99</td>
                  <td>注意</td>
                </tr>
                <tr>
                  <td>脈拍 140以上</td>
                  <td>警告</td>
                </tr>
                <tr>
                  <td>脈拍 120〜139</td>
                  <td>注意</td>
                </tr>
                <tr>
                  <td>睡眠が5時間</td>
                  <td>注意</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      );
    }
    if (screen === "a07") {
      return (
        <section className="stack">
          <h1>設問</h1>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>コード</th>
                  <th>文言</th>
                  <th>極性</th>
                  <th>値の型</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((item) => (
                  <tr key={item.code}>
                    <td>{item.code}</td>
                    <td>
                      <input
                        aria-label={`${item.code}の文言`}
                        value={item.text}
                        onChange={(event) =>
                          setQuestions((current) =>
                            current.map((question) =>
                              question.code === item.code ? { ...question, text: event.target.value } : question,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      {item.polarity ? (
                        <select
                          aria-label={`${item.code}の極性`}
                          value={item.polarity}
                          onChange={(event) =>
                            setQuestions((current) =>
                              current.map((question) =>
                                question.code === item.code
                                  ? { ...question, polarity: event.target.value as Polarity }
                                  : question,
                              ),
                            )
                          }
                        >
                          <option value="positive">はいが良好</option>
                          <option value="negative">はいが異常</option>
                        </select>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="mock-lock">{item.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }
    if (screen === "a08") {
      return (
        <section className="stack">
          <h1>アカウント</h1>
          <h2>管理者</h2>
          <ul>
            <li>本部 / hq / 全現場</li>
            <li>所長 / site-a / サンプル現場A</li>
          </ul>
          <h2>作業者</h2>
          <ul>
            <li>佐藤 健 / 協力会社A</li>
            <li>鈴木 葵 / 協力会社A</li>
          </ul>
          <button className="button" type="button" onClick={() => setIssuedLink("/i/mock-sato")}>
            個人リンクを発行
          </button>
          {issuedLink && (
            <p>
              発行したリンク（モック） <span className="mock-lock">{issuedLink}</span>
            </p>
          )}
        </section>
      );
    }
    if (screen === "a09") {
      return (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (!noticeDraft.title.trim() || !noticeDraft.body.trim()) return;
            setNotices((current) => [noticeDraft, ...current]);
            setNoticeDraft({ ...noticeDraft, title: "", body: "" });
          }}
        >
          <h1>お知らせ</h1>
          <label>
            件名
            <input
              value={noticeDraft.title}
              onChange={(event) => setNoticeDraft({ ...noticeDraft, title: event.target.value })}
            />
          </label>
          <label>
            本文
            <textarea
              value={noticeDraft.body}
              onChange={(event) => setNoticeDraft({ ...noticeDraft, body: event.target.value })}
            />
          </label>
          <label>
            現場
            <select
              value={noticeDraft.site}
              onChange={(event) => setNoticeDraft({ ...noticeDraft, site: event.target.value })}
            >
              <option>サンプル現場A</option>
            </select>
          </label>
          <div className="filters">
            <label>
              開始
              <input
                type="date"
                value={noticeDraft.from}
                onChange={(event) => setNoticeDraft({ ...noticeDraft, from: event.target.value })}
              />
            </label>
            <label>
              終了
              <input
                type="date"
                value={noticeDraft.to}
                onChange={(event) => setNoticeDraft({ ...noticeDraft, to: event.target.value })}
              />
            </label>
          </div>
          <button className="button" type="submit" disabled={!noticeDraft.title.trim() || !noticeDraft.body.trim()}>
            掲載する
          </button>
          <ul>
            {notices.map((notice) => (
              <li key={`${notice.title}-${notice.from}`}>
                {notice.title} / {notice.site} / {notice.from}〜{notice.to}
              </li>
            ))}
          </ul>
        </form>
      );
    }
    const exported = ROWS.filter((row) => exportKind === "all" || row.form === exportKind);
    return (
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          const header = "時刻,種別,現場,会社,氏名,値,判定,対応";
          const lines = exported.map(
            (row) =>
              `${row.time},${row.kind},サンプル現場A,${row.companyName},${row.name},${row.value},${LEVEL_WORD[row.level]},${row.action}`,
          );
          const blob = new Blob([`\uFEFF${header}\n${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `heatstroke-${exportFrom}-${exportTo}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        <h1>抽出</h1>
        <div className="filters">
          <label>
            開始
            <input type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} />
          </label>
          <label>
            終了
            <input type="date" value={exportTo} onChange={(event) => setExportTo(event.target.value)} />
          </label>
          <label>
            現場
            <select defaultValue="サンプル現場A">
              <option>サンプル現場A</option>
            </select>
          </label>
          <label>
            種別
            <select value={exportKind} onChange={(event) => setExportKind(event.target.value)}>
              <option value="all">出社と休憩</option>
              <option value="arrival">出社</option>
              <option value="break">休憩</option>
            </select>
          </label>
        </div>
        <p className="muted">{exported.length}件を書き出します。見本データです。</p>
        <button className="button" type="submit">
          CSV
        </button>
      </form>
    );
  }
}

function actionWord(status: string) {
  if (status === "in_progress") return "対応中";
  if (status === "done") return "済";
  return "未";
}

function Yn({ legend, value, onPick }: { legend: string; value: string | undefined; onPick: (value: "yes" | "no") => void }) {
  return (
    <fieldset className="question">
      <legend>{legend}</legend>
      <div className="choices">
        <button type="button" className={value === "yes" ? "choice on" : "choice"} onClick={() => onPick("yes")}>
          はい
        </button>
        <button type="button" className={value === "no" ? "choice on" : "choice"} onClick={() => onPick("no")}>
          いいえ
        </button>
      </div>
    </fieldset>
  );
}

function Vital({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mock-vital">
      <span>{label}</span>
      <input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} />
      <span className="unit">{unit}</span>
    </label>
  );
}

function Rescue({
  onAid,
  onCall,
  onMenu,
  heading,
}: {
  onAid: () => void;
  onCall: () => void;
  onMenu: () => void;
  heading?: boolean;
}) {
  return (
    <div className="mock-rescue">
      {heading && <p>具合が悪いとき</p>}
      <div className="mock-links">
        <button className="text-link" type="button" onClick={onAid}>
          応急処置
        </button>
        <span>|</span>
        <button className="text-link" type="button" onClick={onCall}>
          緊急連絡
        </button>
        <span>|</span>
        <button className="text-link" type="button" onClick={onMenu}>
          メニュー
        </button>
      </div>
    </div>
  );
}

function FakeQr({ seed }: { seed: number }) {
  const cells = [];
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      const finder = (x < 6 && y < 6) || (x > 14 && y < 6) || (x < 6 && y > 14);
      const on = finder || (x * 3 + y * 5 + seed) % 4 === 0;
      if (on) cells.push(`${x}-${y}`);
    }
  }
  return (
    <svg viewBox="0 0 21 21" width="160" height="160" role="img" aria-label="QRの見本">
      <rect width="21" height="21" fill="white" />
      {cells.map((id) => {
        const [x, y] = id.split("-").map(Number);
        return <rect key={id} x={x} y={y} width="1" height="1" fill="#17352c" />;
      })}
    </svg>
  );
}
