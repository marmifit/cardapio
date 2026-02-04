import TESTIMONIALS from "../api/testimonials.js";

export default function initDepoimentos() {
  const carrosselContainer = document.querySelector(".depoimentos__content");

  if (!carrosselContainer) return;

  // Função para gerar estrelas baseado na nota
  function gerarEstrelas(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = "";

    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fa fa-star"></i>';
    }

    // Meia estrela
    if (hasHalfStar) {
      starsHTML += '<i class="fa fa-star-half-alt"></i>';
    }

    // Estrelas vazias
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
  }

  // Criar HTML do carrossel
  const carrosselHTML = `
    <div class="depoimentos-carrossel">
      <div class="depoimentos-slides">
        ${TESTIMONIALS.map(
          (testimonial, index) => `
          <div class="depoimentos__content__feedback ${index === 0 ? "active" : ""}" data-slide="${index}">
            <div class="depoimentos__content__feedback__client">
              <div class="depoimentos__content__feedback__client__image">
                <img src="${testimonial.image}" alt="${testimonial.name}" />
              </div>
              <div class="depoimentos__content__feedback__client__name">
                <div class="depoimentos__content__feedback__client__name__avaliate">
                  <span id="name-client">${testimonial.name}</span>
                  ${gerarEstrelas(testimonial.rating)}
                  <span>${testimonial.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div class="depoimentos__content__feedback__client__text">
              <span id="left"><i class="fa-solid fa-quote-left"></i></span>
              <p>${testimonial.text}</p>
              <span id="right"><i class="fa-solid fa-quote-right"></i></span>
            </div>
          </div>
        `,
        ).join("")}
      </div>
      
      <div class="depoimentos__content__pages">
        ${TESTIMONIALS.map(
          (_, index) => `
          <button class="shadow-8dp ${index === 0 ? "ativo" : ""}" data-dot="${index}">
            <span></span>
          </button>
        `,
        ).join("")}
      </div>
    </div>
  `;

  // Inserir no container (após o título)
  const title = carrosselContainer.querySelector(".depoimentos__content__title");
  title.insertAdjacentHTML("afterend", carrosselHTML);

  // Variáveis do carrossel
  let currentSlide = 0;
  let autoPlayInterval;
  const slides = document.querySelectorAll(".depoimentos__content__feedback");
  const dots = document.querySelectorAll("[data-dot]");
  const AUTOPLAY_DELAY = 5000; // 5 segundos

  // Função para mostrar slide
  function showSlide(index) {
    // Remover classe active de todos
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("ativo"));

    // Adicionar classe active no atual
    slides[index].classList.add("active");
    dots[index].classList.add("ativo");

    currentSlide = index;
  }

  // Função para próximo slide
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  // Função para slide anterior
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Iniciar autoplay
  function startAutoPlay() {
    // Limpar qualquer intervalo existente antes de criar um novo
    stopAutoPlay();
    autoPlayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  // Parar autoplay
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Event listeners para os dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      showSlide(index);
      startAutoPlay(); // Reiniciar autoplay após clique (já limpa o anterior internamente)
    });
  });

  // Pausar ao passar o mouse
  const carrossel = document.querySelector(".depoimentos-carrossel");
  if (carrossel) {
    carrossel.addEventListener("mouseenter", stopAutoPlay);
    carrossel.addEventListener("mouseleave", startAutoPlay);
  }

  // Iniciar o autoplay
  startAutoPlay();
}
