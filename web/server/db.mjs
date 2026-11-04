import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { DEFAULT_RULES, LANGS, QUESTIONS } from "./catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const file = path.join(root, "app.sqlite");
const SCHEMA = "1";

fs.mkdirSync(root, { recursive: true });

export const db = new DatabaseSync(file);
db.exec("PRAGMA foreign_keys = ON");

const RANK = { normal: 0, caution: 1, alert: 2 };

export function businessDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(date);
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const verify = scryptSync(password, salt, 32);
  const hashBuf = Buffer.from(hash, "hex");
  if (hashBuf.length !== verify.length) return false;
  return timingSafeEqual(verify, hashBuf);
}

function nowIso() {
  return new Date().toISOString();
}

function endOfJstDayIso(date = new Date()) {
  const day = businessDate(date);
  return new Date(`${day}T14:59:59.000Z`).toISOString();
}

export function init() {
  const versionRow = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'")
    .get();
  let version = null;
  if (versionRow) {
    const row = db.prepare("SELECT value FROM settings WHERE key='schema'").get();
    version = row?.value ?? null;
  }
  if (version !== SCHEMA) {
    db.exec(`
      DROP TABLE IF EXISTS outbound_messages;
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS alert_actions;
      DROP TABLE IF EXISTS assessments;
      DROP TABLE IF EXISTS response_values;
      DROP TABLE IF EXISTS responses;
      DROP TABLE IF EXISTS notice_sites;
      DROP TABLE IF EXISTS notices;
      DROP TABLE IF EXISTS person_tokens;
      DROP TABLE IF EXISTS sessions;
      DROP TABLE IF EXISTS worker_sites;
      DROP TABLE IF EXISTS workers;
      DROP TABLE IF EXISTS admin_sites;
      DROP TABLE IF EXISTS admin_users;
      DROP TABLE IF EXISTS site_tokens;
      DROP TABLE IF EXISTS site_organizations;
      DROP TABLE IF EXISTS questions;
      DROP TABLE IF EXISTS organizations;
      DROP TABLE IF EXISTS sites;
      DROP TABLE IF EXISTS settings;
    `);
    createSchema();
    seed();
  }
}

function createSchema() {
  db.exec(`
    CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emergency_phone TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      break_gap_minutes INTEGER NOT NULL DEFAULT 60,
      allow_manual_identity INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE site_organizations (
      site_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      PRIMARY KEY (site_id, organization_id)
    );
    CREATE TABLE site_tokens (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      form_type TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      revoked_at TEXT
    );
    CREATE TABLE admin_users (
      id TEXT PRIMARY KEY,
      login_id TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      organization_id TEXT,
      disabled INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE admin_sites (
      admin_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      PRIMARY KEY (admin_id, site_id)
    );
    CREATE TABLE workers (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      external_face_id TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE worker_sites (
      worker_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      PRIMARY KEY (worker_id, site_id)
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE person_tokens (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE questions (
      code TEXT PRIMARY KEY,
      form_type TEXT NOT NULL,
      value_kind TEXT NOT NULL,
      unit TEXT,
      polarity TEXT,
      severity_if_bad TEXT,
      required INTEGER NOT NULL,
      sort INTEGER NOT NULL,
      active INTEGER NOT NULL,
      text_json TEXT NOT NULL,
      options_json TEXT,
      min_int INTEGER,
      max_int INTEGER
    );
    CREATE TABLE responses (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      organization_id TEXT,
      worker_id TEXT,
      form_type TEXT NOT NULL,
      respondent_name TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      source TEXT NOT NULL,
      business_date TEXT NOT NULL
    );
    CREATE TABLE response_values (
      response_id TEXT NOT NULL,
      question_code TEXT NOT NULL,
      value_int INTEGER,
      value_code TEXT,
      value_yn TEXT,
      PRIMARY KEY (response_id, question_code)
    );
    CREATE TABLE assessments (
      response_id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      reasons_json TEXT NOT NULL
    );
    CREATE TABLE alert_actions (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      actor_id TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE notices (
      id TEXT PRIMARY KEY,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      title_json TEXT NOT NULL,
      body_json TEXT NOT NULL
    );
    CREATE TABLE notice_sites (
      notice_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      PRIMARY KEY (notice_id, site_id)
    );
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      at TEXT NOT NULL,
      detail TEXT
    );
    CREATE TABLE outbound_messages (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      at TEXT NOT NULL
    );
  `);
}

