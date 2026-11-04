import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { AdminApp } from "./admin/AdminApp";
import { MockupApp } from "./mockup/MockupApp";
import { WorkerApp } from "./worker/WorkerApp";

type Demo = {
  accounts: { loginId: string; password: string; role: string }[];
  links: { label: string; path: string }[];
};

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/s/:token" element={<WorkerApp mode="site" />} />
      <Route path="/i/:token" element={<WorkerApp mode="person" />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/mockup" element={<MockupApp />} />
    </Routes>
  );
}

function Home() {
  const [demo, setDemo] = useState<Demo | null>(null);
  useEffect(() => {
    fetch("/api/public/demo-links")
      .then((response) => (response.ok ? response.json() : null))
      .then(setDemo)
      .catch(() => setDemo(null));
  }, []);

  return (
    <main className="sheet home">
      <p className="kicker">Web</p>
      <h1>熱中症対策チェック</h1>
      <p className="lead">
        作業者は現場QRからブラウザを開きます。管理者は別のログインです。顔認証のリンクは氏名を埋めるだけで、体調の質問は次の画面です。
      </p>
      <div className="row-actions">
        <Link className="button" to="/admin/login">
          管理者ログイン
        </Link>
        <Link className="button ghost" to="/mockup">
          画面モック
        </Link>
      </div>
      {demo && (
        <>
          <h2>ローカル確認用</h2>
          <ul className="link-list">
            {demo.links.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <h2>ローカル初期アカウント</h2>
          <ul className="account-list">
            {demo.accounts.map((account) => (
              <li key={account.loginId}>
                <strong>{account.role}</strong>
                <span>
                  {account.loginId} / {account.password}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
