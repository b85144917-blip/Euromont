/* Euromont – zajedničke skripte (bez jQuery-ja) */
document.addEventListener('DOMContentLoaded', function () {
    /* Pojavljivanje elemenata pri skrolovanju */
    function reveal(selector, threshold) {
        var els = document.querySelectorAll(selector);
        if (!('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('active'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: threshold });
        els.forEach(function (el) { observer.observe(el); });
    }
    reveal('.services', 0.5);
    reveal('.card', 0.1);

    /* Klik na sličicu proizvoda menja glavnu fotografiju */
    var main = document.getElementById('product-detail');
    if (main) {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('.product-links-wap a');
            var img = link && link.querySelector('img');
            if (!img) return;
            main.src = img.currentSrc || img.src;
            main.alt = img.alt || main.alt;
        });
    }
});
