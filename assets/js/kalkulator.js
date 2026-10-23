/* Logika kalkulatora. Cene se NE menjaju ovde, već u kalkulator-cene.js */
(function () {
  const C = window.KALKULATOR_CENE, $ = (id) => document.getElementById(id), KEY = 'euromont-kalkulator-v1';
  const otvara = (o) => o[0] === 'L' || o[0] === 'D' || o[0] === 'S' || o === 'T';
  const first = (o) => Object.keys(o)[0];
  const fmt = (n) => n.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + C.valuta;
  const t0 = C.tipovi[first(C.tipovi)];
  const S = { sistem: first(C.sistemi), tab: t0.grupa, tip: first(C.tipovi), boja: first(C.boje), staklo: first(C.stakla),
    sirina: t0.def[0], visina: t0.def[1], kolicina: 1, roletna: first(C.roletne), komarnik: first(C.komarnici) };
  S.L = mkL(t0);
  const sisUrl = new URLSearchParams(location.search).get('sistem');
  if (sisUrl && C.sistemi[sisUrl]) S.sistem = sisUrl;
  let poz = [];
  try { poz = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { poz = []; }
  const snimi = () => { try { localStorage.setItem(KEY, JSON.stringify(poz)); } catch (e) {} };

  /* ---------- raspored polja i crtanje skice ---------- */
  function mkL(t) {
    return { rows: t.r.map((r) => { const c = r[1].split(','); return { h: r[0], cols: c.map((o, i) => ({ w: r[2] ? r[2][i] : 1 / c.length, o })) }; }) };
  }
  let uid = 0;
  function krilo(x, y, w, h, c, hex, f) {
    const dr = c[1] === 'K' || c[1] === 'U';
    const a = c === 'F' ? f * 0.5 : f * 0.9, gx = x + a, gy = y + a, gw = w - 2 * a, gh = h - 2 * a;
    const ln = (p, d) => `<path d="M${p[0]} ${p[1]}L${p[2]} ${p[3]}L${p[4]} ${p[5]}" fill="none" stroke="#2b3441" stroke-width="1"${d ? ' stroke-dasharray="4 3"' : ''}/>`;
    let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${hex}" stroke="#4a5360"/>`;
    if (dr) {
      /* vrata sa panelom: karolaj (staklo gore, panel dole) i UK panel (uzak prozorčić) */
      const gl = (px, py, pw, ph) => `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#cfe4f6" stroke="#6f8aa5" stroke-width=".8"/>`;
      const pn = (px, py, pw, ph) => `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#4a5360" stroke-width=".7" opacity=".7"/>`;
      o += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${hex}" stroke="#4a5360" stroke-width=".8"/>`;
      if (c[1] === 'K') o += gl(gx + gw * 0.14, gy + gh * 0.08, gw * 0.72, gh * 0.5) + pn(gx + gw * 0.14, gy + gh * 0.66, gw * 0.72, gh * 0.26);
      else { const pw = gw * 0.36; o += pn(gx + gw * 0.08, gy + gh * 0.05, gw * 0.84, gh * 0.9) + gl(gx + (gw - pw) / 2, gy + gh * 0.1, pw, gh * 0.8); }
    } else o += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#cfe4f6" stroke="#6f8aa5" stroke-width=".8"/>`;
    if (c[0] === 'L') o += ln([gx + gw, gy, gx, gy + gh / 2, gx + gw, gy + gh]);
    if (c[0] === 'D') o += ln([gx, gy, gx + gw, gy + gh / 2, gx, gy + gh]);
    if (c.indexOf('T') > -1) o += ln([gx, gy, gx + gw / 2, gy + gh, gx + gw, gy], true);
    if (c[0] === 'S') {
      const m = gy + gh / 2, lft = c[1] === '<', tip = gx + gw * (lft ? 0.2 : 0.8), tail = gx + gw * (lft ? 0.8 : 0.2), hx = lft ? 6 : -6;
      o += `<path d="M${tail} ${m}H${tip}M${tip + hx} ${m - 4}L${tip} ${m}L${tip + hx} ${m + 4}" fill="none" stroke="#2b3441" stroke-width="1.4"/>`;
    }
    return o;
  }
  /* L = raspored, s = širina, v = UKUPNA visina (sa kutijom roletne), op = { mala, kut (cm), kom } */
  function skica(L, s, v, hex, op) {
    op = op || {};
    const mala = !!op.mala, kut = op.kut || 0, vs = v - kut, id = 'sk' + (++uid);
    const bx = mala ? 84 : 200, k = bx / Math.max(s, v), w = s * k, h = v * k, kh = kut * k, f = mala ? 3 : 7;
    const X = mala ? 4 : 30, Y = mala ? 4 : 12, W = X + w + (mala ? 4 : 12), H = Y + h + (mala ? 4 : 26);
    const iw = w - 2 * f, ih = h - kh - 2 * f, x0 = X + f, y0 = Y + kh + f;
    let o = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Skica elementa">` +
      `<defs><pattern id="${id}r" width="10" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H10" stroke="#59636f" stroke-width="1.6" opacity=".45"/></pattern>` +
      `<pattern id="${id}k" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H5M0 0V5" stroke="#4a5a6a" stroke-width=".5" opacity=".75"/></pattern></defs>`;
    if (kut) o += `<rect x="${X}" y="${Y}" width="${w}" height="${kh}" fill="#8d97a3" stroke="#4a5360" stroke-width="1.2"/>` +
      (mala ? '' : `<text x="${X + w / 2}" y="${Y + kh / 2 + 3}" text-anchor="middle" font-size="9" fill="#fff" font-family="Roboto,sans-serif">kutija roletne ${kut} cm</text>`);
    o += `<rect x="${X}" y="${Y + kh}" width="${w}" height="${h - kh}" fill="${hex}" stroke="#4a5360" stroke-width="1.2"/>`;
    let lab = '', kmr = '', y = y0;
    L.rows.forEach((row, ri) => {
      const rh = ih * row.h;
      let x = x0;
      row.cols.forEach((c, ci) => {
        const cw = iw * c.w;
        o += krilo(x, y, cw, rh, c.o, hex, f);
        if (op.kom && (!imaKrilo(L) || otvara(c.o))) kmr += `<rect x="${x}" y="${y}" width="${cw}" height="${rh}" fill="url(#${id}k)" pointer-events="none"/>`;
        if (!mala) lab += `<text x="${x + 4}" y="${y + rh - 4}" font-size="9" fill="#44505c" font-family="Roboto,sans-serif" pointer-events="none">${Math.round(c.w * s)}×${Math.round(row.h * vs)}</text>`;
        x += cw;
      });
      y += rh;
    });
    if (kut) o += `<rect x="${x0}" y="${y0}" width="${iw}" height="${ih}" fill="url(#${id}r)" pointer-events="none"/>`;
    o += kmr;
    o += lab;
    if (!mala) {
      const tx = 'font-size="11" fill="#5b6572" font-family="Roboto,sans-serif"', by = Y + h + 10, lx = X - 10;
      o += `<path d="M${X} ${by}H${X + w}M${X} ${by - 3}V${by + 3}M${X + w} ${by - 3}V${by + 3}M${lx} ${Y}V${Y + h}M${lx - 3} ${Y}H${lx + 3}M${lx - 3} ${Y + h}H${lx + 3}" stroke="#8a94a1" fill="none"/>` +
        `<text x="${X + w / 2}" y="${by + 13}" text-anchor="middle" ${tx}>${s}</text>` +
        `<text transform="translate(${lx - 5} ${Y + h / 2}) rotate(-90)" text-anchor="middle" ${tx}>${v}</text>`;
    }
    return o + '</svg>';
  }

  /* ---------- gradnja elemenata stranice ---------- */
  const TAB = { prozori: 'Prozori', kombinacije: 'Kombinacije', vrata: 'Balkonska vrata', ulazna: 'Ulazna vrata', sve: 'Sve' };
  $('datum').textContent = 'Cene važe od ' + C.datumCenovnika + '.';
  $('napomena').textContent = C.napomena;
  $('pozovi').href = 'tel:' + C.kontakt.telefon.replace(/\s/g, '');
  $('pozovi').textContent = 'Pozovite nas: ' + C.kontakt.telefon;
  $('staklaNote').textContent = `Standardno staklo je uključeno u cenu. Doplata se računa na ${Math.round(C.udeoStakla * 100)}% površine elementa (površina stakla).`;
  $('sistemi').innerHTML = Object.keys(C.sistemi).map((k) => `<button type="button" data-k="sistem" data-v="${k}"><strong>${C.sistemi[k].naziv}</strong><br><span>${C.sistemi[k].dubina}</span></button>`).join('');
  $('tabovi').innerHTML = Object.keys(TAB).map((k) => `<button type="button" data-k="tab" data-v="${k}">${TAB[k]}</button>`).join('');
  $('tipovi').innerHTML = Object.keys(C.tipovi).map((k) => { const t = C.tipovi[k];
    return `<button type="button" class="kalk-tile" data-k="tip" data-v="${k}" data-g="${t.grupa}"><span class="sk">${skica(mkL(t), t.def[0], t.def[1], '#fff', { mala: true })}</span><strong>${t.naziv}</strong><span>${t.kod}</span></button>`; }).join('');
  $('boje').innerHTML = Object.keys(C.boje).map((k) => `<button type="button" class="kalk-sw" data-k="boja" data-v="${k}"><span class="sw" style="background:${C.boje[k].hex}"></span><span>${C.boje[k].naziv}</span></button>`).join('');
  $('stakla').innerHTML = Object.keys(C.stakla).map((k) => { const g = C.stakla[k];
    return `<button type="button" class="kalk-opt" data-k="staklo" data-v="${k}"><strong>${g.naziv}</strong><br><span>${g.doplataPoM2 ? '+' + g.doplataPoM2 + ' ' + C.valuta + '/m²' : 'uključeno u cenu'}</span></button>`; }).join('');
  ['roletna', 'komarnik'].forEach((id) => { const l = C[id === 'roletna' ? 'roletne' : 'komarnici'];
    $(id).innerHTML = Object.keys(l).map((k) => `<option value="${k}">${l[k].naziv}</option>`).join(''); });
  $('sirina').value = S.sirina; $('visina').value = S.visina;

  /* ---------- pravila: gde su roletna i komarnik dozvoljeni ---------- */
  const imaKrilo = (L) => L.rows.some((r) => r.cols.some((c) => otvara(c.o)));
  const mozeRol = (t) => (t.roletna !== undefined ? t.roletna : t.grupa !== 'ulazna');
  const mozeKom = (t, L) => (t.komarnik !== undefined ? t.komarnik : t.grupa !== 'ulazna' && imaKrilo(L));
  function pravila() {
    const t = C.tipovi[S.tip], r = mozeRol(t), k = mozeKom(t, S.L);
    if (!r) S.roletna = first(C.roletne);
    if (!k) S.komarnik = first(C.komarnici);
    $('roletna').value = S.roletna; $('komarnik').value = S.komarnik;
    $('roletna').disabled = !r; $('komarnik').disabled = !k;
    const n = [];
    if (!r) n.push('Roletna nije dostupna za ovaj element.');
    if (!k) n.push(t.grupa === 'ulazna' ? 'Komarnik nije dostupan za ulazna vrata.' : 'Komarnik nije dostupan za ovaj element (samo fiksna polja).');
    $('opcijeNote').textContent = n.join(' ');
  }

  /* ---------- obračun ---------- */
  const kutCm = () => { const ro = C.roletne[S.roletna]; return (ro.poM2 || ro.fiksno) ? C.roletnaKutijaCm : 0; };
  function izracunaj() {
    pravila();
    const t = C.tipovi[S.tip], sys = C.sistemi[S.sistem], bo = C.boje[S.boja], st = C.stakla[S.staklo], ro = C.roletne[S.roletna], ko = C.komarnici[S.komarnik];
    const g = C.granice[t.grupa], l = t.lim || [g.s[0], g.s[1], g.v[0], g.v[1]], s = S.sirina, v = S.visina, q = S.kolicina, kut = kutCm(), vs = v - kut;
    let greska = '';
    if (!(s >= l[0] && s <= l[1])) greska = `Širina mora biti između ${l[0]} i ${l[1]} cm.`;
    else if (!(v >= l[2] + kut && v <= l[3])) greska = `Visina mora biti između ${l[2] + kut} i ${l[3]} cm` + (kut ? ` (u visinu je uračunata kutija roletne od ${kut} cm).` : '.');
    else if (!Number.isInteger(q) || q < 1 || q > 100) greska = 'Količina mora biti ceo broj od 1 do 100.';
    if (greska) return { greska };
    const m2 = Math.max(s * vs / 1e4, C.minPovrsinaM2), F = C.faktoriKrila;
    let fs = 0, kf = 0;
    S.L.rows.forEach((r) => {
      r.cols.forEach((c) => { if (otvara(c.o)) kf += r.h * c.w; fs += r.h * c.w * (c.o === 'F' ? F.fiks : c.o[0] === 'S' ? F.klizno : F.krilo); });
    });
    const osn = m2 * sys.cenaPoM2 * t.faktor * fs, m2r = Math.max(s * v / 1e4, C.roletneMinM2);
    const redovi = [['Osnovna stolarija', osn], ['Boja / dekor: ' + bo.naziv, osn * bo.dopuna], ['Staklo: ' + st.naziv, m2 * (t.udeo || C.udeoStakla) * st.doplataPoM2],
      [ro.naziv, kut ? ro.poM2 * m2r + ro.fiksno : 0], [ko.naziv, ko.poM2 ? ko.poM2 * Math.max(m2 * (kf || 1), C.komarniciMinM2) : 0]];
    const delovi = [t.naziv, sys.naziv, `${s} × ${v} cm`, bo.naziv, st.naziv];
    if (kut) delovi.push(ro.naziv.toLowerCase());
    if (ko.poM2) delovi.push(ko.naziv.toLowerCase());
    const jed = redovi.reduce((z, r) => z + r[1], 0);
    return { q, kut, jed, ukupno: jed * q, opis: delovi.join(' · '), redovi: redovi.filter((r) => r[1] > 0) };
  }

  function osvezi() {
    document.querySelectorAll('[data-k]').forEach((b) => b.setAttribute('aria-pressed', S[b.dataset.k] === b.dataset.v));
    document.querySelectorAll('#tipovi [data-g]').forEach((b) => { b.hidden = S.tab !== 'sve' && b.dataset.g !== S.tab; });
    const r = izracunaj(), t = C.tipovi[S.tip], sys = C.sistemi[S.sistem], bo = C.boje[S.boja], kut = kutCm();
    const sw = S.sirina > 0 ? S.sirina : t.def[0], vh = S.visina > kut + 20 ? S.visina : Math.max(t.def[1], kut + 40);
    $('greska').textContent = r.greska || '';
    $('dodaj').disabled = !!r.greska;
    $('pvSkica').innerHTML = skica(S.L, sw, vh, bo.hex, { kut, kom: C.komarnici[S.komarnik].poM2 > 0 });
    $('pvNaslov').textContent = `${t.naziv} · ${sw} × ${vh} cm · ${bo.naziv}`;
    $('pvInfo').textContent = `${sys.naziv} · Uf profila ${sys.uf} W/m²K` + (kut ? ` · stolarija ${vh - kut} cm + kutija ${kut} cm` : '');
    const red = (a, b, c) => `<div class="d-flex justify-content-between gap-2"><${c || 'span'}>${a}</${c || 'span'}><${c || 'span'}>${b}</${c || 'span'}></div>`;
    $('pvRedovi').innerHTML = r.greska ? '' : r.redovi.map((x) => red(x[0], fmt(x[1]))).join('');
    $('pvCena').innerHTML = r.greska ? '' : red('Po komadu', fmt(r.jed), 'strong') + (r.q > 1 ? red(`Ukupno (${r.q} kom)`, fmt(r.ukupno), 'strong') : '');
  }

  function prikaz() {
    const uk = poz.reduce((z, p) => z + p.ukupno, 0);
    $('pozicije').innerHTML = poz.map((p, n) => { const t = C.tipovi[p.tip], b = C.boje[p.boja];
      return `<li class="kalk-item">${t && b ? `<span class="kalk-th">${skica(p.L || mkL(t), p.s, p.v, b.hex, { mala: true, kut: p.kut || 0, kom: p.kom })}</span>` : ''}` +
        `<span class="kalk-tx">${p.q} × ${p.opis}<br><button type="button" class="btn btn-link p-0 text-danger" data-i="${n}">Ukloni</button></span>` +
        `<strong class="price text-nowrap">${fmt(p.ukupno)}</strong></li>`; }).join('');
    $('prazno').hidden = poz.length > 0;
    $('isprazni').hidden = !poz.length;
    $('ukupno').textContent = fmt(uk);
    const telo = poz.map((p, n) => `${n + 1}. ${p.q} kom – ${p.opis} – ${fmt(p.ukupno)}`).join('\n') + `\n\nUkupno: ${fmt(uk)}\n\nIme i telefon:`;
    const a = $('posalji');
    a.classList.toggle('disabled', !poz.length);
    $('stampaj').disabled = !poz.length;
    a.href = poz.length ? `mailto:${C.kontakt.email}?subject=${encodeURIComponent('Upit za ponudu – kalkulator cene')}&body=${encodeURIComponent(telo)}` : '#';
  }

  /* ---------- ostali događaji ---------- */
  document.querySelector('.kalk').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    S[b.dataset.k] = b.dataset.v;
    if (b.dataset.k === 'tip') { const t = C.tipovi[S.tip]; S.sirina = t.def[0]; S.visina = t.def[1]; S.L = mkL(t); $('sirina').value = S.sirina; $('visina').value = S.visina; }
    osvezi();
  });
  ['sirina', 'visina', 'kolicina'].forEach((id) => $(id).addEventListener('input', () => { S[id] = Number($(id).value); osvezi(); }));
  ['roletna', 'komarnik'].forEach((id) => $(id).addEventListener('change', () => { S[id] = $(id).value; osvezi(); }));
  $('dodaj').addEventListener('click', () => {
    const r = izracunaj();
    if (r.greska) return;
    poz.push({ tip: S.tip, boja: S.boja, s: S.sirina, v: S.visina, q: r.q, opis: r.opis, ukupno: r.ukupno, L: JSON.parse(JSON.stringify(S.L)), kut: r.kut, kom: C.komarnici[S.komarnik].poM2 > 0 });
    snimi(); prikaz();
  });
  $('pozicije').addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) { poz.splice(Number(b.dataset.i), 1); snimi(); prikaz(); }
  });
  $('isprazni').addEventListener('click', () => { poz = []; snimi(); prikaz(); });
  /* ---------- štampanje ponude ---------- */
  $('stampaj').addEventListener('click', () => {
    if (!poz.length) return;
    const uk = poz.reduce((z, p) => z + p.ukupno, 0), k = C.kontakt;
    const red = poz.map((p, n) => { const t = C.tipovi[p.tip], b = C.boje[p.boja];
      const sk = t && b ? skica(p.L || mkL(t), p.s, p.v, b.hex, { kut: p.kut || 0, kom: p.kom }) : '';
      return `<tr><td class="c">${n + 1}</td><td class="sk">${sk}</td><td>${p.opis}</td><td class="c">${p.q}</td><td class="r">${fmt(p.ukupno / p.q)}</td><td class="r">${fmt(p.ukupno)}</td></tr>`; }).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Dozvolite otvaranje novog prozora da bi se ponuda štampala.'); return; }
    w.document.write(`<!DOCTYPE html><html lang="sr"><head><meta charset="utf-8"><title>Ponuda | Euromont</title><style>
      body{font-family:Roboto,Arial,sans-serif;color:#212934;margin:24px;font-size:13px}
      .top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #f3af32;padding-bottom:10px;margin-bottom:16px}
      h1{margin:0;font-size:26px;letter-spacing:1px} .top div:last-child{text-align:right;line-height:1.5}
      table{width:100%;border-collapse:collapse} th{background:#212934;color:#fff;text-align:left;padding:7px;font-size:12px}
      td{padding:8px 7px;border-bottom:1px solid #d5dce6;vertical-align:middle} tr{page-break-inside:avoid}
      .c{text-align:center} .r{text-align:right;white-space:nowrap} .sk{width:170px;text-align:center} .sk svg{width:160px;height:auto;max-height:170px}
      .uk{display:flex;justify-content:flex-end;gap:24px;margin-top:14px;font-size:18px;font-weight:700} .uk span:last-child{color:#c98b10}
      .nap{margin-top:18px;color:#6b7685;font-size:12px} @page{margin:12mm}
    </style></head><body>
      <div class="top"><div><h1>EUROMONT</h1>${k.adresa || ''}<br>${k.telefon} · ${k.email}</div><div><strong>Predračun / ponuda</strong><br>Datum: ${new Date().toLocaleDateString('sr-RS')}<br>Cene važe od ${C.datumCenovnika}</div></div>
      <table><thead><tr><th class="c">#</th><th>Skica</th><th>Opis</th><th class="c">Kom</th><th class="r">Cena / kom</th><th class="r">Ukupno</th></tr></thead><tbody>${red}</tbody></table>
      <div class="uk"><span>Ukupno</span><span>${fmt(uk)}</span></div>
      <p class="nap">${C.napomena}</p></body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 400);
  });
  osvezi(); prikaz();
})();
