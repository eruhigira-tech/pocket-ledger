(function (g) {
  'use strict';
  const L = g.Ledger = g.Ledger || {};

  L.esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

  // Returns a RegExp, or null for empty/invalid input (never throws)
  L.compile = (src, ci) => { try { return src ? new RegExp(src, ci ? 'gi' : 'g') : null; } catch { return null; } };

  L.hl = function (text, re) {
    if (!re) return L.esc(text);
    let out = '', last = 0;
    for (const m of text.matchAll(re)) {
      if (!m[0]) continue;
      out += L.esc(text.slice(last, m.index)) + '<mark>' + L.esc(m[0]) + '</mark>';
      last = m.index + m[0].length;
    }
    return out + L.esc(text.slice(last));
  };

  L.sorters = {
    'date-d': (a, b) => b.date.localeCompare(a.date), 'date-a': (a, b) => a.date.localeCompare(b.date),
    'desc-a': (a, b) => a.description.localeCompare(b.description), 'desc-z': (a, b) => b.description.localeCompare(a.description),
    'amt-d': (a, b) => b.amount - a.amount, 'amt-a': (a, b) => a.amount - b.amount
  };
})(window);
