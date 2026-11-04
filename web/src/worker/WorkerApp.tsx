import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPerson, getSite, submitResponse, type Question, type SitePayload, type SubmitResult } from "../api";
import { LANGS, t, type CopyKey, type Lang } from "../i18n";

type View = "loading" | "error" | "identity" | "menu" | "form" | "self" | "aid" | "call" | "notices" | "done" | "cleared";

type Identity = {
  organizationId: string;
  organizationName: string;
  name: string;
  workerId: string | null;
  locked: boolean;
};

const IDLE_MS = 30 * 60 * 1000;

export function WorkerApp({ mode }: { mode: "site" | "person" }) {
  const { token = "" } = useParams();
  const [lang, setLang] = useState<Lang>(() => readLang());
  const [view, setView] = useState<View>("loading");
  const [errorKey, setErrorKey] = useState<CopyKey>("invalid");
  const [site, setSite] = useState<SitePayload | null>(null);
  const [siteToken, setSiteToken] = useState(mode === "site" ? token : "");
  const [personToken, setPersonToken] = useState(mode === "person" ? token : "");
  const [formTokens, setFormTokens] = useState<{ arrival?: string; break?: string }>({});
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [overwrite, setOverwrite] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [arrived, setArrived] = useState(false);

  const copy = useMemo(() => (key: CopyKey) => t(lang, key), [lang]);

  useEffect(() => {
    localStorage.setItem("hs-lang", lang);
    document.documentElement.lang = lang === "zh-CN" ? "zh-CN" : lang;
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    const saved = readSession();
    async function load() {
      try {
        if (mode === "person") {
          const person = await getPerson(token);
          if (cancelled) return;
          setPersonToken(token);
          setFormTokens(person.formTokens);
          setIdentity({
            organizationId: person.organizationId,
            organizationName: person.organizationName,
            name: person.name,
            workerId: person.workerId,
            locked: true,
          });
          const entry = person.formTokens.arrival ?? person.formTokens.break;
          if (entry) {
            const payload = await getSite(entry, lang);
            if (cancelled) return;
            setSite(payload);
            setSiteToken(entry);
          }
          setView("identity");
          return;
        }
        const payload = await getSite(token, lang);
        if (cancelled) return;
        setSite(payload);
        setSiteToken(token);
        setFormTokens({ [payload.formType]: token });
        if (saved && saved.siteToken === token && Date.now() - saved.at < IDLE_MS) {
          setIdentity(saved.identity);
          setAnswers(saved.answers);
          setView(payload.formType === "arrival" || payload.formType === "break" ? "form" : "menu");
        } else {
          setView("identity");
        }
      } catch (error) {
        if (cancelled) return;
        const code = (error as { message?: string }).message;
        setErrorKey(code === "SITE_INACTIVE" ? "inactive" : code === "TOKEN_EXPIRED" ? "expired" : "invalid");
        setView("error");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // Language reload for an already open site token is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, token]);

  useEffect(() => {
    if (!siteToken || view === "loading" || view === "error") return;
    let cancelled = false;
    getSite(siteToken, lang)
      .then((payload) => {
        if (!cancelled) setSite(payload);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [lang, siteToken, view]);

  useEffect(() => {
    if (!identity || !site) return;
    const at = Date.now();
    sessionStorage.setItem(
      "hs-worker",
      JSON.stringify({ at, siteToken, identity, answers }),
    );
    const timer = window.setTimeout(() => {
      sessionStorage.removeItem("hs-worker");
      setIdentity(null);
      setAnswers({});
      setPersonToken("");
      setView("cleared");
    }, IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [answers, identity, site, siteToken]);

  async function openForm(_formType: "arrival" | "break", nextToken: string) {
    setBusy(true);
    setFormError("");
    try {
      const payload = await getSite(nextToken, lang);
      setSite(payload);
      setSiteToken(nextToken);
      setView("form");
    } catch {
      setErrorKey("invalid");
      setView("error");
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    sessionStorage.removeItem("hs-worker");
    setIdentity(null);
    setAnswers({});
    setResult(null);
    setOverwrite(false);
    setPersonToken("");
    setView("cleared");
  }

  async function send(force: boolean) {
    if (!site || !identity) return;
    const values = site.questions.map((question) => toValue(question, answers[question.code] ?? ""));
    if (values.some((value) => value === null)) {
      setFormError(copy("required"));
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const payload = await submitResponse({
        siteToken,
        personToken: personToken || null,
        formType: site.formType,
        organizationId: identity.organizationId,
        respondentName: identity.name,
        overwrite: force,
        values,
      });
      setResult(payload);
      if (site.formType === "arrival") setArrived(true);
      setOverwrite(false);
      setView("done");
    } catch (error) {
      const status = (error as { status?: number; message?: string }).status;
      const code = (error as { message?: string }).message;
      if (status === 409 || code === "ARRIVAL_EXISTS") {
        setOverwrite(true);
      } else if (code === "BP_ORDER") {
        setFormError(copy("bpOrder"));
      } else if (code === "VALIDATION") {
        setFormError(copy("range"));
      } else {
        setFormError(copy("offline"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="worker">
      <header className="worker-bar">
        <div>
          <p className="kicker">{copy("appName")}</p>
          <strong>{site?.siteName ?? ""}</strong>
          {identity?.name ? <span className="who">{identity.name}</span> : null}
        </div>
        <label className="lang">
          <span className="sr">language</span>
          <select value={lang} onChange={(event) => setLang(event.target.value as Lang)}>
            {LANGS.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="sheet">
        {view === "loading" && <p>{copy("sending")}</p>}
        {view === "error" && (
          <div>
            <h1>{copy(errorKey)}</h1>
            <button className="button" type="button" onClick={() => window.location.reload()}>
              {copy("retry")}
            </button>
          </div>
        )}
        {view === "identity" && site && (
          <IdentityView
            copy={copy}
            site={site}
            identity={identity}
            onChange={setIdentity}
            onNext={() => {
              if (mode === "site") {
                setView("form");
              } else {
                setView("menu");
              }
            }}
          />
        )}
        {view === "menu" && (
          <Menu
            copy={copy}
            arrived={arrived}
            busy={busy}
            onArrival={formTokens.arrival ? () => openForm("arrival", formTokens.arrival!) : undefined}
            onBreak={formTokens.break ? () => openForm("break", formTokens.break!) : undefined}
            onOpen={setView}
          />
        )}
        {view === "form" && site && (
          <FormView
            copy={copy}
            site={site}
            answers={answers}
            busy={busy}
            formError={formError}
            overwrite={overwrite}
            onChange={(code, value) => setAnswers((current) => ({ ...current, [code]: value }))}
            onOpen={setView}
            onSubmit={() => send(false)}
            onOverwrite={() => send(true)}
          />
        )}
        {view === "self" && <SelfView copy={copy} onBack={() => setView(site?.questions.length ? "form" : "menu")} />}
        {view === "aid" && (
          <AidView copy={copy} phone={site?.emergencyPhone ?? ""} onBack={() => setView("form")} onCall={() => setView("call")} />
        )}
        {view === "call" && <CallView copy={copy} phone={site?.emergencyPhone ?? ""} onBack={() => setView("form")} />}
        {view === "notices" && (
          <section>
            <h1>{copy("menuNotices")}</h1>
            {(site?.notices.length ?? 0) === 0 && <p>{copy("noticesEmpty")}</p>}
            {site?.notices.map((notice) => (
              <article key={notice.id} className="card">
                <h2>{notice.title}</h2>
                <p>{notice.body}</p>
              </article>
            ))}
            <button className="button ghost" type="button" onClick={() => setView("menu")}>
              {copy("back")}
            </button>
          </section>
        )}
        {view === "cleared" && (
          <section>
            <h1>{copy("endSession")}</h1>
            <p>{copy("cleared")}</p>
            {mode === "site" && (
              <button className="button" type="button" onClick={() => setView("identity")}>
                {copy("continue")}
              </button>
            )}
          </section>
        )}
        {view === "done" && result && (
          <section>
            <h1>{copy("doneTitle")}</h1>
            <p>
              {copy("receivedAt")}: {result.submittedAt ? new Date(result.submittedAt).toLocaleString("ja-JP") : ""}
            </p>
            <p>{site?.formType === "arrival" ? copy("formArrival") : copy("formBreak")}</p>
            {result.level === "alert" && (
              <div className="banner alert">
                <strong>警告</strong>
                <p>{copy("contactLead")}</p>
                <button className="button" type="button" onClick={() => setView("call")}>
                  {copy("menuCall")}
                </button>
              </div>
            )}
            <div className="stack">
              <button className="button" type="button" onClick={finish}>
                {copy("endSession")}
              </button>
              <button className="button ghost" type="button" onClick={() => setView("menu")}>
                {copy("continueSession")}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function IdentityView({
  copy,
  site,
  identity,
  onChange,
  onNext,
}: {
  copy: (key: CopyKey) => string;
  site: SitePayload;
  identity: Identity | null;
  onChange: (identity: Identity) => void;
  onNext: () => void;
}) {
  const current = identity ?? { organizationId: "", organizationName: "", name: "", workerId: null, locked: false };
  const ready = current.locked || (current.organizationId && current.name.trim());
  return (
    <section>
      <h1>{copy("identityTitle")}</h1>
      <p>{copy("identityLead")}</p>
      {current.locked ? (
        <div className="card">
          <p>{copy("identityLocked")}</p>
          <p>
            {copy("company")}: {current.organizationName}
          </p>
          <p>
            {copy("name")}: {current.name}
          </p>
        </div>
      ) : site.allowManualIdentity ? (
        <div className="stack">
          <label>
            {copy("company")}
            <select
              value={current.organizationId}
              onChange={(event) => {
                const organization = site.organizations.find((item) => item.id === event.target.value);
                onChange({
                  ...current,
                  organizationId: event.target.value,
                  organizationName: organization?.name ?? "",
                });
              }}
            >
              <option value="">{copy("pickCompany")}</option>
              {site.organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {copy("name")}
            <input
              value={current.name}
              onChange={(event) => onChange({ ...current, name: event.target.value })}
              autoComplete="name"
            />
          </label>
        </div>
      ) : (
        <p>{copy("manualOff")}</p>
      )}
      <button className="button" type="button" disabled={!ready} onClick={onNext}>
        {copy("continue")}
      </button>
    </section>
  );
}

function Menu({
  copy,
  arrived,
  busy,
  onArrival,
  onBreak,
  onOpen,
}: {
  copy: (key: CopyKey) => string;
  arrived: boolean;
  busy: boolean;
  onArrival?: () => void;
  onBreak?: () => void;
  onOpen: (view: View) => void;
}) {
  return (
    <section className="stack">
      <h1>{copy("menu")}</h1>
      <button className="button" type="button" disabled={busy || !onArrival} onClick={() => onArrival?.()}>
        {copy("formArrival")}
        {arrived ? <small>{copy("sentArrival")}</small> : null}
      </button>
      <button className="button" type="button" disabled={busy || !onBreak} onClick={() => onBreak?.()}>
        {copy("formBreak")}
      </button>
      <button className="button ghost" type="button" onClick={() => onOpen("self")}>
        {copy("menuSelf")}
      </button>
      <button className="button ghost" type="button" onClick={() => onOpen("aid")}>
        {copy("menuAid")}
      </button>
      <button className="button ghost" type="button" onClick={() => onOpen("call")}>
        {copy("menuCall")}
      </button>
      <button className="button ghost" type="button" onClick={() => onOpen("notices")}>
        {copy("menuNotices")}
      </button>
    </section>
  );
}

function FormView({
  copy,
  site,
  answers,
  busy,
  formError,
  overwrite,
  onChange,
  onOpen,
  onSubmit,
  onOverwrite,
}: {
  copy: (key: CopyKey) => string;
  site: SitePayload;
  answers: Record<string, string>;
  busy: boolean;
  formError: string;
  overwrite: boolean;
  onChange: (code: string, value: string) => void;
  onOpen: (view: View) => void;
  onSubmit: () => void;
  onOverwrite: () => void;
}) {
  const complete = site.questions.every((question) => (answers[question.code] ?? "") !== "");
  return (
    <section>
      <h1>{site.formType === "arrival" ? copy("formArrival") : copy("formBreak")}</h1>
      <p className="muted">
        {copy("company")}: { }
      </p>
      <p className="disclaimer">{copy("disclaimer")}</p>
      <p className="muted">{copy("provisionalCopy")}</p>
      {site.questions.map((question) => (
        <fieldset key={question.code} className="question">
          <legend>
            {question.text}
            {question.unit ? <span className="unit"> ({question.unit})</span> : null}
          </legend>
          {question.valueKind === "VK-INT" && (
            <input
              inputMode="numeric"
              value={answers[question.code] ?? ""}
              onChange={(event) => onChange(question.code, event.target.value.replace(/[^\d]/g, ""))}
            />
          )}
          {question.valueKind === "VK-CODE" && (
            <div className="choices">
              {question.options?.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={answers[question.code] === option.code ? "choice on" : "choice"}
                  onClick={() => onChange(question.code, option.code)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
          {question.valueKind === "VK-YN" && (
            <div className="choices">
              <button
                type="button"
                className={answers[question.code] === "yes" ? "choice on" : "choice"}
                onClick={() => onChange(question.code, "yes")}
              >
                {copy("yes")}
              </button>
              <button
                type="button"
                className={answers[question.code] === "no" ? "choice on" : "choice"}
                onClick={() => onChange(question.code, "no")}
              >
                {copy("no")}
              </button>
            </div>
          )}
        </fieldset>
      ))}
      {site.formType === "break" && (
        <ul className="help">
          <li>{copy("help1")}</li>
          <li>{copy("help2")}</li>
          <li>{copy("help3")}</li>
        </ul>
      )}
      {formError && <p className="error">{formError}</p>}
      {overwrite && (
        <div className="banner caution">
          <p>{copy("overwrite")}</p>
          <p>{copy("arrivalExistsNote")}</p>
          <button className="button" type="button" disabled={busy} onClick={onOverwrite}>
            {copy("overwriteYes")}
          </button>
        </div>
      )}
      <div className="submit-bar">
        <button className="button" type="button" disabled={!complete || busy} onClick={onSubmit}>
          {busy ? copy("sending") : copy("submit")}
        </button>
      </div>
      <p className="feel">{copy("feelBad")}</p>
      <div className="row-actions">
        <button className="text-link" type="button" onClick={() => onOpen("aid")}>
          {copy("menuAid")}
        </button>
        <button className="text-link" type="button" onClick={() => onOpen("call")}>
          {copy("menuCall")}
        </button>
        <button className="text-link" type="button" onClick={() => onOpen("self")}>
          {copy("menuSelf")}
        </button>
        <button className="text-link" type="button" onClick={() => onOpen("menu")}>
          {copy("menu")}
        </button>
      </div>
    </section>
  );
}

function SelfView({ copy, onBack }: { copy: (key: CopyKey) => string; onBack: () => void }) {
  const items: CopyKey[] = ["self1", "self2", "self3", "self4", "self5", "self6", "self7", "self8"];
  return (
    <section>
      <h1>{copy("selfTitle")}</h1>
      <p>{copy("selfLead")}</p>
      <ol className="self-list">
        {items.map((key, index) => (
          <li key={key}>
            <Icon index={index} />
            <span>{copy(key)}</span>
          </li>
        ))}
      </ol>
      <button className="button ghost" type="button" onClick={onBack}>
        {copy("back")}
      </button>
    </section>
  );
}

function AidView({
  copy,
  onBack,
  onCall,
}: {
  copy: (key: CopyKey) => string;
  phone: string;
  onBack: () => void;
  onCall: () => void;
}) {
  return (
    <section>
      <h1>{copy("aidTitle")}</h1>
      <p className="muted">{copy("aidNote")}</p>
      <ol className="steps">
        {(["aid1", "aid2", "aid3", "aid4"] as CopyKey[]).map((key) => (
          <li key={key}>{copy(key)}</li>
        ))}
      </ol>
      <button className="button" type="button" onClick={onCall}>
        {copy("menuCall")}
      </button>
      <button className="button ghost" type="button" onClick={onBack}>
        {copy("back")}
      </button>
    </section>
  );
}

function CallView({ copy, phone, onBack }: { copy: (key: CopyKey) => string; phone: string; onBack: () => void }) {
  const sample = phone.startsWith("000-");
  return (
    <section>
      <h1>{copy("callTitle")}</h1>
      {phone ? (
        <>
          <p className="phone">{phone}</p>
          {sample && <p className="muted">{copy("samplePhone")}</p>}
          <a className="button" href={`tel:${phone}`}>
            {copy("callButton")}
          </a>
        </>
      ) : (
        <p>{copy("phoneMissing")}</p>
      )}
      <button className="button ghost" type="button" onClick={onBack}>
        {copy("back")}
      </button>
    </section>
  );
}

function Icon({ index }: { index: number }) {
  const paths = [
    "M12 3c2 4 5 6 5 10a5 5 0 1 1-10 0c0-4 3-6 5-10z",
    "M12 4a6 6 0 1 0 0 12 4 4 0 0 1 0-8 6 6 0 0 0 0-4z",
    "M5 16c2-4 4-4 7-8 3 4 5 4 7 8",
    "M7 8h10l-1 10H8L7 8zm2-3h6v2H9V5z",
    "M8 14c0-4 2-8 4-10 2 2 4 6 4 10a4 4 0 1 1-8 0z",
    "M8 14h8M9 10h.01M15 10h.01M12 6v12",
    "M12 7v5l3 2M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
    "M8 14a6 6 0 1 0 8-5 4 4 0 0 1-8 5z",
  ];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[index]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function toValue(question: Question, raw: string) {
  if (!raw) return null;
  if (question.valueKind === "VK-INT") {
    if (!/^\d+$/.test(raw)) return null;
    return { code: question.code, valueInt: Number(raw) };
  }
  if (question.valueKind === "VK-CODE") return { code: question.code, valueCode: raw };
  if (raw !== "yes" && raw !== "no") return null;
  return { code: question.code, valueYn: raw };
}

function readLang(): Lang {
  const saved = localStorage.getItem("hs-lang");
  if (saved === "ja" || saved === "en" || saved === "id" || saved === "vi" || saved === "zh-CN") return saved;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("id")) return "id";
  if (browser.startsWith("vi")) return "vi";
  if (browser.startsWith("zh")) return "zh-CN";
  if (browser.startsWith("en")) return "en";
  return "ja";
}

function readSession(): { at: number; siteToken: string; identity: Identity; answers: Record<string, string> } | null {
  try {
    const raw = sessionStorage.getItem("hs-worker");
    if (!raw) return null;
    return JSON.parse(raw) as { at: number; siteToken: string; identity: Identity; answers: Record<string, string> };
  } catch {
    return null;
  }
}