function seed() {
  const orgA = randomUUID();
  const orgB = randomUUID();
  const siteA = randomUUID();
  const siteB = randomUUID();
  const hq = randomUUID();
  const manager = randomUUID();
  const foreman = randomUUID();
  const workerSato = randomUUID();
  const workerSuzuki = randomUUID();
  const workerSiteB = randomUUID();

  const insertOrg = db.prepare("INSERT INTO organizations (id, name) VALUES (?, ?)");
  insertOrg.run(orgA, "協力会社A");
  insertOrg.run(orgB, "協力会社B");

  const insertSite = db.prepare(
    `INSERT INTO sites (id, name, emergency_phone, active, break_gap_minutes, allow_manual_identity)
     VALUES (?, ?, ?, 1, 60, 1)`,
  );
  insertSite.run(siteA, "サンプル現場A", "000-0000-0000");
  insertSite.run(siteB, "サンプル現場B", "000-0000-0001");

  const link = db.prepare("INSERT INTO site_organizations (site_id, organization_id) VALUES (?, ?)");
  link.run(siteA, orgA);
  link.run(siteA, orgB);
  link.run(siteB, orgA);

  const token = db.prepare(
    "INSERT INTO site_tokens (id, site_id, form_type, token, revoked_at) VALUES (?, ?, ?, ?, NULL)",
  );
  token.run(randomUUID(), siteA, "arrival", "demo-arrival-a");
  token.run(randomUUID(), siteA, "break", "demo-break-a");
  token.run(randomUUID(), siteB, "arrival", "demo-arrival-b");
  token.run(randomUUID(), siteB, "break", "demo-break-b");

  const admin = db.prepare(
    `INSERT INTO admin_users (id, login_id, password_hash, role, organization_id, disabled)
     VALUES (?, ?, ?, ?, ?, 0)`,
  );
  admin.run(hq, "hq", hashPassword("hq-pass"), "hq", null);
  admin.run(manager, "manager", hashPassword("manager-pass"), "site_manager", null);
  admin.run(foreman, "foreman", hashPassword("foreman-pass"), "foreman", orgA);

  const adminSite = db.prepare("INSERT INTO admin_sites (admin_id, site_id) VALUES (?, ?)");
  adminSite.run(manager, siteA);
  adminSite.run(foreman, siteA);

  const worker = db.prepare(
    `INSERT INTO workers (id, organization_id, name, external_face_id, active)
     VALUES (?, ?, ?, ?, 1)`,
  );
  worker.run(workerSato, orgA, "佐藤 健", "face-sato", );
  worker.run(workerSuzuki, orgB, "鈴木 葵", "face-suzuki");
  worker.run(workerSiteB, orgA, "高橋 蓮", "face-takahashi");

  const ws = db.prepare("INSERT INTO worker_sites (worker_id, site_id) VALUES (?, ?)");
  ws.run(workerSato, siteA);
  ws.run(workerSuzuki, siteA);
  ws.run(workerSiteB, siteB);

  db.prepare(
    `INSERT INTO person_tokens (id, worker_id, site_id, token, expires_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), workerSato, siteA, "demo-person-sato", endOfJstDayIso());

  const q = db.prepare(
    `INSERT INTO questions (
      code, form_type, value_kind, unit, polarity, severity_if_bad, required, sort, active,
      text_json, options_json, min_int, max_int
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
  );
  for (const item of QUESTIONS) {
    q.run(
      item.code,
      item.formType,
      item.valueKind,
      item.unit ?? null,
      item.polarity ?? null,
      item.severityIfBad ?? null,
      item.required,
      item.sort,
      JSON.stringify(item.text),
      item.options ? JSON.stringify(item.options) : null,
      item.minInt ?? null,
      item.maxInt ?? null,
    );
  }

  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("schema", SCHEMA);
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("rules", JSON.stringify(DEFAULT_RULES));
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("notify_caution", "0");

  const noticeId = randomUUID();
  const today = businessDate();
  db.prepare(
    `INSERT INTO notices (id, starts_at, ends_at, title_json, body_json) VALUES (?, ?, ?, ?, ?)`,
  ).run(
    noticeId,
    `${today}T00:00:00.000Z`,
    `2099-01-01T00:00:00.000Z`,
    JSON.stringify({
      ja: "水分と休憩",
      en: "Water and rest",
      id: "Air dan istirahat",
      vi: "Nước và nghỉ",
      "zh-CN": "补水和休息",
    }),
    JSON.stringify({
      ja: "1時間ごとに休憩所で補給を記録してください。",
      en: "Record a drink and rest at the break area about once an hour.",
      id: "Catat minum dan istirahat di tempat istirahat kira-kira satu jam sekali.",
      vi: "Hãy ghi nhận uống nước và nghỉ tại chỗ nghỉ khoảng mỗi giờ.",
      "zh-CN": "请大约每小时在休息处记录一次补给。",
    }),
  );
  db.prepare("INSERT INTO notice_sites (notice_id, site_id) VALUES (?, ?)").run(noticeId, siteA);

  audit("seed", "seed", "database", "local demo data");
}

export function audit(actor, action, target, detail = null) {
  db.prepare(
    "INSERT INTO audit_logs (id, actor, action, target, at, detail) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(randomUUID(), actor, action, target, nowIso(), detail);
}

function questionRows() {
  return db.prepare("SELECT * FROM questions ORDER BY form_type, sort").all();
}

function presentQuestion(row, lang) {
  const text = JSON.parse(row.text_json);
  const options = row.options_json
    ? JSON.parse(row.options_json).map((option) => ({
        code: option.code,
        text: option.text[lang] || option.text.ja,
      }))
    : undefined;
  return {
    code: row.code,
    formType: row.form_type,
    valueKind: row.value_kind,
    unit: row.unit,
    required: Boolean(row.required),
    sort: row.sort,
    polarity: row.polarity,
    severityIfBad: row.severity_if_bad,
    text: text[lang] || text.ja,
    options,
    minInt: row.min_int,
    maxInt: row.max_int,
  };
}

function activeToken(token) {
  return db
    .prepare(
      `SELECT t.token, t.form_type, t.revoked_at, s.id AS site_id, s.name, s.emergency_phone,
              s.active, s.allow_manual_identity, s.break_gap_minutes
       FROM site_tokens t JOIN sites s ON s.id = t.site_id
       WHERE t.token = ?`,
    )
    .get(token);
}

export function getPublicSite(token, lang) {
  const site = activeToken(token);
  if (!site || site.revoked_at) return { error: "INVALID_TOKEN", status: 404 };
  if (!site.active) return { error: "SITE_INACTIVE", status: 403 };
  const language = LANGS.includes(lang) ? lang : "ja";
  const questions = questionRows()
    .filter((row) => row.active && row.form_type === site.form_type)
    .map((row) => presentQuestion(row, language));
  const organizations = db
    .prepare(
      `SELECT o.id, o.name FROM organizations o
       JOIN site_organizations so ON so.organization_id = o.id
       WHERE so.site_id = ? ORDER BY o.name`,
    )
    .all(site.site_id);
  return {
    siteId: site.site_id,
    siteName: site.name,
    formType: site.form_type,
    allowManualIdentity: Boolean(site.allow_manual_identity),
    emergencyPhone: site.emergency_phone,
    languages: LANGS,
    organizations,
    questions,
    notices: noticesFor(site.site_id, language),
  };
}

function noticesFor(siteId, lang) {
  const rows = db
    .prepare(
      `SELECT n.* FROM notices n
       JOIN notice_sites ns ON ns.notice_id = n.id
       WHERE ns.site_id = ? AND n.starts_at <= ? AND n.ends_at >= ?`,
    )
    .all(siteId, nowIso(), nowIso());
  return rows.flatMap((row) => {
    const title = JSON.parse(row.title_json)[lang];
    const body = JSON.parse(row.body_json)[lang];
    if (!title || !body) return [];
    return [{ id: row.id, title, body }];
  });
}

export function getPublicPerson(token) {
  const row = db
    .prepare(
      `SELECT p.token, p.expires_at, p.site_id, w.id AS worker_id, w.name, w.active,
              o.id AS organization_id, o.name AS organization_name, s.name AS site_name, s.active AS site_active,
              s.allow_manual_identity
       FROM person_tokens p
       JOIN workers w ON w.id = p.worker_id
       JOIN organizations o ON o.id = w.organization_id
       JOIN sites s ON s.id = p.site_id
       WHERE p.token = ?`,
    )
    .get(token);
  if (!row) return { error: "INVALID_TOKEN", status: 404 };
  if (row.expires_at < nowIso()) return { error: "TOKEN_EXPIRED", status: 403, allowManualIdentity: Boolean(row.allow_manual_identity), siteId: row.site_id };
  if (!row.active || !row.site_active) return { error: "SITE_INACTIVE", status: 403 };
  const tokens = db
    .prepare(
      `SELECT form_type, token FROM site_tokens WHERE site_id = ? AND revoked_at IS NULL`,
    )
    .all(row.site_id);
  return {
    workerId: row.worker_id,
    name: row.name,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    siteId: row.site_id,
    siteName: row.site_name,
    expiresAt: row.expires_at,
    allowManualIdentity: Boolean(row.allow_manual_identity),
    formTokens: Object.fromEntries(tokens.map((item) => [item.form_type, item.token])),
  };
}

function rules() {
  return JSON.parse(db.prepare("SELECT value FROM settings WHERE key='rules'").get().value);
}

function notifyCaution() {
  return db.prepare("SELECT value FROM settings WHERE key='notify_caution'").get().value === "1";
}

function filledSlots(entry) {
  return ["valueInt", "valueCode", "valueYn"].filter((key) => entry[key] !== undefined && entry[key] !== null);
}

export function submitResponse(body) {
  const site = activeToken(body.siteToken);
  if (!site || site.revoked_at) return { error: "INVALID_TOKEN", status: 404 };
  if (!site.active) return { error: "SITE_INACTIVE", status: 403 };
  if (body.formType !== site.form_type) return { error: "FORM_MISMATCH", status: 400 };

  let worker = null;
  if (body.personToken) {
    const person = getPublicPerson(body.personToken);
    if (person.error) return person;
    if (person.siteId !== site.site_id) return { error: "FORM_MISMATCH", status: 400 };
    worker = person;
  }

  const active = questionRows().filter((row) => row.active && row.form_type === body.formType);
  const byCode = new Map(active.map((row) => [row.code, row]));
  const incoming = Array.isArray(body.values) ? body.values : [];
  const errors = [];
  const normalized = [];

  for (const entry of incoming) {
    const question = byCode.get(entry.code);
    if (!question) {
      errors.push({ code: entry.code, error: "UNKNOWN_OR_WRONG_FORM" });
      continue;
    }
    const slots = filledSlots(entry);
    if (slots.length !== 1) {
      errors.push({ code: entry.code, error: "SLOT" });
      continue;
    }
    if (question.value_kind === "VK-INT" && slots[0] !== "valueInt") errors.push({ code: entry.code, error: "KIND" });
    if (question.value_kind === "VK-CODE" && slots[0] !== "valueCode") errors.push({ code: entry.code, error: "KIND" });
    if (question.value_kind === "VK-YN" && slots[0] !== "valueYn") errors.push({ code: entry.code, error: "KIND" });
    if (question.value_kind === "VK-INT") {
      const value = entry.valueInt;
      if (!Number.isInteger(value) || value < question.min_int || value > question.max_int) {
        errors.push({ code: entry.code, error: "RANGE" });
      }
    }
    if (question.value_kind === "VK-CODE") {
      const options = JSON.parse(question.options_json).map((option) => option.code);
      if (!options.includes(entry.valueCode)) errors.push({ code: entry.code, error: "RANGE" });
    }
    if (question.value_kind === "VK-YN" && entry.valueYn !== "yes" && entry.valueYn !== "no") {
      errors.push({ code: entry.code, error: "RANGE" });
    }
    normalized.push({ question, entry });
  }

  for (const question of active.filter((row) => row.required)) {
    if (!incoming.some((entry) => entry.code === question.code)) errors.push({ code: question.code, error: "REQUIRED" });
  }
  if (errors.length) return { error: "VALIDATION", status: 400, fields: errors };

  const sys = normalized.find((item) => item.question.code === "Q-SYS");
  const dia = normalized.find((item) => item.question.code === "Q-DIA");
  if (sys && dia && sys.entry.valueInt <= dia.entry.valueInt) {
    return { error: "BP_ORDER", status: 400, fields: [{ code: "Q-DIA", error: "ORDER" }] };
  }

  let organizationId = worker?.organizationId ?? null;
  let organizationName = worker?.organizationName ?? "";
  let respondentName = worker?.name ?? "";
  let workerId = worker?.workerId ?? null;
  let source = worker ? "person_token" : "manual";

  if (!worker) {
    if (!site.allow_manual_identity) return { error: "MANUAL_DISABLED", status: 403 };
    const org = db
      .prepare(
        `SELECT o.id, o.name FROM organizations o
         JOIN site_organizations so ON so.organization_id = o.id
         WHERE so.site_id = ? AND o.id = ?`,
      )
      .get(site.site_id, body.organizationId);
    const name = String(body.respondentName ?? "").trim();
    if (!org || !name) return { error: "VALIDATION", status: 400, fields: [{ code: "identity", error: "REQUIRED" }] };
    organizationId = org.id;
    organizationName = org.name;
    respondentName = name;
  }

  const date = businessDate();
  const submittedAt = nowIso();
  const valueSnapshot = normalized.map((item) => ({
    code: item.question.code,
    valueInt: item.entry.valueInt ?? null,
    valueCode: item.entry.valueCode ?? null,
    valueYn: item.entry.valueYn ?? null,
  }));

  if (body.formType === "break") {
    const recent = workerId
      ? db
          .prepare(
            `SELECT r.id, r.submitted_at FROM responses r
             WHERE r.site_id = ? AND r.worker_id = ? AND r.form_type = 'break'
             ORDER BY r.submitted_at DESC LIMIT 1`,
          )
          .get(site.site_id, workerId)
      : db
          .prepare(
            `SELECT r.id, r.submitted_at FROM responses r
             WHERE r.site_id = ? AND r.worker_id IS NULL AND r.form_type = 'break'
               AND r.organization_name = ? AND r.respondent_name = ?
             ORDER BY r.submitted_at DESC LIMIT 1`,
          )
          .get(site.site_id, organizationName, respondentName);
    if (recent && Date.now() - Date.parse(recent.submitted_at) < 60_000) {
      const same = sameValues(recent.id, valueSnapshot);
      if (same) return { id: recent.id, deduped: true, level: assessmentOf(recent.id).level };
    }
  }

  let existing = null;
  if (body.formType === "arrival") {
    existing = findArrival(site.site_id, date, workerId, organizationName, respondentName);
    if (existing && !body.overwrite) return { error: "ARRIVAL_EXISTS", status: 409, existingId: existing.id };
  }

  const assessment = assess(normalized);
  let responseId = existing?.id ?? randomUUID();

  db.exec("BEGIN");
  try {
    if (existing) {
      audit("worker", "response.overwrite", responseId, JSON.stringify(readValues(responseId)));
      db.prepare("DELETE FROM response_values WHERE response_id = ?").run(responseId);
      db.prepare("DELETE FROM assessments WHERE response_id = ?").run(responseId);
      db.prepare("DELETE FROM alert_actions WHERE response_id = ?").run(responseId);
      db.prepare(
        `UPDATE responses SET submitted_at = ?, source = ?, worker_id = ?, organization_id = ?,
         respondent_name = ?, organization_name = ? WHERE id = ?`,
      ).run(submittedAt, source, workerId, organizationId, respondentName, organizationName, responseId);
    } else {
      db.prepare(
        `INSERT INTO responses (
          id, site_id, organization_id, worker_id, form_type, respondent_name, organization_name,
          submitted_at, source, business_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        responseId,
        site.site_id,
        organizationId,
        workerId,
        body.formType,
        respondentName,
        organizationName,
        submittedAt,
        source,
        date,
      );
    }
    const insertValue = db.prepare(
      `INSERT INTO response_values (response_id, question_code, value_int, value_code, value_yn)
       VALUES (?, ?, ?, ?, ?)`,
    );
    for (const item of valueSnapshot) {
      insertValue.run(responseId, item.code, item.valueInt, item.valueCode, item.valueYn);
    }
    db.prepare("INSERT INTO assessments (response_id, level, reasons_json) VALUES (?, ?, ?)").run(
      responseId,
      assessment.level,
      JSON.stringify(assessment.reasons),
    );
    if (assessment.level === "alert" || (assessment.level === "caution" && notifyCaution())) {
      db.prepare(
        `INSERT INTO alert_actions (id, response_id, status, note, actor_id, updated_at)
         VALUES (?, ?, 'open', '', NULL, ?)`,
      ).run(randomUUID(), responseId, submittedAt);
      recordOutbound(responseId, assessment.level, site.name, organizationName, respondentName, body.formType);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    id: responseId,
    level: assessment.level,
    submittedAt,
    formType: body.formType,
    overwritten: Boolean(existing),
  };
}

function sameValues(responseId, snapshot) {
  const current = readValues(responseId);
  return JSON.stringify(sortSnap(current)) === JSON.stringify(sortSnap(snapshot));
}

function sortSnap(list) {
  return [...list].sort((a, b) => a.code.localeCompare(b.code));
}

function readValues(responseId) {
  return db
    .prepare(
      `SELECT question_code AS code, value_int AS valueInt, value_code AS valueCode, value_yn AS valueYn
       FROM response_values WHERE response_id = ?`,
    )
    .all(responseId);
}

function assessmentOf(responseId) {
  const row = db.prepare("SELECT level, reasons_json FROM assessments WHERE response_id = ?").get(responseId);
  return { level: row.level, reasons: JSON.parse(row.reasons_json) };
}

function findArrival(siteId, date, workerId, organizationName, respondentName) {
  if (workerId) {
    return db
      .prepare(
        `SELECT id FROM responses WHERE site_id = ? AND form_type = 'arrival' AND business_date = ? AND worker_id = ?`,
      )
      .get(siteId, date, workerId);
  }
  return db
    .prepare(
      `SELECT id FROM responses
       WHERE site_id = ? AND form_type = 'arrival' AND business_date = ? AND worker_id IS NULL
         AND organization_name = ? AND respondent_name = ?`,
    )
    .get(siteId, date, organizationName, respondentName);
}

function assess(normalized) {
  const reasons = [];
  let level = "normal";
  const raise = (next, reason) => {
    if (RANK[next] > RANK[level]) level = next;
    reasons.push({ ...reason, level: next });
  };
  const ruleList = rules();
  for (const item of normalized) {
    const { question, entry } = item;
    if (question.value_kind === "VK-YN") {
      const bad =
        (question.polarity === "positive" && entry.valueYn === "no") ||
        (question.polarity === "negative" && entry.valueYn === "yes");
      if (bad && question.severity_if_bad && question.severity_if_bad !== "none") {
        raise(question.severity_if_bad, { questionCode: question.code });
      }
    }
    for (const rule of ruleList) {
      if (rule.code !== question.code) continue;
      if (question.value_kind === "VK-INT") {
        const value = entry.valueInt;
        const aboveMin = value >= rule.min;
        const underMax = rule.max == null || value <= rule.max;
        if (aboveMin && underMax) raise(rule.level, { ruleId: rule.id });
      }
      if (question.value_kind === "VK-CODE" && rule.codes?.includes(entry.valueCode)) {
        raise(rule.level, { ruleId: rule.id });
      }
    }
  }
  return { level, reasons };
}

function recordOutbound(responseId, level, siteName, organizationName, respondentName, formType) {
  const body = [siteName, organizationName, respondentName, formType, level, responseId].join(" / ");
  db.prepare(
    `INSERT INTO outbound_messages (id, response_id, channel, body, status, at)
     VALUES (?, ?, 'email', ?, 'recorded_local', ?)`,
  ).run(randomUUID(), responseId, body, nowIso());
}

export function login(loginId, password) {
  const admin = db.prepare("SELECT * FROM admin_users WHERE login_id = ?").get(loginId);
  if (!admin || admin.disabled || !verifyPassword(password, admin.password_hash)) {
    audit(loginId || "unknown", "login.fail", "admin", null);
    return null;
  }
  const id = randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)").run(id, admin.id, expires);
  audit(admin.login_id, "login.ok", admin.id, null);
  return { token: id, admin: publicAdmin(admin) };
}

export function logout(token) {
  if (!token) return;
  db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
}

export function sessionAdmin(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT s.expires_at, u.* FROM sessions s
       JOIN admin_users u ON u.id = s.admin_id
       WHERE s.id = ?`,
    )
    .get(token);
  if (!row) return null;
  if (row.expires_at < nowIso() || row.disabled) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(token);
    return null;
  }
  const next = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare("UPDATE sessions SET expires_at = ? WHERE id = ?").run(next, token);
  return publicAdmin(row);
}

function publicAdmin(row) {
  const sites = db.prepare("SELECT site_id FROM admin_sites WHERE admin_id = ?").all(row.id).map((item) => item.site_id);
  return {
    id: row.id,
    loginId: row.login_id,
    role: row.role,
    organizationId: row.organization_id,
    siteIds: sites,
  };
}

function scope(admin) {
  const clauses = [];
  const params = [];
  if (admin.role === "site_manager" || admin.role === "foreman") {
    clauses.push("r.site_id IN (SELECT site_id FROM admin_sites WHERE admin_id = ?)");
    params.push(admin.id);
  }
  if (admin.role === "foreman") {
    clauses.push("r.organization_id = ?");
    params.push(admin.organizationId);
  }
  return { clauses, params };
}

export function listResponses(admin, filters) {
  const { clauses, params } = scope(admin);
  if (filters.date) {
    clauses.push("r.business_date = ?");
    params.push(filters.date);
  }
  if (filters.siteId) {
    clauses.push("r.site_id = ?");
    params.push(filters.siteId);
  }
  if (filters.organizationId) {
    clauses.push("r.organization_id = ?");
    params.push(filters.organizationId);
  }
  if (filters.level) {
    clauses.push("a.level = ?");
    params.push(filters.level);
  }
  if (filters.formType) {
    clauses.push("r.form_type = ?");
    params.push(filters.formType);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT r.*, s.name AS site_name, a.level, a.reasons_json,
              (SELECT status FROM alert_actions aa WHERE aa.response_id = r.id ORDER BY aa.updated_at DESC LIMIT 1) AS action_status
       FROM responses r
       JOIN sites s ON s.id = r.site_id
       JOIN assessments a ON a.response_id = r.id
       ${where}
       ORDER BY r.submitted_at DESC`,
    )
    .all(...params);
  return rows.map(summarizeResponse);
}

function summarizeResponse(row) {
  const values = readValues(row.id);
  return {
    id: row.id,
    siteId: row.site_id,
    siteName: row.site_name,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    workerId: row.worker_id,
    formType: row.form_type,
    respondentName: row.respondent_name,
    submittedAt: row.submitted_at,
    source: row.source,
    businessDate: row.business_date,
    level: row.level,
    reasons: JSON.parse(row.reasons_json),
    actionStatus: row.action_status,
    values,
  };
}

export function getResponse(admin, id) {
  const rows = listResponses(admin, {}).filter((row) => row.id === id);
  return rows[0] ?? null;
}

export function updateAction(admin, id, status, note) {
  const current = getResponse(admin, id);
  if (!current) return null;
  if (!["open", "in_progress", "done"].includes(status)) return { error: "VALIDATION", status: 400 };
  const existing = db.prepare("SELECT id FROM alert_actions WHERE response_id = ?").get(id);
  if (existing) {
    db.prepare("UPDATE alert_actions SET status = ?, note = ?, actor_id = ?, updated_at = ? WHERE response_id = ?").run(
      status,
      note ?? "",
      admin.id,
      nowIso(),
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO alert_actions (id, response_id, status, note, actor_id, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), id, status, note ?? "", admin.id, nowIso());
  }
  audit(admin.loginId, "response.action", id, status);
  return getResponse(admin, id);
}

export function listAlerts(admin) {
  const responses = listResponses(admin, { date: businessDate() }).filter(
    (row) => row.level === "alert" && row.actionStatus !== "done",
  );
  const sites = visibleSites(admin);
  const missing = [];
  const gaps = [];
  const date = businessDate();
  for (const site of sites) {
    const workers = db
      .prepare(
        `SELECT w.id, w.name, o.name AS organization_name, o.id AS organization_id
         FROM workers w
         JOIN worker_sites ws ON ws.worker_id = w.id
         JOIN organizations o ON o.id = w.organization_id
         WHERE ws.site_id = ? AND w.active = 1`,
      )
      .all(site.id);
    for (const worker of workers) {
      if (admin.role === "foreman" && worker.organization_id !== admin.organizationId) continue;
      const arrival = db
        .prepare(
          `SELECT id, submitted_at FROM responses
           WHERE site_id = ? AND worker_id = ? AND form_type = 'arrival' AND business_date = ?`,
        )
        .get(site.id, worker.id, date);
      if (!arrival) {
        missing.push({
          siteId: site.id,
          siteName: site.name,
          workerId: worker.id,
          name: worker.name,
          organizationName: worker.organization_name,
        });
        continue;
      }
      const last = db
        .prepare(
          `SELECT submitted_at FROM responses
           WHERE site_id = ? AND worker_id = ? AND business_date = ?
           ORDER BY submitted_at DESC LIMIT 1`,
        )
        .get(site.id, worker.id, date);
      const elapsed = Date.now() - Date.parse(last.submitted_at);
      if (elapsed > site.break_gap_minutes * 60 * 1000) {
        gaps.push({
          siteId: site.id,
          siteName: site.name,
          name: worker.name,
          organizationName: worker.organization_name,
          minutes: Math.floor(elapsed / 60000),
        });
      }
    }
  }
  const messages = db
    .prepare(
      `SELECT m.* FROM outbound_messages m
       JOIN responses r ON r.id = m.response_id
       ORDER BY m.at DESC LIMIT 30`,
    )
    .all()
    .filter((message) => getResponse(admin, message.response_id));
  return { alerts: responses, missing, gaps, messages };
}

function visibleSites(admin) {
  if (admin.role === "hq") return db.prepare("SELECT * FROM sites ORDER BY name").all();
  return db
    .prepare(
      `SELECT s.* FROM sites s JOIN admin_sites a ON a.site_id = s.id
       WHERE a.admin_id = ? ORDER BY s.name`,
    )
    .all(admin.id);
}

export function listSites(admin) {
  return visibleSites(admin).map((site) => ({
    ...site,
    emergencyPhone: site.emergency_phone,
    allowManualIdentity: Boolean(site.allow_manual_identity),
    breakGapMinutes: site.break_gap_minutes,
    tokens: db
      .prepare(
        `SELECT id, form_type, token FROM site_tokens WHERE site_id = ? AND revoked_at IS NULL`,
      )
      .all(site.id),
    organizations: db
      .prepare(
        `SELECT o.id, o.name FROM organizations o
         JOIN site_organizations so ON so.organization_id = o.id WHERE so.site_id = ?`,
      )
      .all(site.id),
  }));
}

export function updateSite(admin, id, patch) {
  const sites = visibleSites(admin);
  if (!sites.some((site) => site.id === id)) return null;
  if (admin.role === "foreman") return { error: "FORBIDDEN", status: 403 };
  if (patch.emergencyPhone !== undefined) {
    db.prepare("UPDATE sites SET emergency_phone = ? WHERE id = ?").run(String(patch.emergencyPhone), id);
  }
  if (patch.allowManualIdentity !== undefined && admin.role === "hq") {
    db.prepare("UPDATE sites SET allow_manual_identity = ? WHERE id = ?").run(patch.allowManualIdentity ? 1 : 0, id);
  }
  if (patch.active !== undefined && admin.role === "hq") {
    db.prepare("UPDATE sites SET active = ? WHERE id = ?").run(patch.active ? 1 : 0, id);
  }
  audit(admin.loginId, "site.update", id, JSON.stringify(patch));
  return listSites(admin).find((site) => site.id === id);
}

export function reissueToken(admin, siteId, formType) {
  if (!["arrival", "break"].includes(formType)) return { error: "VALIDATION", status: 400 };
  const sites = visibleSites(admin);
  if (!sites.some((site) => site.id === siteId)) return null;
  if (admin.role === "foreman") return { error: "FORBIDDEN", status: 403 };
  db.prepare(
    "UPDATE site_tokens SET revoked_at = ? WHERE site_id = ? AND form_type = ? AND revoked_at IS NULL",
  ).run(nowIso(), siteId, formType);
  const token = randomBytes(9).toString("hex");
  db.prepare(
    "INSERT INTO site_tokens (id, site_id, form_type, token, revoked_at) VALUES (?, ?, ?, ?, NULL)",
  ).run(randomUUID(), siteId, formType, token);
  audit(admin.loginId, "site.token", siteId, formType);
  return { token, path: `/s/${token}?form=${formType}` };
}

export function getSettings() {
  return { rules: rules(), notifyCaution: notifyCaution(), provisional: true };
}

export function updateSettings(admin, patch) {
  if (admin.role !== "hq") return { error: "FORBIDDEN", status: 403 };
  if (patch.rules) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'rules'").run(JSON.stringify(patch.rules));
  }
  if (patch.notifyCaution !== undefined) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'notify_caution'").run(patch.notifyCaution ? "1" : "0");
  }
  audit(admin.loginId, "settings.update", "rules", null);
  return getSettings();
}

export function listQuestions() {
  return questionRows().map((row) => ({
    ...presentQuestion(row, "ja"),
    textByLang: JSON.parse(row.text_json),
    active: Boolean(row.active),
    optionsFull: row.options_json ? JSON.parse(row.options_json) : null,
  }));
}

export function updateQuestion(admin, code, patch) {
  if (admin.role !== "hq") return { error: "FORBIDDEN", status: 403 };
  const row = db.prepare("SELECT * FROM questions WHERE code = ?").get(code);
  if (!row) return null;
  const text = patch.textByLang ?? JSON.parse(row.text_json);
  for (const lang of LANGS) {
    if (!String(text[lang] ?? "").trim()) return { error: "LANG_MISSING", status: 400 };
  }
  db.prepare(
    `UPDATE questions SET text_json = ?, polarity = ?, severity_if_bad = ?, required = ?, sort = ?, active = ?
     WHERE code = ?`,
  ).run(
    JSON.stringify(text),
    patch.polarity === undefined ? row.polarity : patch.polarity,
    patch.severityIfBad === undefined ? row.severity_if_bad : patch.severityIfBad,
    patch.required === undefined ? row.required : patch.required ? 1 : 0,
    patch.sort === undefined ? row.sort : patch.sort,
    patch.active === undefined ? row.active : patch.active ? 1 : 0,
    code,
  );
  audit(admin.loginId, "question.update", code, null);
  return listQuestions().find((item) => item.code === code);
}

export function listAccounts() {
  const admins = db.prepare("SELECT id, login_id, role, organization_id, disabled FROM admin_users").all();
  const workers = db.prepare("SELECT * FROM workers").all();
  const orgs = db.prepare("SELECT * FROM organizations ORDER BY name").all();
  const personTokens = db.prepare("SELECT worker_id, site_id, token, expires_at FROM person_tokens WHERE expires_at >= ?").all(nowIso());
  return {
    admins: admins.map((admin) => ({
      ...admin,
      loginId: admin.login_id,
      organizationId: admin.organization_id,
      disabled: Boolean(admin.disabled),
      siteIds: db.prepare("SELECT site_id FROM admin_sites WHERE admin_id = ?").all(admin.id).map((row) => row.site_id),
    })),
    workers: workers.map((worker) => ({
      ...worker,
      siteIds: db.prepare("SELECT site_id FROM worker_sites WHERE worker_id = ?").all(worker.id).map((row) => row.site_id),
    })),
    organizations: orgs,
    personTokens,
    sites: db.prepare("SELECT id, name FROM sites").all(),
  };
}

export function createAccount(admin, body) {
  if (admin.role !== "hq") return { error: "FORBIDDEN", status: 403 };
  if (!body.loginId || !body.password || !["hq", "site_manager", "foreman"].includes(body.role)) {
    return { error: "VALIDATION", status: 400 };
  }
  const id = randomUUID();
  try {
    db.prepare(
      `INSERT INTO admin_users (id, login_id, password_hash, role, organization_id, disabled)
       VALUES (?, ?, ?, ?, ?, 0)`,
    ).run(id, body.loginId, hashPassword(body.password), body.role, body.organizationId ?? null);
  } catch {
    return { error: "VALIDATION", status: 400 };
  }
  const insert = db.prepare("INSERT INTO admin_sites (admin_id, site_id) VALUES (?, ?)");
  for (const siteId of body.siteIds ?? []) insert.run(id, siteId);
  audit(admin.loginId, "account.create", id, body.role);
  return { id };
}

export function setAccountDisabled(admin, id, disabled) {
  if (admin.role !== "hq") return { error: "FORBIDDEN", status: 403 };
  db.prepare("UPDATE admin_users SET disabled = ? WHERE id = ?").run(disabled ? 1 : 0, id);
  audit(admin.loginId, "account.disable", id, String(disabled));
  return { id, disabled };
}

export function createWorker(admin, body) {
  if (admin.role !== "hq") return { error: "FORBIDDEN", status: 403 };
  const name = String(body.name ?? "").trim();
  if (!name || !body.organizationId) return { error: "VALIDATION", status: 400 };
  const id = randomUUID();
  db.prepare(
    `INSERT INTO workers (id, organization_id, name, external_face_id, active) VALUES (?, ?, ?, ?, 1)`,
  ).run(id, body.organizationId, name, body.externalFaceId || null);
  const insert = db.prepare("INSERT INTO worker_sites (worker_id, site_id) VALUES (?, ?)");
  for (const siteId of body.siteIds ?? []) insert.run(id, siteId);
  audit(admin.loginId, "worker.create", id, name);
  return { id };
}

export function issuePersonToken(admin, workerId, siteId) {
  if (admin.role === "foreman") return { error: "FORBIDDEN", status: 403 };
  const sites = visibleSites(admin);
  if (!sites.some((site) => site.id === siteId)) return null;
  const worker = db.prepare("SELECT * FROM workers WHERE id = ? AND active = 1").get(workerId);
  if (!worker) return null;
  const linked = db.prepare("SELECT 1 FROM worker_sites WHERE worker_id = ? AND site_id = ?").get(workerId, siteId);
  if (!linked) return { error: "VALIDATION", status: 400 };
  const token = randomBytes(9).toString("hex");
  db.prepare(
    "INSERT INTO person_tokens (id, worker_id, site_id, token, expires_at) VALUES (?, ?, ?, ?, ?)",
  ).run(randomUUID(), workerId, siteId, token, endOfJstDayIso());
  audit(admin.loginId, "person.token", workerId, siteId);
  return { token, path: `/i/${token}`, expiresAt: endOfJstDayIso() };
}

export function listNotices(admin) {
  const sites = new Set(visibleSites(admin).map((site) => site.id));
  return db
    .prepare("SELECT * FROM notices ORDER BY starts_at DESC")
    .all()
    .map((row) => ({
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      titleByLang: JSON.parse(row.title_json),
      bodyByLang: JSON.parse(row.body_json),
      siteIds: db.prepare("SELECT site_id FROM notice_sites WHERE notice_id = ?").all(row.id).map((item) => item.site_id),
    }))
    .filter((notice) => notice.siteIds.some((id) => sites.has(id)) || admin.role === "hq");
}

export function createNotice(admin, body) {
  if (admin.role === "foreman") return { error: "FORBIDDEN", status: 403 };
  const title = body.titleByLang ?? {};
  const text = body.bodyByLang ?? {};
  const siteIds = (body.siteIds ?? []).filter((id) => visibleSites(admin).some((site) => site.id === id));
  if (!siteIds.length || !title.ja || !text.ja) return { error: "VALIDATION", status: 400 };
  const id = randomUUID();
  db.prepare("INSERT INTO notices (id, starts_at, ends_at, title_json, body_json) VALUES (?, ?, ?, ?, ?)").run(
    id,
    body.startsAt ?? nowIso(),
    body.endsAt ?? "2099-01-01T00:00:00.000Z",
    JSON.stringify(title),
    JSON.stringify(text),
  );
  const insert = db.prepare("INSERT INTO notice_sites (notice_id, site_id) VALUES (?, ?)");
  for (const siteId of siteIds) insert.run(id, siteId);
  audit(admin.loginId, "notice.create", id, null);
  return { id };
}

export function exportCsv(admin, filters) {
  const rows = listResponses(admin, filters);
  audit(admin.loginId, "export", "responses", JSON.stringify(filters));
  const header = [
    "submittedAt",
    "businessDate",
    "formType",
    "siteName",
    "organizationName",
    "respondentName",
    "level",
    "actionStatus",
    "values",
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    const values = row.values
      .map((value) => `${value.code}=${value.valueInt ?? value.valueCode ?? value.valueYn ?? ""}`)
      .join("|");
    const cells = [
      row.submittedAt,
      row.businessDate,
      row.formType,
      row.siteName,
      row.organizationName,
      row.respondentName,
      row.level,
      row.actionStatus ?? "",
      values,
    ].map(csvCell);
    lines.push(cells.join(","));
  }
  return `\uFEFF${lines.join("\n")}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function demoLinks() {
  const tokens = db
    .prepare(
      `SELECT t.token, t.form_type, s.name FROM site_tokens t
       JOIN sites s ON s.id = t.site_id WHERE t.revoked_at IS NULL ORDER BY s.name, t.form_type`,
    )
    .all();
  const people = db
    .prepare(
      `SELECT p.token, w.name, s.name AS site_name FROM person_tokens p
       JOIN workers w ON w.id = p.worker_id JOIN sites s ON s.id = p.site_id
       WHERE p.expires_at >= ?`,
    )
    .all(nowIso());
  return {
    accounts: [
      { loginId: "hq", password: "hq-pass", role: "本部" },
      { loginId: "manager", password: "manager-pass", role: "現場所長（サンプル現場A）" },
      { loginId: "foreman", password: "foreman-pass", role: "職長（協力会社A・現場A）" },
    ],
    links: [
      ...tokens.map((token) => ({
        label: `${token.name} ${token.form_type === "arrival" ? "出社時" : "休憩時"}`,
        path: `/s/${token.token}?form=${token.form_type}`,
      })),
      ...people.map((person) => ({
        label: `個人QR ${person.name}（${person.site_name}）`,
        path: `/i/${person.token}`,
      })),
    ],
  };
}

export function counts() {
  return {
    responses: db.prepare("SELECT COUNT(*) AS n FROM responses").get().n,
  };
}
