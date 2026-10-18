(function (g) {
  'use strict';
  const L = g.Ledger = g.Ledger || {};

  L.RX = {
    desc: /^\S(?:.*\S)?$/,                                   
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,                    
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,   
    cat: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,                    
    dup: /\b(\w+)\s+\1\b/i,                                  
    code: /^[A-Z]{3}$/                                       
  };


  L.isRealDate = function (s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return false;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
  };


  L.checkFields = function (f) {
    const RX = L.RX, e = {};
    if (!RX.desc.test(f.description)) e.description = 'Cannot be empty or start or end with a space.';
    else if (RX.dup.test(f.description)) e.description = 'Repeated word: "' + f.description.match(RX.dup)[0] + '".';
    if (!RX.amount.test(f.amount)) e.amount = 'Use a number like 12 or 12.50.';
    if (!RX.date.test(f.date)) e.date = 'Use the format YYYY-MM-DD.';
    else if (!L.isRealDate(f.date)) e.date = 'That date does not exist.';
    if (!RX.cat.test(f.category)) e.category = 'Letters, spaces and hyphens only.';
    return e;
  };
})(window);
