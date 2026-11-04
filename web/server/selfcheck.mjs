const base = process.env.API ?? "http://127.0.0.1:8787";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

const arrivalValues = [
  { code: "Q-SYS", valueInt: 170 },
  { code: "Q-DIA", valueInt: 95 },
  { code: "Q-HR", valueInt: 88 },
  { code: "Q-SLEEP", valueCode: "h5" },
  { code: "Q-JOB-01", valueYn: "yes" },
  { code: "Q-JOB-02", valueYn: "yes" },
  { code: "Q-JOB-03", valueYn: "yes" },
  { code: "Q-JOB-04", valueYn: "yes" },
  { code: "Q-HS-ARR", valueYn: "no" },
];

const site = await json("/api/public/sites/demo-arrival-a?lang=id");
assert(site.response.status === 200, "site");
assert(site.body.questions.some((question) => question.code === "Q-SYS" && question.text.includes("Tekanan")), "id text");
assert(site.body.questions.every((question) => question.valueKind !== "VK-YN" || question.code.startsWith("Q-")), "questions only");
assert(!("workerId" in site.body), "site payload has no face identity");

const person = await json("/api/public/person/demo-person-sato");
assert(person.response.status === 200, "person");
assert(person.body.name === "佐藤 健", "person name");
assert(!person.body.questions, "person endpoint has no questionnaire");
assert(person.body.formTokens.arrival, "person can open arrival");

const orgs = site.body.organizations;
const manualBreak = await json("/api/public/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    siteToken: "demo-break-a",
    formType: "break",
    organizationId: orgs[0].id,
    respondentName: "手動 太郎",
    values: [
      { code: "Q-WATER", valueYn: "no" },
      { code: "Q-SALT", valueYn: "yes" },
      { code: "Q-COND", valueYn: "yes" },
      { code: "Q-HS-BRK", valueYn: "no" },
    ],
  }),
});
assert(manualBreak.response.status === 201, `break ${manualBreak.response.status} ${JSON.stringify(manualBreak.body)}`);
assert(manualBreak.body.level === "caution", "water no is caution");

const badBreak = await json("/api/public/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    siteToken: "demo-break-a",
    formType: "break",
    organizationId: orgs[0].id,
    respondentName: "手動 太郎",
    values: [{ code: "Q-SYS", valueInt: 120 }, { code: "Q-WATER", valueYn: "yes" }],
  }),
});
assert(badBreak.response.status === 400, "break rejects blood pressure");

const arrival = await json("/api/public/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    siteToken: "demo-arrival-a",
    personToken: "demo-person-sato",
    formType: "arrival",
    values: arrivalValues,
  }),
});
assert(arrival.response.status === 201, `arrival ${JSON.stringify(arrival.body)}`);
assert(arrival.body.level === "alert", "systolic 170 is alert");

const again = await json("/api/public/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    siteToken: "demo-arrival-a",
    personToken: "demo-person-sato",
    formType: "arrival",
    values: arrivalValues,
  }),
});
assert(again.response.status === 409, "second arrival asks to overwrite");

const login = await json("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ loginId: "foreman", password: "foreman-pass" }),
});
assert(login.response.status === 200, "foreman login");
const cookie = login.response.headers.get("set-cookie").split(";")[0];
const list = await json("/api/admin/responses", { headers: { cookie } });
assert(list.body.responses.every((row) => row.organizationName === "協力会社A"), "foreman scope");
assert(list.body.responses.some((row) => row.respondentName === "佐藤 健"), "sees own company person token response");

const hq = await json("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ loginId: "hq", password: "hq-pass" }),
});
const hqCookie = hq.response.headers.get("set-cookie").split(";")[0];
const manager = await json("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ loginId: "manager", password: "manager-pass" }),
});
const managerCookie = manager.response.headers.get("set-cookie").split(";")[0];
const otherSite = await json("/api/public/responses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    siteToken: "demo-arrival-b",
    formType: "arrival",
    organizationId: (await json("/api/public/sites/demo-arrival-b")).body.organizations[0].id,
    respondentName: "現場B の人",
    values: arrivalValues.map((value) => (value.code === "Q-SYS" ? { code: "Q-SYS", valueInt: 120 } : value)),
  }),
});
assert(otherSite.response.status === 201, "site B arrival");
const managerList = await json("/api/admin/responses?date=", { headers: { cookie: managerCookie } });
assert(managerList.body.responses.every((row) => row.siteName === "サンプル現場A"), "manager stays on site A");
const hqList = await json("/api/admin/responses", { headers: { cookie: hqCookie } });
assert(hqList.body.responses.some((row) => row.siteName === "サンプル現場B"), "hq sees site B");

const detail = hqList.body.responses.find((row) => row.respondentName === "佐藤 健");
assert(detail.values.some((value) => value.code === "Q-SYS" && value.valueInt === 170), "int slot");
assert(detail.values.some((value) => value.code === "Q-SLEEP" && value.valueCode === "h5"), "code slot");
assert(detail.values.some((value) => value.code === "Q-HS-ARR" && value.valueYn === "no"), "yn slot");
assert(!detail.values.some((value) => value.valueInt != null && value.valueYn), "slots are separate fields");

console.log("selfcheck ok");
