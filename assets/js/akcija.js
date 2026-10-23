/* Euromont – popup sa akcijom (prikazuje se do datuma iz AKCIJA.vaziDo) */
var AKCIJA = {
    aktivna: true,
    vaziDo: '2026-11-30T23:59:59',   // posle ovog trenutka popup se više ne prikazuje
    naslov: 'Jesenja akcija',
    popust: '-15%',
    tekst: 'Na sve komarnike i roletne poručene do kraja novembra. Merenje i ugradnja su besplatni.',
    dugme: 'Pošaljite upit',
    link: 'kontakt.html',
    kasnjenjeMs: 1500                 // koliko posle učitavanja strane da se pojavi
};

document.addEventListener('DOMContentLoaded', function () {
    var kraj = new Date(AKCIJA.vaziDo);
    var forsiraj = /[?&]akcija\b/.test(location.search);   // ?akcija u adresi – uvek prikaži (za test)
    if (!AKCIJA.aktivna || (!forsiraj && Date.now() > kraj)) return;
    if (!forsiraj) {
        try { if (sessionStorage.getItem('akcija-videna') === AKCIJA.vaziDo) return; } catch (e) {}
    }
    if (!window.bootstrap) return;

    var datum = kraj.toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' });
    var el = document.createElement('div');
    el.className = 'modal fade';
    el.id = 'akcija-modal';
    el.tabIndex = -1;
    el.setAttribute('aria-labelledby', 'akcija-naslov');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
        '<div class="modal-dialog modal-dialog-centered">' +
            '<div class="modal-content akcija-content">' +
                '<button type="button" class="btn-close akcija-close" data-bs-dismiss="modal" aria-label="Zatvori"></button>' +
                '<div class="akcija-badge">' + AKCIJA.popust + '</div>' +
                '<h2 class="h3 akcija-naslov" id="akcija-naslov">' + AKCIJA.naslov + '</h2>' +
                '<p class="akcija-tekst">' + AKCIJA.tekst + '</p>' +
                '<div class="akcija-odbrojavanje" aria-live="off">' +
                    '<div><span data-d>0</span><small>dana</small></div>' +
                    '<div><span data-h>00</span><small>sati</small></div>' +
                    '<div><span data-m>00</span><small>min</small></div>' +
                    '<div><span data-s>00</span><small>sek</small></div>' +
                '</div>' +
                '<p class="akcija-rok">Akcija traje do ' + datum + '.</p>' +
                '<a href="' + AKCIJA.link + '" class="btn btn-success btn-lg akcija-dugme">' + AKCIJA.dugme + '</a>' +
            '</div>' +
        '</div>';
    document.body.appendChild(el);

    var polja = {
        d: el.querySelector('[data-d]'), h: el.querySelector('[data-h]'),
        m: el.querySelector('[data-m]'), s: el.querySelector('[data-s]')
    };
    function dve(n) { return (n < 10 ? '0' : '') + n; }
    function osvezi() {
        var ostalo = Math.max(0, Math.floor((kraj - Date.now()) / 1000));
        polja.d.textContent = Math.floor(ostalo / 86400);
        polja.h.textContent = dve(Math.floor(ostalo % 86400 / 3600));
        polja.m.textContent = dve(Math.floor(ostalo % 3600 / 60));
        polja.s.textContent = dve(ostalo % 60);
    }
    osvezi();
    var tajmer = setInterval(osvezi, 1000);

    el.addEventListener('hidden.bs.modal', function () {
        clearInterval(tajmer);
        try { sessionStorage.setItem('akcija-videna', AKCIJA.vaziDo); } catch (e) {}
    });

    setTimeout(function () { new bootstrap.Modal(el).show(); }, AKCIJA.kasnjenjeMs);
});
