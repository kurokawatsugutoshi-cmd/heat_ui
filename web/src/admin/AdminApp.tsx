import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Navigate, Outlet, Route, Routes, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { adminFetch } from "../api";

type Admin = { id: string; loginId: string; role: "hq" | "site_manager" | "foreman"; organizationId: string | null; siteIds: string[] };
type Value = { code: string; valueInt: number | null; valueCode: string | null; valueYn: string | null };
type ResponseRow = {
  id: string;
  siteId: string;
  siteName: string;
  organizationName: string;
  formType: "arrival" | "break";
  respondentName: string;
  submittedAt: string;
  businessDate: string;
  level: "normal" | "caution" | "alert";
  reasons: { level: string; ruleId?: string; questionCode?: string }[];
  actionStatus: string | null;
  values: Value[];
  source: string;
};
type Site = {
  id: string;
  name: string;
  emergencyPhone: string;
  active: number;
  allowManualIdentity: boolean;
  breakGapMinutes: number;
  tokens: { id: string; form_type: string; token: string }[];
  organizations: { id: string; name: string }[];
};
type Rule = { id: string; code: string; min?: number; max?: number | null; codes?: string[]; level: string };

const LEVEL: Record<string, string> = { normal: "通常", caution: "注意", alert: "警告" };

export function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<Guard />}>
        <Route index element={<Dashboard />} />
        <Route path="responses/:id" element={<Detail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="sites" element={<Sites />} />
        <Route path="settings" element={<Settings />} />
        <Route path="questions" element={<Questions />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="notices" element={<Notices />} />
      </Route>
    </Routes>
  );
}

function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await adminFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      navigate("/admin");
    } catch {
      setError("アカウントまたはパスワードが違います");
    }
  }
  return (
    <main className="sheet narrow">
      <p className="kicker">管理コンソール</p>
      <h1>ログイン</h1>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          ログインID
          <input value={loginId} onChange={(event) => setLoginId(event.target.value)} autoComplete="username" />
        </label>
        <label>
          パスワード
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button" type="submit">
          ログイン
        </button>
      </form>
      <p className="muted">作業者の体調入力画面とは分かれています。</p>
    </main>
  );
}

function Guard() {
  const [admin, setAdmin] = useState<Admin | null | undefined>(undefined);
  useEffect(() => {
    adminFetch<{ admin: Admin }>("/api/admin/me")
      .then((body) => setAdmin(body.admin))
      .catch(() => setAdmin(null));
  }, []);
  if (admin === undefined) return <main className="sheet">確認しています</main>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return (
    <div className="admin">
      <aside>
        <p className="kicker">管理</p>
        <strong>{admin.loginId}</strong>
        <nav>
          <NavLink to="/admin" end>一覧</NavLink>
          <NavLink to="/admin/alerts">アラート</NavLink>
          <NavLink to="/admin/sites">現場・QR</NavLink>
          {admin.role === "hq" && <NavLink to="/admin/settings">閾値</NavLink>}
          {admin.role === "hq" && <NavLink to="/admin/questions">設問</NavLink>}
          {admin.role === "hq" && <NavLink to="/admin/accounts">アカウント</NavLink>}
          <NavLink to="/admin/notices">お知らせ</NavLink>
          <a href="/api/admin/export.csv">抽出</a>
        </nav>
        <button
          className="text-link"
          type="button"
          onClick={() => adminFetch("/api/admin/logout", { method: "POST" }).then(() => { window.location.href = "/admin/login"; })}
        >
          ログアウト
        </button>
      </aside>
      <main>
        <Outlet context={admin} />
      </main>
    </div>
  );
}

