import { Router, Request, Response } from 'express';

const router = Router();

function pageShell(title: string, body: string, script = ''): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #0b1220; color: #e5e7eb; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 24px 16px 48px; }
    h1, h2, h3 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; }
    .btn, button { display: inline-block; background: #2563eb; color: white; text-decoration: none; border: 0; border-radius: 8px; padding: 8px 12px; margin: 4px 6px 4px 0; cursor: pointer; }
    .btn.alt, button.alt { background: #374151; }
    .status { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-left: 8px; }
    .ok { background: rgba(22, 163, 74, 0.2); color: #86efac; }
    .warn { background: rgba(234, 179, 8, 0.2); color: #fde047; }
    .bad { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; word-break: break-word; background: #0f172a; border-radius: 8px; border: 1px solid #1f2937; padding: 10px; }
    input, textarea, select { width: 100%; box-sizing: border-box; background: #0f172a; color: #e5e7eb; border: 1px solid #374151; border-radius: 8px; padding: 8px; margin-top: 4px; margin-bottom: 8px; }
    label { display: block; font-size: 13px; color: #cbd5e1; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 700px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="wrap">
    ${body}
  </main>
  ${script ? `<script>${script}</script>` : ''}
</body>
</html>`;
}

const rootBody = `
  <h1>LOCKED-IN</h1>
  <p>Live operations dashboard for the existing backend API.</p>

  <section class="grid">
    <article class="card"><h3>Revenue Engine <span id="revenue-status" class="status warn">checking</span></h3></article>
    <article class="card"><h3>Sweepstakes Engine <span id="sweep-status" class="status warn">checking</span></h3></article>
    <article class="card"><h3>API Health <span id="health-status" class="status warn">checking</span></h3></article>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Quick Links</h2>
    <a class="btn alt" href="/revenue/config">/revenue/config</a>
    <a class="btn alt" href="/config">/config</a>
    <a class="btn alt" href="/sweepstakes/campaigns">/sweepstakes/campaigns</a>
    <a class="btn alt" href="/revenue/vaults/me">/revenue/vaults/me</a>
    <a class="btn alt" href="/revenue/assets">/revenue/assets</a>
    <a class="btn" href="/sweepstakes">Sweepstakes Dashboard</a>
    <a class="btn" href="/dashboard/revenue">Revenue Dashboard</a>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Summary</h2>
    <ul>
      <li>system live</li>
      <li>backend deployed</li>
      <li>commerce and sweepstakes separated</li>
    </ul>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Test Flow</h2>
    <a class="btn" href="/sweepstakes#create">Create Sweepstakes Campaign</a>
    <a class="btn" href="/sweepstakes#entry">Add Free Entry</a>
    <a class="btn" href="/sweepstakes#draw">Draw Winner</a>
    <a class="btn" href="/sweepstakes#audit">View Audit Logs</a>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Endpoint status detail</h2>
    <div id="status-log" class="mono">Running checks...</div>
  </section>
`;

const rootScript = `
  const checks = [
    { id: 'health-status', name: 'API Health', url: '/health' },
    { id: 'revenue-status', name: 'Revenue Engine', url: '/revenue/config' },
    { id: 'sweep-status', name: 'Sweepstakes Engine', url: '/sweepstakes/campaigns' }
  ];
  const statusLog = document.getElementById('status-log');
  function applyBadge(el, kind, text) {
    el.className = 'status ' + kind;
    el.textContent = text;
  }
  async function probe(item) {
    const el = document.getElementById(item.id);
    try {
      const res = await fetch(item.url, { headers: { Accept: 'application/json' } });
      if (res.status === 401 || res.status === 403) {
        applyBadge(el, 'warn', 'auth required');
        return item.name + ': endpoint live but auth required (' + res.status + ')';
      }
      if (res.ok) {
        applyBadge(el, 'ok', 'reachable');
        return item.name + ': reachable (' + res.status + ')';
      }
      if (res.status === 404) {
        applyBadge(el, 'bad', 'unavailable');
        return item.name + ': unavailable (404)';
      }
      applyBadge(el, 'warn', 'partial');
      return item.name + ': responded (' + res.status + ')';
    } catch (_err) {
      applyBadge(el, 'bad', 'error');
      return item.name + ': network error';
    }
  }
  Promise.all(checks.map(probe)).then((lines) => {
    statusLog.textContent = lines.join('\\n');
  });
`;

const sweepstakesBody = `
  <h1>LOCKED-IN Sweepstakes Dashboard</h1>
  <p>Thin UI on top of existing endpoints. If endpoint auth is required, status is shown without crashing.</p>

  <section class="card">
    <h2>Auth (optional)</h2>
    <label>Bearer token<input id="token" placeholder="Paste JWT if required" /></label>
    <button id="save-token" class="alt" type="button">Use Token</button>
  </section>

  <section class="card" id="create" style="margin-top:12px;">
    <h2>Create Sweepstakes Campaign</h2>
    <form id="create-campaign">
      <label>title<input name="title" required /></label>
      <label>official rules<textarea name="officialRules" required></textarea></label>
      <label>eligibility<textarea name="eligibility" required></textarea></label>
      <div class="row">
        <label>start window<input type="datetime-local" name="startWindow" required /></label>
        <label>end window<input type="datetime-local" name="endWindow" required /></label>
      </div>
      <label>prize details<textarea name="prizeDetails" required></textarea></label>
      <label>AMOE/free entry description<textarea name="amoeDescription" required></textarea></label>
      <button type="submit">Create</button>
    </form>
  </section>

  <section class="card" id="entry" style="margin-top:12px;">
    <h2>Add Free Entry</h2>
    <form id="add-entry">
      <div class="row">
        <label>campaign id<input name="campaignId" required /></label>
        <label>participant/user id<input name="participantId" required /></label>
      </div>
      <label>source
        <select name="source">
          <option>direct_free_entry</option>
          <option>achievement_reward</option>
          <option>win_streak_reward</option>
          <option>contest_reward</option>
          <option>engagement_milestone</option>
        </select>
      </label>
      <button type="submit">Add Entry</button>
    </form>
  </section>

  <section class="card" id="draw" style="margin-top:12px;">
    <h2>Draw Winner</h2>
    <form id="draw-winner">
      <label>campaign id<input name="campaignId" required /></label>
      <button type="submit">Draw</button>
    </form>
  </section>

  <section class="card" id="audit" style="margin-top:12px;">
    <h2>View Audit Logs</h2>
    <button id="view-audit" type="button">Fetch Audit Logs</button>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Campaigns</h2>
    <button id="load-campaigns" type="button" class="alt">Load Campaigns</button>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Response</h2>
    <div id="response" class="mono">Ready.</div>
  </section>
`;

const sweepstakesScript = `
  let token = '';
  const output = document.getElementById('response');
  const setOutput = (label, payload) => {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    output.textContent = label + '\\n' + text;
  };
  const callApi = async (method, url, body) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = 'Bearer ' + token;
      const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      let data = null;
      try { data = await res.json(); } catch (_e) { data = { message: await res.text() }; }
      if (res.status === 401 || res.status === 403) return { state: 'auth-required', status: res.status, message: 'endpoint live but auth required', data };
      if (res.status === 404) return { state: 'unavailable', status: 404, message: 'endpoint unavailable' };
      return { state: res.ok ? 'ok' : 'error', status: res.status, data };
    } catch (err) {
      return { state: 'error', message: 'network error', error: String(err) };
    }
  };
  const collect = (form) => Object.fromEntries(new FormData(form).entries());

  document.getElementById('save-token').addEventListener('click', () => {
    token = String(document.getElementById('token').value || '').trim();
    setOutput('Auth token', token ? 'saved' : 'cleared');
  });

  document.getElementById('load-campaigns').addEventListener('click', async () => {
    const res = await callApi('GET', '/sweepstakes/campaigns/list');
    setOutput('Load campaigns', res);
  });

  document.getElementById('create-campaign').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = collect(e.currentTarget);
    const res = await callApi('POST', '/sweepstakes/campaigns', payload);
    setOutput('Create campaign', res);
  });

  document.getElementById('add-entry').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = collect(e.currentTarget);
    const res = await callApi('POST', '/sweepstakes/entries/free', payload);
    setOutput('Add free entry', res);
  });

  document.getElementById('draw-winner').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = collect(e.currentTarget);
    const res = await callApi('POST', '/sweepstakes/draw', payload);
    setOutput('Draw winner', res);
  });

  document.getElementById('view-audit').addEventListener('click', async () => {
    const res = await callApi('GET', '/sweepstakes/audit-logs');
    setOutput('Audit logs', res);
  });
