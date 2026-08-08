/* ============================================================
   Desafio 21 Dias — V2. Sem dependências além do AOS.
   ============================================================ */
(function () {
  'use strict';

  if (window.AOS) {
    AOS.init({ duration: 620, easing: 'ease-out-cubic', once: true, offset: 60, disableMutationObserver: true });
  }

  /* ---------- 1. Preservação de parâmetros até o checkout ----------
     Na própria página, nunca via GTM. */
  (function preservarParametros() {
    var manter = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
                  'src','sck','fbclid','gclid','ttclid','xcod'];
    var atuais = new URLSearchParams(window.location.search);
    var passar = new URLSearchParams();

    manter.forEach(function (c) { var v = atuais.get(c); if (v) { passar.set(c, v); } });
    if (!passar.toString()) { return; }

    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.charAt(0) === '/') { return; }
      if (!/checkout|eduzz|pay\./i.test(href)) { return; }
      try {
        var u = new URL(href, window.location.href);
        passar.forEach(function (valor, chave) { u.searchParams.set(chave, valor); });
        a.setAttribute('href', u.toString());
      } catch (e) { /* href malformado */ }
    });
  })();

  /* ---------- 2. Barra fixa: entra quando a dobra sai ---------- */
  (function barraFixa() {
    var dobra = document.querySelector('.dobra');
    var barra = document.getElementById('stickybar');
    if (!dobra || !barra || !('IntersectionObserver' in window)) { return; }
    new IntersectionObserver(function (e) {
      barra.classList.toggle('is-on', !e[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px' }).observe(dobra);
  })();

  /* ---------- 3. Régua de 21 dias (decorativa) ---------- */
  (function regua() {
    var el = document.getElementById('regua');
    var secao = document.querySelector('.pratica');
    if (!el || !secao) { return; }

    var DIAS = 21, marcas = [], rotulos = { 1:'01', 7:'07', 14:'14', 21:'21' };

    for (var d = 1; d <= DIAS; d++) {
      var m = document.createElement('span');
      m.className = 'regua__marca' + (d === 1 || d === DIAS ? ' regua__marca--borda' : '');
      el.appendChild(m); marcas.push(m);
      if (rotulos[d]) {
        var r = document.createElement('span');
        r.className = 'regua__dia'; r.textContent = rotulos[d];
        el.appendChild(r);
      }
    }

    var ativos = -1, agendado = false;

    function pintar() {
      agendado = false;
      var c = secao.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      var razao = Math.min(1, Math.max(0, (h - c.top) / (c.height + h)));
      var n = Math.round(Math.min(1, Math.max(0, (razao - 0.15) / 0.7)) * DIAS);

      if (n !== ativos) {
        ativos = n;
        for (var i = 0; i < marcas.length; i++) { marcas[i].classList.toggle('is-on', i < n); }
      }
      el.classList.toggle('is-off', c.bottom < 80 || c.top > h);
      el.classList.toggle('is-stuck', c.top < 0 && c.bottom > 200);
    }

    function agendar() { if (!agendado) { agendado = true; window.requestAnimationFrame(pintar); } }
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar, { passive: true });
    pintar();
  })();

  /* ---------- 4. Selo da garantia: Draw SVG ---------- */
  (function selo() {
    var el = document.getElementById('selo');
    if (!el || !('IntersectionObserver' in window)) { return; }
    var obs = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) { return; }
      el.classList.add('is-visible'); obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(el);
  })();

  /* ---------- 5. FAQ: uma resposta aberta por vez ---------- */
  (function faq() {
    var botoes = Array.prototype.slice.call(document.querySelectorAll('.faq__q'));
    if (!botoes.length) { return; }

    function alvo(b) { return document.getElementById(b.getAttribute('aria-controls')); }
    function abrir(b) {
      var a = alvo(b); if (!a) { return; }
      b.setAttribute('aria-expanded', 'true');
      a.classList.add('is-open'); a.style.maxHeight = a.scrollHeight + 'px';
    }
    function fechar(b) {
      var a = alvo(b); if (!a) { return; }
      b.setAttribute('aria-expanded', 'false');
      a.classList.remove('is-open'); a.style.maxHeight = '0px';
    }

    botoes.forEach(function (b) {
      if (b.getAttribute('aria-expanded') === 'true') { abrir(b); } else { fechar(b); }
      b.addEventListener('click', function () {
        var aberto = b.getAttribute('aria-expanded') === 'true';
        botoes.forEach(fechar);
        if (!aberto) { abrir(b); }
      });
    });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        botoes.forEach(function (b) {
          if (b.getAttribute('aria-expanded') === 'true') {
            var a = alvo(b); if (a) { a.style.maxHeight = a.scrollHeight + 'px'; }
          }
        });
      }, 140);
    }, { passive: true });
  })();

  /* ---------- 6. Data do fechamento: hoje + 21 dias ----------
     Sem isso o texto envelhece. O HTML já traz um fallback legível. */
  (function dataFutura() {
    var alvos = document.querySelectorAll('.fim__data[data-dias]');
    if (!alvos.length) { return; }
    var meses = ['janeiro','fevereiro','março','abril','maio','junho',
                 'julho','agosto','setembro','outubro','novembro','dezembro'];
    alvos.forEach(function (el) {
      var dias = parseInt(el.getAttribute('data-dias'), 10);
      if (!dias) { return; }
      var d = new Date();
      d.setDate(d.getDate() + dias);
      el.textContent = d.getDate() + ' de ' + meses[d.getMonth()];
    });
  })();

  /* ---------- 7. VSL: facade, o mp4 só carrega no clique ---------- */
  (function vsl() {
    var frame = document.querySelector('.vsl__frame');
    if (!frame) { return; }
    frame.addEventListener('click', function () {
      var src = frame.getAttribute('data-video');
      if (!src) { return; }
      var v = document.createElement('video');
      v.src = src; v.controls = true; v.autoplay = true;
      v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
      frame.replaceWith(v);
      v.focus({ preventScroll: true });
      v.play().catch(function () { /* autoplay bloqueado: controles disponíveis */ });
    });
  })();

})();
