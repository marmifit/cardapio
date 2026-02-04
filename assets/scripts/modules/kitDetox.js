export default function initKitDetox() {
  const menuKitDetox = document.getElementById("menu-kitDetox");
  const cardsContainer = document.querySelector("[data-cards]");
  const categoriesContainer = document.querySelector("[data-categories]");
  const verMaisButton = document.getElementById("vermais");

  if (!menuKitDetox || !cardsContainer) {
    return;
  }

  const parseDescription = (text = "") => {
    const parts = text.split(":");
    const lead = parts[0] ? parts[0].trim() : "";

    if (parts.length < 2) {
      return { lead: text.trim(), items: [], extra: "" };
    }

    const rest = parts.slice(1).join(":").trim();
    const [itemsPart, extraPart] = rest.split("Ideal");
    const items = (itemsPart || "")
      .split(",")
      .map((item) => item.replace(".", "").trim())
      .filter(Boolean);

    const extra = extraPart ? `Ideal${extraPart}`.trim() : "";

    return { lead, items, extra };
  };

  const renderKitDetox = () => {
    console.log("renderKitDetox chamado!");

    if (typeof MENU === "undefined" || !MENU.kitDetox || !MENU.kitDetox.length) {
      console.log("MENU.kitDetox não encontrado!");
      return;
    }

    // Aplica a classe ANTES de renderizar
    cardsContainer.classList.add("kit-detox-cards");
    console.log("Classe kit-detox-cards aplicada!");

    const item = MENU.kitDetox[0];
    const price = item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const { lead, items, extra } = parseDescription(item.dsc);

    const listItems = items.map((info) => `<li>${info}</li>`).join("");

    const obsTags = (item.obs || []).map((obs) => `<span class="kit-detox__tag">${obs}</span>`).join("");

    cardsContainer.innerHTML = `
      <div class="kit-detox shadow-12dp" data-kit-detox>
        <div class="kit-detox__grid">
          <div class="kit-detox__media">
            <img src="${item.img}" alt="${item.name}" loading="lazy" />
            <span class="kit-detox__badge">⭐ Mais Vendido</span>
          </div>

          <div class="kit-detox__panel">
            <div class="kit-detox__info">
              <div class="kit-detox__header">
                <h3>${item.name}</h3>
                <span class="kit-detox__price">${price}</span>
              </div>
              <p class="kit-detox__lead">${lead}</p>
              ${listItems ? `<ul class="kit-detox__list">${listItems}</ul>` : ""}
              <div class="kit-detox__meta">
                <span class="kit-detox__meta-item">Peso: ${item.peso}</span>
                <span class="kit-detox__meta-item">Kcal: ${item.kcal}</span>
              </div>
              <div class="kit-detox__tags">${obsTags}</div>
              ${extra ? `<p class="kit-detox__extra">${extra}</p>` : ""}
            </div>

            <div class="kit-detox__actions">
              <div class="add-to-cart kit-detox-variant">
                <div class="add-to-cart__buttons">
                  <span class="add-menos" onclick="cardapio.metodos.diminuirQuantidade('${item.id}')">
                    <i class="fas fa-minus"></i>
                  </span>
                  <span class="add-numero-items" id="qntd-${item.id}">0</span>
                  <span class="add-mais" onclick="cardapio.metodos.aumentarQuantidade('${item.id}')">
                    <i class="fas fa-plus"></i>
                  </span>
                </div>
              </div>

              <div class="btn-add-box kit-detox-cta">
                <span class="btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('${item.id}')">
                  <a>Adicionar ao Carrinho</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    cardsContainer.classList.add("kit-detox-cards");

    if (verMaisButton) {
      verMaisButton.classList.add("hidden");
    }
  };

  const isKitDetoxActive = () => menuKitDetox.classList.contains("ativo");

  // Escuta evento customizado disparado pelo cardapio.js
  window.addEventListener("renderKitDetox", () => {
    requestAnimationFrame(renderKitDetox);
  });

  menuKitDetox.addEventListener("click", () => {
    setTimeout(() => {
      requestAnimationFrame(renderKitDetox);
    }, 50);
  });

  if (verMaisButton) {
    verMaisButton.addEventListener("click", () => {
      if (isKitDetoxActive()) {
        requestAnimationFrame(renderKitDetox);
      }
    });
  }

  if (categoriesContainer) {
    categoriesContainer.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) {
        return;
      }

      if (link.id !== "menu-kitDetox") {
        cardsContainer.classList.remove("kit-detox-cards");
      }
    });
  }

  if (isKitDetoxActive()) {
    renderKitDetox();
  }
}