`;

const revenueBody = `
  <h1>LOCKED-IN Revenue Dashboard</h1>
  <p>Thin visibility layer for creator vault and monetization endpoints.</p>

  <section class="card">
    <h2>Auth (optional)</h2>
    <label>Bearer token<input id="token" placeholder="Paste JWT if required" /></label>
    <button id="save-token" class="alt" type="button">Use Token</button>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Monetization Status</h2>
    <button id="load-status" type="button">Refresh Status</button>
    <a class="btn alt" href="/revenue/payouts">Payout Flow</a>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Creator Vault Balance</h2>
    <button id="load-vault" type="button">Load /revenue/vaults/me</button>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Registered Assets</h2>
    <button id="load-assets" type="button">Try list assets endpoint</button>
    <p>Fallback API link: <a href="/revenue/assets">/revenue/assets</a></p>
  </section>

  <section class="card" style="margin-top:12px;">
    <h2>Response</h2>
    <div id="response" class="mono">Ready.</div>
  </section>
`;

const revenueScript = `
  let token = '';
  const output = document.getElementById('response');
  const setOutput = (label, payload) => {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    output.textContent = label + '\\n' + text;
  };
  const callApi = async (method, url, body) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = 'Bearer ' + token;
      const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      let data = null;
      try { data = await res.json(); } catch (_e) { data = { message: await res.text() }; }
      if (res.status === 401 || res.status === 403) return { state: 'auth-required', status: res.status, message: 'endpoint live but auth required', data };
      if (res.status === 404) return { state: 'unavailable', status: 404, message: 'endpoint unavailable' };
      return { state: res.ok ? 'ok' : 'error', status: res.status, data };
    } catch (err) {
      return { state: 'error', message: 'network error', error: String(err) };
    }
  };

  document.getElementById('save-token').addEventListener('click', () => {
    token = String(document.getElementById('token').value || '').trim();
    setOutput('Auth token', token ? 'saved' : 'cleared');
  });

  document.getElementById('load-status').addEventListener('click', async () => {
    const [config, entitlements] = await Promise.all([
      callApi('GET', '/revenue/config'),
      callApi('GET', '/revenue/entitlements/me')
    ]);
    setOutput('Monetization status', { config, entitlements });
  });

  document.getElementById('load-vault').addEventListener('click', async () => {
    const res = await callApi('GET', '/revenue/vaults/me');
    setOutput('Vault balance', res);
  });

  document.getElementById('load-assets').addEventListener('click', async () => {
    const tryGet = await callApi('GET', '/revenue/assets');
    if (tryGet.state !== 'unavailable') {
      setOutput('Registered assets', tryGet);
      return;
    }
    const tryList = await callApi('GET', '/revenue/assets/list');
    setOutput('Registered assets', tryList);
  });
`;

router.get('/', (_req: Request, res: Response) => {
  res.type('html').send(pageShell('LOCKED-IN', rootBody, rootScript));
});

router.get('/sweepstakes', (_req: Request, res: Response) => {
  res.type('html').send(pageShell('LOCKED-IN Sweepstakes', sweepstakesBody, sweepstakesScript));
});

router.get('/sweepstakes/campaigns', (_req: Request, res: Response) => {
  res.type('html').send(pageShell('LOCKED-IN Sweepstakes', sweepstakesBody, sweepstakesScript));
});

router.get('/dashboard/revenue', (_req: Request, res: Response) => {
  res.type('html').send(pageShell('LOCKED-IN Revenue', revenueBody, revenueScript));
});

export default router;