function Dashboard() {
  const [rows, setRows] = useState<ResponseRow[]>([]);
  const [level, setLevel] = useState("");
  const [formType, setFormType] = useState("");
  async function load() {
    const query = new URLSearchParams();
    if (level) query.set("level", level);
    if (formType) query.set("formType", formType);
    const body = await adminFetch<{ responses: ResponseRow[] }>(`/api/admin/responses?${query}`);
    setRows(body.responses);
  }
  useEffect(() => {
    void load().catch(() => undefined);
    const timer = window.setInterval(() => void load().catch(() => undefined), 15000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, formType]);
  return (
    <section>
      <h1>当日の回答</h1>
      <p className="muted">15秒ごとに更新します。色は保存時点の判定です。</p>
      <div className="filters">
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="">すべての判定</option>
          <option value="normal">通常</option>
          <option value="caution">注意</option>
          <option value="alert">警告</option>
        </select>
        <select value={formType} onChange={(event) => setFormType(event.target.value)}>
          <option value="">出社時と休憩時</option>
          <option value="arrival">出社時</option>
          <option value="break">休憩時</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
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
            {rows.map((row) => (
              <tr key={row.id} className={`lv-${row.level}`}>
                <td>{new Date(row.submittedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</td>
                <td>{row.formType === "arrival" ? "出社" : "休憩"}</td>
                <td>{row.siteName}</td>
                <td>{row.organizationName}</td>
                <td><Link to={`/admin/responses/${row.id}`}>{row.respondentName}</Link></td>
                <td>{row.values.map(formatValue).join("、")}</td>
                <td><span className={`badge ${row.level}`}>{LEVEL[row.level]}</span></td>
                <td>{row.actionStatus ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p>今日の回答はまだありません。</p>}
    </section>
  );
}

function Detail() {
  const { id = "" } = useParams();
  const [row, setRow] = useState<ResponseRow | null>(null);
  const [status, setStatus] = useState("open");
  const [note, setNote] = useState("");
  useEffect(() => {
    adminFetch<ResponseRow>(`/api/admin/responses/${id}`).then((body) => {
      setRow(body);
      setStatus(body.actionStatus ?? "open");
    }).catch(() => setRow(null));
  }, [id]);
  if (!row) return <p>記録が見つかりません。</p>;
  return (
    <section>
      <p><Link to="/admin">一覧へ</Link></p>
      <h1>{row.respondentName}</h1>
      <p>{row.siteName} / {row.organizationName} / {row.formType === "arrival" ? "出社時" : "休憩時"}</p>
      <p><span className={`badge ${row.level}`}>{LEVEL[row.level]}</span></p>
      <ul>
        {row.values.map((value) => (
          <li key={value.code}>{formatValue(value)}</li>
        ))}
      </ul>
      <h2>判定の理由</h2>
      <ul>
        {row.reasons.map((reason, index) => (
          <li key={index}>{reason.ruleId ?? reason.questionCode} / {LEVEL[reason.level] ?? reason.level}</li>
        ))}
        {row.reasons.length === 0 && <li>通常</li>}
      </ul>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          adminFetch(`/api/admin/responses/${id}/action`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, note }),
          }).then(() => setRow({ ...row, actionStatus: status }));
        }}
      >
        <label>
          対応
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="open">未対応</option>
            <option value="in_progress">対応中</option>
            <option value="done">対応済</option>
          </select>
        </label>
        <label>
          メモ
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button className="button" type="submit">記録する</button>
      </form>
    </section>
  );
}

function Alerts() {
  const [data, setData] = useState<{
    alerts: ResponseRow[];
    missing: { name: string; siteName: string; organizationName: string }[];
    gaps: { name: string; siteName: string; minutes: number }[];
    messages: { id: string; body: string; status: string; at: string }[];
  } | null>(null);
  useEffect(() => {
    adminFetch<NonNullable<typeof data>>("/api/admin/alerts").then(setData).catch(() => undefined);
  }, []);
  if (!data) return <p>読み込み中</p>;
  return (
    <section className="stack">
      <h1>アラートと未入力</h1>
      <p className="muted">未入力は作業者マスタにいる人だけです。休憩間隔は推定で、休んだ事実そのものではありません。</p>
      <h2>警告で未完了</h2>
      {data.alerts.length === 0 && <p>なし</p>}
      <ul>
        {data.alerts.map((row) => (
          <li key={row.id}><Link to={`/admin/responses/${row.id}`}>{row.respondentName}</Link> {row.siteName}</li>
        ))}
      </ul>
      <h2>出社時チェックがない人</h2>
      <ul>
        {data.missing.map((row) => (
          <li key={`${row.siteName}-${row.name}`}>{row.siteName} / {row.organizationName} / {row.name}</li>
        ))}
      </ul>
      <h2>休憩間隔の超過（推定）</h2>
      <ul>
        {data.gaps.map((row) => (
          <li key={`${row.siteName}-${row.name}`}>{row.name} / {row.minutes}分</li>
        ))}
      </ul>
      <h2>通知の記録</h2>
      <p className="muted">メールサーバは未接続です。赤判定の宛先文面だけを残し、一覧を一次情報にします。</p>
      <ul>
        {data.messages.map((message) => (
          <li key={message.id}>{message.status} / {message.body}</li>
        ))}
      </ul>
    </section>
  );
}

function Sites() {
  const { role } = useOutletContext<Admin>();
  const [sites, setSites] = useState<Site[]>([]);
  const [phones, setPhones] = useState<Record<string, string>>({});
  function load() {
    adminFetch<{ sites: Site[] }>("/api/admin/sites").then((body) => {
      setSites(body.sites);
      setPhones(Object.fromEntries(body.sites.map((site) => [site.id, site.emergencyPhone])));
    });
  }
  useEffect(() => { load(); }, []);
  return (
    <section className="stack">
      <h1>現場とQR</h1>
      {sites.map((site) => (
        <article key={site.id} className="card">
          <h2>{site.name}</h2>
          <label>
            緊急電話
            <input value={phones[site.id] ?? ""} onChange={(event) => setPhones({ ...phones, [site.id]: event.target.value })} />
          </label>
          <button
            className="button"
            type="button"
            onClick={() => adminFetch(`/api/admin/sites/${site.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ emergencyPhone: phones[site.id] ?? "" }),
            }).then(load)}
          >
            電話番号を保存
          </button>
          <div className="qr-grid">
            {site.tokens.map((token) => {
              const path = `${window.location.origin}/s/${token.token}?form=${token.form_type}`;
              return (
                <div key={token.id}>
                  <p>{token.form_type === "arrival" ? "出社時" : "休憩時"}</p>
                  <img alt="" src={`/api/admin/qr?path=${encodeURIComponent(path)}`} />
                  <p className="muted break">{path}</p>
                  {role !== "foreman" && (
                    <button
                      className="text-link"
                      type="button"
                      onClick={() => adminFetch(`/api/admin/sites/${site.id}/tokens`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ formType: token.form_type }),
                      }).then(load)}
                    >
                      再発行
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
}

function Settings() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [notify, setNotify] = useState(false);
  useEffect(() => {
    adminFetch<{ rules: Rule[]; notifyCaution: boolean }>("/api/admin/settings").then((body) => {
      setRules(body.rules);
      setNotify(body.notifyCaution);
    }).catch(() => undefined);
  }, []);
  return (
    <section className="stack">
      <h1>閾値</h1>
      <p className="banner caution">数値は仮です（Q.09.01）。本番の運用値ではありません。</p>
      {rules.map((rule, index) => (
        <div key={rule.id} className="card rowish">
          <strong>{rule.id}</strong>
          <span>{rule.code}</span>
          {rule.codes ? (
            <span>{rule.codes.join(",")}</span>
          ) : (
            <>
              <input
                inputMode="numeric"
                value={rule.min ?? ""}
                onChange={(event) => {
                  const next = [...rules];
                  next[index] = { ...rule, min: Number(event.target.value) };
                  setRules(next);
                }}
              />
              <input
                inputMode="numeric"
                value={rule.max ?? ""}
                onChange={(event) => {
                  const next = [...rules];
                  next[index] = { ...rule, max: event.target.value === "" ? null : Number(event.target.value) };
                  setRules(next);
                }}
              />
            </>
          )}
          <span>{LEVEL[rule.level] ?? rule.level}</span>
        </div>
      ))}
      <label className="check">
        <input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
        注意（黄）も即時の通知記録を作る（Q.13.01）
      </label>
      <button
        className="button"
        type="button"
        onClick={() => adminFetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rules, notifyCaution: notify }),
        })}
      >
        保存
      </button>
    </section>
  );
}

function Questions() {
  const [questions, setQuestions] = useState<Array<{
    code: string;
    formType: string;
    valueKind: string;
    polarity: string | null;
    severityIfBad: string | null;
    active: boolean;
    textByLang: Record<string, string>;
  }>>([]);
  useEffect(() => {
    adminFetch<{ questions: typeof questions }>("/api/admin/questions").then((body) => setQuestions(body.questions)).catch(() => undefined);
  }, []);
  return (
    <section className="stack">
      <h1>設問</h1>
      <p className="muted">文言と極性です。値の型（整数・区分・はい／いいえ）はここでは変えません。</p>
      {questions.map((question, index) => (
        <article key={question.code} className="card">
          <h2>{question.code}</h2>
          <p>{question.formType} / {question.valueKind}</p>
          <label>
            日本語
            <input
              value={question.textByLang.ja}
              onChange={(event) => {
                const next = [...questions];
                next[index] = { ...question, textByLang: { ...question.textByLang, ja: event.target.value } };
                setQuestions(next);
              }}
            />
          </label>
          {question.valueKind === "VK-YN" && (
            <div className="filters">
              <select
                value={question.polarity ?? "positive"}
                onChange={(event) => {
                  const next = [...questions];
                  next[index] = { ...question, polarity: event.target.value };
                  setQuestions(next);
                }}
              >
                <option value="positive">はい＝良好</option>
                <option value="negative">はい＝異常</option>
              </select>
              <select
                value={question.severityIfBad ?? "caution"}
                onChange={(event) => {
                  const next = [...questions];
                  next[index] = { ...question, severityIfBad: event.target.value };
                  setQuestions(next);
                }}
              >
                <option value="caution">悪い側は注意</option>
                <option value="alert">悪い側は警告</option>
              </select>
            </div>
          )}
          <button
            className="button"
            type="button"
            onClick={() => adminFetch(`/api/admin/questions/${question.code}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                textByLang: question.textByLang,
                polarity: question.polarity,
                severityIfBad: question.severityIfBad,
                active: question.active,
              }),
            })}
          >
            この設問を保存
          </button>
        </article>
      ))}
    </section>
  );
}

