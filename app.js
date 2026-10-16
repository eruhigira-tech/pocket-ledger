(() => {
  'use strict';
  const { RX, checkFields, esc, compile, hl, sorters } = window.Ledger;
  const $ = id => document.getElementById(id);
  const now = () => new Date().toISOString();
  const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const say = msg => $('status').textContent = msg;
  const clean = s => s.replace(/\s{2,}/g, ' ');
  const recId = n => 'rec_' + String(n).padStart(4, '0');

  const sample = [['Lunch at cafeteria', 12.5, 'Food', 0], ['Chemistry textbook', 89.99, 'Books', 2], ['Bus pass', 45, 'Transport', 3],
    ['Coffee with friends', 8.75, 'Entertainment', 1], ['Library fine', 2.3, 'Fees', 5], ['Noodles and tea', 6.4, 'Food', 6],
    ['Printer ink', 18, 'Other', 4], ['Tuition top-up', 120, 'Fees', 12], ['Movie night', 15.5, 'Entertainment', 9], ['Notebook set', 7.2, 'Books', 0]];
  const fresh0 = () => ({
    settings: { base: 'USD', cap: '300', c2: 'RWF', r2: '1450', c3: 'EUR', r3: '0.92', cats: 'Food, Books, Transport, Entertainment, Fees, Other' },
    records: sample.map(([description, amount, category, d], i) =>
      ({ id: recId(i + 1), description, amount, category, date: daysAgo(d), createdAt: now(), updatedAt: now() }))
  });
  const KEY = 'ledger:v1';
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch { S = null; }
  if (!S || !Array.isArray(S.records) || !S.settings) S = fresh0();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { say('Could not save to this browser.'); } };
  let view = 'USD', editing = null, fresh = null;

  const ids = { description: 'desc', amount: 'amt', date: 'date', category: 'cat' };
  const showErrors = e => Object.entries(ids).forEach(([k, id]) => {
    $('e-' + id).textContent = e[k] || '';
    $(id).setAttribute('aria-invalid', !!e[k]);
  });
  const read = p => ({ description: clean($(p + 'desc').value), amount: $(p + 'amt').value, date: $(p + 'date').value, category: $(p + 'cat').value });

  const money = n => {
    const s = S.settings, rate = { [s.base]: 1, [s.c2]: +s.r2, [s.c3]: +s.r3 }[view] ?? 1;
    return (n * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + view;
  };

  const cells = r => [r.date, r.description, r.category, money(r.amount)];
  const labels = ['Date', 'Description', 'Category', 'Amount'];
  const btn = (cls, act, txt, r) => `<button${cls ? ` class="${cls}"` : ''} data-act="${act}" data-id="${r.id}"` +
    (act === 'edit' || act === 'del' ? ` aria-label="${txt} ${esc(r.description)}"` : '') + `>${txt}</button>`;
  const row = (r, re) => `<tr id="${r.id}"${r.id === fresh ? ' class="new"' : ''}>` +
    cells(r).map((c, i) => `<td data-l="${labels[i]}">${hl(c, re)}</td>`).join('') +
    `<td>${btn('alt', 'edit', 'Edit', r)} ${btn('del', 'del', 'Delete', r)}</td></tr>`;
  const editRow = r => '<tr>' + [['date', r.date, 'Date'], ['desc', esc(r.description), 'Description'],
    ['cat', esc(r.category), 'Category', ' list="catlist"'], ['amt', r.amount, 'Amount in base currency']]
    .map(([id, v, aria, x = ''], i) => `<td data-l="${labels[i]}"><input id="x-${id}"${x} value="${v}" aria-label="${aria}"></td>`).join('') +
    `<td>${btn('', 'save', 'Save', r)} ${btn('alt', 'cancel', 'Cancel', r)}<p class="err" id="x-err" role="alert"></p></td></tr>`;

  function render() {
    const src = $('q').value, re = compile(src, $('ci').checked);
    $('e-q').textContent = src && !re ? 'That is not a valid regex yet.' : '';
    $('q').setAttribute('aria-invalid', !!(src && !re));
    const list = S.records.filter(r => !re || cells(r).join(' ').search(re) > -1).sort(sorters[$('sort').value]);
    $('rows').innerHTML = list.map(r => r.id === editing ? editRow(r) : row(r, re)).join('');
    $('empty').textContent = list.length ? '' : S.records.length ? 'No records match this pattern.' : 'No expenses yet. Add one above.';
    fresh = null;
    stats();
  }

  const sum = list => list.reduce((a, r) => a + r.amount, 0);

  function stats() {
    const rs = S.records, byCat = {};
    rs.forEach(r => byCat[r.category] = (byCat[r.category] || 0) + r.amount);
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    $('sCount').textContent = rs.length;
    $('sSum').textContent = money(sum(rs));
    $('sTop').textContent = top ? top[0] : 'none yet';

    const month = daysAgo(0).slice(0, 7);
    const left = +S.settings.cap - sum(rs.filter(r => r.date.startsWith(month))), over = left < 0;
    const msg = over ? `Over the monthly cap by ${money(-left)}.` : `${money(left)} left under this month's cap.`;
    const cap = $('capMsg');
    cap.setAttribute('role', over ? 'alert' : 'status');
    cap.setAttribute('aria-live', over ? 'assertive' : 'polite');  
    cap.className = over ? 'bad' : 'ok';
    if (cap.textContent !== msg) cap.textContent = msg;  

    const days = [...Array(7)].map((_, i) => daysAgo(6 - i));
    const vals = days.map(d => sum(rs.filter(r => r.date === d))), max = Math.max(...vals, 1);
    $('bars').innerHTML = vals.map((v, i) => `<div style="height:${v / max * 100}%" title="${money(v)}"><span>` +
      new Date(days[i] + 'T00:00').toLocaleDateString('en', { weekday: 'short' }) + '</span></div>').join('');
    $('bars').setAttribute('aria-label', 'Spending, last 7 days: ' + vals.map((v, i) => days[i] + ' ' + money(v)).join(', '));
  }

  function fillView() {
    const s = S.settings, codes = [s.base, s.c2, s.c3];
    if (!codes.includes(view)) view = s.base;
    $('view').innerHTML = codes.map(c => `<option${c === view ? ' selected' : ''}>${c}</option>`).join('');
  }
  $('view').addEventListener('change', e => { view = e.target.value; render(); });


  $('form').addEventListener('input', () => {
    const f = read(''), e = checkFields(f);
    Object.keys(e).forEach(k => f[k] || delete e[k]);
    showErrors(e);
  });
  $('form').addEventListener('submit', e => {
    e.preventDefault();
    const f = read(''), errs = checkFields(f);
    showErrors(errs);
    if (Object.keys(errs).length) return say('Fix the highlighted fields and try again.');
    fresh = recId(Math.max(0, ...S.records.map(r => parseInt(r.id.replace(/\D/g, '')) || 0)) + 1);
    S.records.push({ id: fresh, ...f, amount: +f.amount, createdAt: now(), updatedAt: now() });
    save(); $('form').reset(); $('date').value = daysAgo(0); render();
    say(`Added "${f.description}".`);
  });
  $('rows').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const r = S.records.find(x => x.id === b.dataset.id), act = b.dataset.act;
    if (act === 'edit') { editing = r.id; render(); return $('x-desc').focus(); }
    if (act === 'cancel') editing = null;
    if (act === 'del') {
      if (!confirm(`Delete "${r.description}"?`)) return;
      S.records = S.records.filter(x => x !== r); save(); render(); return say('Deleted.');
    }
    if (act === 'save') {
      const f = read('x-'), err = Object.values(checkFields(f))[0];
      if (err) return $('x-err').textContent = err;
      Object.assign(r, f, { amount: +f.amount, updatedAt: now() });
      editing = null; save(); say('Saved changes.');
    }
    render();
    $(r.id)?.querySelector('button').focus();
  });
  ['q', 'ci', 'sort'].forEach(id => $(id).addEventListener('input', render));

  function applySettings() {
    const s = S.settings;
    Object.keys(s).forEach(k => $(k).value = s[k]);
    fillView();
    $('catlist').innerHTML = s.cats.split(',').map(c => `<option value="${esc(c.trim())}">`).join('');
    render();
  }
  $('setForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = {};
    Object.keys(S.settings).forEach(k => n[k] = $(k).value.trim());
    const rateOk = v => /^\d+(\.\d+)?$/.test(v) && +v > 0;
    const cats = n.cats.split(',').map(c => c.trim()).filter(Boolean);
    const msg = !['base', 'c2', 'c3'].every(k => RX.code.test(n[k])) || new Set([n.base, n.c2, n.c3]).size < 3
      ? 'Use three different currency codes in capitals, like USD.'
      : !rateOk(n.r2) || !rateOk(n.r3) ? 'Rates must be numbers above zero.'
      : !RX.amount.test(n.cap) ? 'The cap must be a number like 300 or 300.50.'
      : !cats.length || !cats.every(c => RX.cat.test(c)) ? 'Categories: letters, spaces and hyphens, separated by commas.' : '';
    $('e-set').textContent = msg;
    if (msg) return;
    S.settings = { ...n, cats: cats.join(', ') };
    save(); applySettings(); say('Settings saved.');
  });

  const okRecord = r => r && typeof r === 'object' && /^[\w-]+$/.test(r.id) && typeof r.amount === 'number' &&
    ['description', 'category', 'date'].every(k => typeof r[k] === 'string') &&
    !Object.keys(checkFields({ ...r, amount: String(r.amount) })).length &&
    !isNaN(Date.parse(r.createdAt)) && !isNaN(Date.parse(r.updatedAt));

  $('export').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S.records, null, 2)], { type: 'application/json' }));
    a.download = 'ledger-export.json'; a.click(); URL.revokeObjectURL(a.href);
    say(`Exported ${S.records.length} records.`);
  });

  $('import').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(t => {
      const data = JSON.parse(t), list = Array.isArray(data) ? data : data.records;
      if (!Array.isArray(list) || !list.every(okRecord) || new Set(list.map(r => r.id)).size !== list.length) throw new Error('shape');
      S.records = list.map(({ id, description, amount, category, date, createdAt, updatedAt }) =>
        ({ id, description, amount, category, date, createdAt, updatedAt }));
      save(); render(); say(`Imported ${list.length} records.`);
    }).catch(() => say('Import failed: invalid JSON or records in the wrong shape. Nothing was changed.'))
      .finally(() => { e.target.value = ''; });
  });

  $('date').value = daysAgo(0);
  applySettings();
})();
