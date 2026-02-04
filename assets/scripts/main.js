import initMenuHamburguer from "./modules/menuMobile.js";
import initgoToStart from "./modules/go-to-start.js";
import initDepoimentos from "./modules/depoimentos.js";
import initVerificarFuncionamento from "./modules/verificarFuncionamento.js";
import initScrollSauve from "./modules/scrollsuave.js";
import initKitDetox from "./modules/kitDetox.js";
import initCardapioDodia from "./modules/cardapioDodia.js";

// import initModalCarrinho from "./modules/modal-cart.js";

// Função global para toggle entre Cardápio do Dia e Marmitas Congeladas
window.toggleCardapio = (tipo) => {
  // Atualizar cards seletores
  const cards = document.querySelectorAll("[data-selecao]");
  cards.forEach((card) => {
    if (card.dataset.selecao === tipo) {
      card.classList.add("selecao-card--ativo");
    } else {
      card.classList.remove("selecao-card--ativo");
    }
  });

  // Mostrar/esconder seções de cardápio
  const secoes = document.querySelectorAll("[data-cardapio-tipo]");
  secoes.forEach((secao) => {
    if (secao.dataset.cardapioTipo === tipo) {
      secao.classList.remove("hidden");
      secao.style.display = "block";
    } else {
      secao.classList.add("hidden");
      secao.style.display = "none";
    }
  });

  // Scroll suave para a seção
  const primeiraSecao = document.querySelector(`[data-cardapio-tipo="${tipo}"]`);
  if (primeiraSecao) {
    setTimeout(() => {
      primeiraSecao.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
};

initMenuHamburguer();
initgoToStart();
initDepoimentos();
initVerificarFuncionamento();
initScrollSauve();
initKitDetox();
initCardapioDodia();
// initModalCarrinho();