function Accounts() {
  const [data, setData] = useState<{
    admins: { id: string; loginId: string; role: string; disabled: boolean }[];
    workers: { id: string; name: string; organization_id: string; external_face_id: string | null; siteIds: string[] }[];
    organizations: { id: string; name: string }[];
    sites: { id: string; name: string }[];
    personTokens: { worker_id: string; token: string; expires_at: string }[];
  } | null>(null);
  const [issued, setIssued] = useState("");
  function load() {
    adminFetch<NonNullable<typeof data>>("/api/admin/accounts").then(setData).catch(() => undefined);
  }
  useEffect(() => { load(); }, []);
  if (!data) return <p>読み込み中</p>;
  return (
    <section className="stack">
      <h1>アカウントと作業者</h1>
      <h2>管理者</h2>
      <ul>
        {data.admins.map((admin) => (
          <li key={admin.id}>{admin.loginId} / {admin.role} {admin.disabled ? "無効" : ""}</li>
        ))}
      </ul>
      <h2>作業者マスタ</h2>
      <p className="muted">個人QRは氏名と会社を埋めるための入口です。体調の数値は含みません。</p>
      <ul>
        {data.workers.map((worker) => {
          const site = data.sites.find((item) => item.id === worker.siteIds[0]);
          return (
            <li key={worker.id}>
              {worker.name}
              {site && (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => adminFetch<{ path: string }>("/api/admin/person-tokens", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ workerId: worker.id, siteId: site.id }),
                  }).then((body) => setIssued(body.path)).catch(() => setIssued("発行できませんでした"))}
                >
                  「{site.name}」の個人リンク
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {issued && <p className="card">{window.location.origin}{issued}</p>}
    </section>
  );
}

function Notices() {
  const [sites, setSites] = useState<Site[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [siteId, setSiteId] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    adminFetch<{ sites: Site[] }>("/api/admin/sites").then((result) => {
      setSites(result.sites);
      setSiteId(result.sites[0]?.id ?? "");
    });
  }, []);
  return (
    <section className="stack">
      <h1>お知らせ</h1>
      <p className="muted">訳が無い言語には出しません。ここでは日本語の文面を登録します。</p>
      <label>
        件名
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        本文
        <textarea value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      <label>
        現場
        <select value={siteId} onChange={(event) => setSiteId(event.target.value)}>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
      </label>
      <button
        className="button"
        type="button"
        onClick={() => adminFetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteIds: [siteId],
            titleByLang: { ja: title },
            bodyByLang: { ja: body },
          }),
        }).then(() => setDone(true))}
      >
        配信
      </button>
      {done && <p>登録しました。日本語の作業者画面に表示されます。</p>}
    </section>
  );
}

function formatValue(value: Value) {
  const shown = value.valueInt ?? value.valueCode ?? value.valueYn ?? "";
  return `${value.code}: ${shown}`;
}
