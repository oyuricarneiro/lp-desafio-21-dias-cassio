/* ============================================================
   Página de obrigado — Desafio 21 Dias.
   Sem dependências além do AOS.
   O hero (Bloco 1) nunca entra no AOS: ele nasce visível.

   Todo observer tem fallback: se IntersectionObserver não existir,
   o estado FINAL é aplicado direto. Nada pode ficar invisível.
   ============================================================ */
(function () {
  'use strict';

  var TEM_IO = 'IntersectionObserver' in window;

  /* Liga a classe quando o elemento entra, e desliga o observer.
     Sem IO, liga na hora. */
  function aoEntrar(el, classe, limiar) {
    if (!el) { return; }
    if (!TEM_IO) { el.classList.add(classe); return; }
    var obs = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting) { return; }
      el.classList.add(classe);
      obs.disconnect();
    }, { threshold: limiar });
    obs.observe(el);
  }

  /* ---------- 1. AOS ---------- */
  if (window.AOS) {
    AOS.init({
      duration: 620,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disableMutationObserver: true
    });
  }

  /* ---------- 2. Bloco 3: clip reveal da frase do exame ----------
     É a frase mais importante da página, e a única com animação própria. */
  aoEntrar(document.getElementById('virada-foco'), 'is-on', 0.6);

  /* ---------- 3. Bloco 6: o trilho da timeline cresce ---------- */
  aoEntrar(document.querySelector('.consulta'), 'is-on', 0.35);

  /* ---------- 4. Bloco 8: o valor final assenta ----------
     Só um scale sutil. Sem contador crescente: isso vira infomercial. */
  aoEntrar(document.getElementById('recibo-final'), 'is-on', 0.6);

  /* ---------- 5. Perguntas: uma resposta aberta por vez ---------- */
  (function faq() {
    var botoes = Array.prototype.slice.call(document.querySelectorAll('.faq__q'));
    if (!botoes.length) { return; }

    function alvo(b) { return document.getElementById(b.getAttribute('aria-controls')); }

    function abrir(b) {
      var a = alvo(b); if (!a) { return; }
      b.setAttribute('aria-expanded', 'true');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
    function fechar(b) {
      var a = alvo(b); if (!a) { return; }
      b.setAttribute('aria-expanded', 'false');
      a.style.maxHeight = '0px';
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

  /* ---------- 6. Vídeo: facade, o mp4 só carrega no clique ----------
     Sem autoplay na thumb. As legendas entram como <track default>,
     que é mais acessível do que legenda queimada: dá para desligar,
     o leitor de tela alcança, e o arquivo não engorda. */
  (function video() {
    var frame = document.querySelector('.tv__frame');
    if (!frame) { return; }

    frame.addEventListener('click', function () {
      var src = frame.getAttribute('data-video');
      if (!src) { return; }

      var v = document.createElement('video');
      v.className = 'tv__video';
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';

      var vtt = frame.getAttribute('data-vtt');
      if (vtt) {
        var t = document.createElement('track');
        t.kind = 'captions';
        t.srclang = 'pt-BR';
        t.label = 'Português';
        t.src = vtt;
        t.default = true;
        v.appendChild(t);
      }

      frame.replaceWith(v);
      v.focus({ preventScroll: true });
      v.play().catch(function () { /* autoplay bloqueado: os controles estão lá */ });
    });
  })();

}());
