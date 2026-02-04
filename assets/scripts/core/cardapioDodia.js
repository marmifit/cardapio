/**
 * Objeto global para gerenciar as funções do Cardápio do Dia
 * Compatível com o sistema de carrinho existente
 */

const cardapioDodia = {
  itens: {},

  setItens(itens = []) {
    this.itens = itens.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  },

  aumentarQuantidade(id) {
    const element = document.getElementById(`qntd-${id}`);
    if (!element) return;
    let qntdAtual = parseInt(element.textContent) || 0;
    element.textContent = qntdAtual + 1;
  },

  diminuirQuantidade(id) {
    const element = document.getElementById(`qntd-${id}`);
    if (!element) return;
    let qntdAtual = parseInt(element.textContent) || 0;
    if (qntdAtual > 0) {
      element.textContent = qntdAtual - 1;
    }
  },

  adicionarAoCarrinho(id) {
    const qntdElement = document.getElementById(`qntd-${id}`);
    if (!qntdElement) return;

    const qntd = parseInt(qntdElement.textContent) || 0;

    if (qntd <= 0) {
      if (typeof cardapio !== "undefined" && cardapio.metodos) {
        cardapio.metodos.mensagem("Selecione uma quantidade", "red");
      }
      return;
    }

    const itemBase = this.itens[id];
    if (!itemBase) {
      if (typeof cardapio !== "undefined" && cardapio.metodos) {
        cardapio.metodos.mensagem("Item não encontrado", "red");
      }
      return;
    }

    const precoNum = parseFloat(itemBase.preco?.toString().replace(",", ".")) || 0;

    const item = {
      id: itemBase.id,
      name: itemBase.nome,
      price: precoNum,
      img: itemBase.imagem,
      qntd: qntd,
      dsc: itemBase.descricao || "",
      obs: itemBase.obs || [],
      peso: itemBase.peso || "",
      kcal: itemBase.kcal || "",
    };

    if (typeof meuCarrinho !== "undefined") {
      let existe = meuCarrinho.find((elem) => elem.id === id);

      if (existe) {
        existe.qntd += qntd;
      } else {
        meuCarrinho.push(item);
      }

      qntdElement.textContent = "0";

      // Dispara evento AddToCart com dados dinâmicos do Cardápio do Dia
      if (typeof cardapio !== "undefined" && typeof cardapio.metodos.trackPixelEvent === "function") {
        cardapio.metodos.trackPixelEvent("AddToCart", {
          content_name: itemBase.nome,
          content_ids: [id],
          content_type: "product",
          content_category: "cardapio-do-dia",
          contents: [{ id: id, quantity: qntd, item_price: precoNum }],
          value: precoNum * qntd,
          currency: "BRL",
          num_items: qntd,
        });
      }

      if (typeof cardapio !== "undefined" && cardapio.metodos) {
        cardapio.metodos.mensagem("Item adicionado ao carrinho", "green");
        cardapio.metodos.atualizarBadgeTotal();
      }
    }
  },
};
