/* ============================================================
   Página de obrigado — Desafio 21 Dias.
   Sem dependências além do AOS.
   O hero (Bloco 1) nunca entra no AOS: ele nasce visível.
   ============================================================ */
(function () {
  'use strict';

  if (window.AOS) {
    AOS.init({
      duration: 620,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disableMutationObserver: true
    });
  }
}());
