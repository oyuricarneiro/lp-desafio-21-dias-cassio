/* ============================================================
   Desafio 21 Dias — Dr. Cássio Siqueira
   Sem dependências além do AOS.
   ============================================================ */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- AOS ---------- */
  if (window.AOS) {
    AOS.init({
      duration: 620,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disableMutationObserver: true
    });
  }

  /* ============================================================
     1. Preservação de parâmetros até o checkout
     Feito na própria página, nunca via GTM.
     ============================================================ */
  (function preservarParametros() {
    var manter = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
                  'src','sck','fbclid','gclid','ttclid','xcod'];
    var atuais = new URLSearchParams(window.location.search);
    var passar = new URLSearchParams();

    manter.forEach(function (chave) {
      var v = atuais.get(chave);
      if (v) { passar.set(chave, v); }
    });
    if (!passar.toString()) { return; }

    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.charAt(0) === '/') { return; }
      if (!/checkout|eduzz|pay\./i.test(href)) { return; }
      try {
        var u = new URL(href, window.location.href);
        passar.forEach(function (valor, chave) { u.searchParams.set(chave, valor); });
        a.setAttribute('href', u.toString());
      } catch (e) { /* href malformado: deixa como está */ }
    });
  })();

  /* ============================================================
     2. Barra fixa — entra quando o hero sai da tela
     ============================================================ */
  (function barraFixa() {
    var hero = document.querySelector('.hero');
    var barra = document.getElementById('stickybar');
    if (!hero || !barra || !('IntersectionObserver' in window)) { return; }

    new IntersectionObserver(function (entradas) {
      barra.classList.toggle('is-on', !entradas[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px' }).observe(hero);
  })();

  /* ============================================================
     3. Régua de 21 dias — Scroll Progress
     Decorativa: se o JS falhar, a seção continua completa.
     ============================================================ */
  (function reguaDeDias() {
    var regua = document.getElementById('regua');
    var secao = document.querySelector('.pratica');
    if (!regua || !secao) { return; }

    var DIAS = 21;
    var marcas = [];
    var rotulos = { 1: '01', 7: '07', 14: '14', 21: '21' };

    for (var d = 1; d <= DIAS; d++) {
      var m = document.createElement('span');
      m.className = 'regua__marca' + (d === 1 || d === DIAS ? ' regua__marca--borda' : '');
      regua.appendChild(m);
      marcas.push(m);
      if (rotulos[d]) {
        var r = document.createElement('span');
        r.className = 'regua__dia';
        r.textContent = rotulos[d];
        regua.appendChild(r);
      }
    }

    var ativos = -1;
    var agendado = false;

    function pintar() {
      agendado = false;
      var caixa = secao.getBoundingClientRect();
      var altura = window.innerHeight || document.documentElement.clientHeight;

      // razão: 0 quando o topo da seção chega ao fundo da tela,
      // 1 quando o fim da seção passa do topo
      var total = caixa.height + altura;
      var andado = altura - caixa.top;
      var razao = Math.min(1, Math.max(0, andado / total));

      // a régua só faz sentido no miolo da seção: normaliza 0.15–0.85
      var norm = Math.min(1, Math.max(0, (razao - 0.15) / 0.7));
      var n = Math.round(norm * DIAS);

      if (n !== ativos) {
        ativos = n;
        for (var i = 0; i < marcas.length; i++) {
          marcas[i].classList.toggle('is-on', i < n);
        }
      }

      // some quando a seção sai da tela, para não competir com a barra fixa
      regua.classList.toggle('is-off', caixa.bottom < 80 || caixa.top > altura);
      regua.classList.toggle('is-stuck', caixa.top < 0 && caixa.bottom > 200);
    }

    function agendar() {
      if (agendado) { return; }
      agendado = true;
      window.requestAnimationFrame(pintar);
    }

    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar, { passive: true });
    pintar();
  })();

  /* ============================================================
     4. Contador do preço — 0 até 47
     ============================================================ */
  (function contadorPreco() {
    var alvo = document.getElementById('preco-conta');
    if (!alvo || !('IntersectionObserver' in window)) { return; }

    var valor = parseInt(alvo.getAttribute('data-valor'), 10) || 0;
    if (semMovimento) { alvo.textContent = valor; return; }

    var obs = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting) { return; }
      obs.disconnect();

      var inicio = null;
      var duracao = 900;

      function passo(agora) {
        if (inicio === null) { inicio = agora; }
        var t = Math.min(1, (agora - inicio) / duracao);
        var eased = 1 - Math.pow(1 - t, 3);          // ease-out cúbico
        alvo.textContent = Math.round(eased * valor);
        if (t < 1) { window.requestAnimationFrame(passo); }
        else { alvo.textContent = valor; }
      }
      alvo.textContent = '0';
      window.requestAnimationFrame(passo);
    }, { threshold: 0.4 });

    obs.observe(alvo);
  })();

  /* ============================================================
     5. Selo da garantia — Draw SVG
     ============================================================ */
  (function seloGarantia() {
    var selo = document.getElementById('selo');
    if (!selo || !('IntersectionObserver' in window)) { return; }

    var obs = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting) { return; }
      selo.classList.add('is-visible');
      obs.disconnect();
    }, { threshold: 0.5 });

    obs.observe(selo);
  })();

  /* ============================================================
     6. FAQ — Progressive Reveal (uma resposta aberta por vez)
     ============================================================ */
  (function faq() {
    var botoes = Array.prototype.slice.call(document.querySelectorAll('.faq__q'));
    if (!botoes.length) { return; }

    function resposta(botao) {
      return document.getElementById(botao.getAttribute('aria-controls'));
    }

    function abrir(botao) {
      var alvo = resposta(botao);
      if (!alvo) { return; }
      botao.setAttribute('aria-expanded', 'true');
      alvo.classList.add('is-open');
      alvo.style.maxHeight = alvo.scrollHeight + 'px';
    }

    function fechar(botao) {
      var alvo = resposta(botao);
      if (!alvo) { return; }
      botao.setAttribute('aria-expanded', 'false');
      alvo.classList.remove('is-open');
      alvo.style.maxHeight = '0px';
    }

    botoes.forEach(function (botao) {
      // estado inicial vem do HTML
      if (botao.getAttribute('aria-expanded') === 'true') { abrir(botao); }
      else { fechar(botao); }

      botao.addEventListener('click', function () {
        var aberto = botao.getAttribute('aria-expanded') === 'true';
        botoes.forEach(fechar);
        if (!aberto) { abrir(botao); }
      });
    });

    // a resposta muda de altura quando a largura muda
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        botoes.forEach(function (botao) {
          if (botao.getAttribute('aria-expanded') === 'true') {
            var alvo = resposta(botao);
            if (alvo) { alvo.style.maxHeight = alvo.scrollHeight + 'px'; }
          }
        });
      }, 140);
    }, { passive: true });
  })();

  /* ============================================================
     7. VSL — facade. O player só é injetado no clique.
     Enquanto o arquivo do vídeo não existir, não faz nada.
     ============================================================ */
  (function vsl() {
    var frame = document.querySelector('.vsl__frame');
    if (!frame) { return; }

    frame.addEventListener('click', function () {
      var src = frame.getAttribute('data-video');
      if (!src) { return; }                 // vídeo ainda não entregue

      var video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');            // iOS antigo
      video.preload = 'auto';

      frame.replaceWith(video);
      video.focus({ preventScroll: true });
      video.play().catch(function () { /* autoplay bloqueado: controles ficam disponíveis */ });
    });
  })();

})();
