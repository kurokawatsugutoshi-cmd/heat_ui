import express from "express";
import QRCode from "qrcode";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  audit,
  businessDate,
  createAccount,
  createNotice,
  createWorker,
  demoLinks,
  exportCsv,
  getPublicPerson,
  getPublicSite,
  getResponse,
  getSettings,
  init,
  issuePersonToken,
  listAccounts,
  listAlerts,
  listNotices,
  listQuestions,
  listResponses,
  listSites,
  login,
  logout,
  reissueToken,
  sessionAdmin,
  setAccountDisabled,
  submitResponse,
  updateAction,
  updateQuestion,
  updateSettings,
  updateSite,
} from "./db.mjs";

init();

const app = express();
app.use(express.json({ limit: "100kb" }));

const hits = new Map();

function cookie(req, name) {
  const raw = req.headers.cookie ?? "";
  const found = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function setSession(res, token) {
  const maxAge = token ? 60 * 60 * 24 : 0;
  const value = token ?? "";
  res.setHeader(
    "Set-Cookie",
    `hs_session=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
  );
}

function requireAdmin(req, res, next) {
  const admin = sessionAdmin(cookie(req, "hs_session"));
  if (!admin) return res.status(401).json({ error: "UNAUTHORIZED" });
  req.admin = admin;
  next();
}

function limited(key) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 40) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}

app.get("/api/public/demo-links", (_req, res) => {
  if (process.env.DEMO_LINKS === "0") return res.status(404).json({ error: "NOT_FOUND" });
  res.json(demoLinks());
});

app.get("/api/public/sites/:token", (req, res) => {
  const result = getPublicSite(req.params.token, String(req.query.lang ?? "ja"));
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.get("/api/public/person/:token", (req, res) => {
  const result = getPublicPerson(req.params.token);
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.post("/api/public/responses", (req, res) => {
  const key = `${req.ip}:${req.body?.siteToken ?? ""}`;
  if (!limited(key)) return res.status(429).json({ error: "RATE_LIMIT" });
  try {
    const result = submitResponse(req.body ?? {});
    if (result.error) return res.status(result.status).json(result);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERVER" });
  }
});

app.post("/api/admin/login", (req, res) => {
  const result = login(String(req.body?.loginId ?? ""), String(req.body?.password ?? ""));
  if (!result) return res.status(401).json({ error: "UNAUTHORIZED" });
  setSession(res, result.token);
  res.json({ admin: result.admin });
});

app.post("/api/admin/logout", (req, res) => {
  logout(cookie(req, "hs_session"));
  setSession(res, null);
  res.json({ ok: true });
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin, businessDate: businessDate() });
});

app.get("/api/admin/responses", requireAdmin, (req, res) => {
  res.json({
    businessDate: businessDate(),
    responses: listResponses(req.admin, {
      date: req.query.date ? String(req.query.date) : businessDate(),
      siteId: req.query.siteId ? String(req.query.siteId) : undefined,
      organizationId: req.query.organizationId ? String(req.query.organizationId) : undefined,
      level: req.query.level ? String(req.query.level) : undefined,
      formType: req.query.formType ? String(req.query.formType) : undefined,
    }),
  });
});

app.get("/api/admin/responses/:id", requireAdmin, (req, res) => {
  const row = getResponse(req.admin, req.params.id);
  if (!row) return res.status(404).json({ error: "NOT_FOUND" });
  audit(req.admin.loginId, "response.view", row.id, null);
  res.json(row);
});

app.patch("/api/admin/responses/:id/action", requireAdmin, (req, res) => {
  const result = updateAction(req.admin, req.params.id, req.body?.status, req.body?.note ?? "");
  if (!result) return res.status(404).json({ error: "NOT_FOUND" });
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.get("/api/admin/alerts", requireAdmin, (req, res) => {
  res.json(listAlerts(req.admin));
});

app.get("/api/admin/sites", requireAdmin, (req, res) => {
  res.json({ sites: listSites(req.admin) });
});

app.patch("/api/admin/sites/:id", requireAdmin, (req, res) => {
  const result = updateSite(req.admin, req.params.id, req.body ?? {});
  if (!result) return res.status(404).json({ error: "NOT_FOUND" });
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.post("/api/admin/sites/:id/tokens", requireAdmin, (req, res) => {
  const result = reissueToken(req.admin, req.params.id, req.body?.formType);
  if (!result) return res.status(404).json({ error: "NOT_FOUND" });
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.get("/api/admin/qr", requireAdmin, async (req, res) => {
  const target = String(req.query.path ?? "");
  if (!target.startsWith("/") && !target.startsWith("http://") && !target.startsWith("https://")) {
    return res.status(400).json({ error: "VALIDATION" });
  }
  const svg = await QRCode.toString(target, { type: "svg", margin: 1, width: 280 });
  res.type("image/svg+xml").send(svg);
});

app.get("/api/admin/settings", requireAdmin, (_req, res) => {
  res.json(getSettings());
});

app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const result = updateSettings(req.admin, req.body ?? {});
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.get("/api/admin/questions", requireAdmin, (_req, res) => {
  res.json({ questions: listQuestions() });
});

app.patch("/api/admin/questions/:code", requireAdmin, (req, res) => {
  const result = updateQuestion(req.admin, req.params.code, req.body ?? {});
  if (!result) return res.status(404).json({ error: "NOT_FOUND" });
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.get("/api/admin/accounts", requireAdmin, (req, res) => {
  if (req.admin.role !== "hq") return res.status(403).json({ error: "FORBIDDEN" });
  res.json(listAccounts());
});

app.post("/api/admin/accounts", requireAdmin, (req, res) => {
  const result = createAccount(req.admin, req.body ?? {});
  if (result.error) return res.status(result.status).json(result);
  res.status(201).json(result);
});

app.patch("/api/admin/accounts/:id", requireAdmin, (req, res) => {
  const result = setAccountDisabled(req.admin, req.params.id, Boolean(req.body?.disabled));
  if (result.error) return res.status(result.status).json(result);
  res.json(result);
});

app.post("/api/admin/workers", requireAdmin, (req, res) => {
  const result = createWorker(req.admin, req.body ?? {});
  if (result.error) return res.status(result.status).json(result);
  res.status(201).json(result);
});

app.post("/api/admin/person-tokens", requireAdmin, (req, res) => {
  const result = issuePersonToken(req.admin, req.body?.workerId, req.body?.siteId);
  if (!result) return res.status(404).json({ error: "NOT_FOUND" });
  if (result.error) return res.status(result.status).json(result);
  res.status(201).json(result);
});

app.get("/api/admin/notices", requireAdmin, (req, res) => {
  res.json({ notices: listNotices(req.admin) });
});

app.post("/api/admin/notices", requireAdmin, (req, res) => {
  const result = createNotice(req.admin, req.body ?? {});
  if (result.error) return res.status(result.status).json(result);
  res.status(201).json(result);
});

app.get("/api/admin/export.csv", requireAdmin, (req, res) => {
  const csv = exportCsv(req.admin, {
    date: req.query.date ? String(req.query.date) : undefined,
    siteId: req.query.siteId ? String(req.query.siteId) : undefined,
    formType: req.query.formType ? String(req.query.formType) : undefined,
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.send(csv);
});

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === "production") {
  const dist = path.join(here, "..", "dist");
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, "127.0.0.1", () => {
  console.log(`api http://127.0.0.1:${port}`);
});
