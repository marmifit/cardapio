$(document).ready(function () {
  cardapio.metodos.init();
  cardapio.metodos.obterItensCardapio();
  cardapio.metodos.aumentarQuantidade();
  cardapio.metodos.diminuirQuantidade();
  cardapio.metodos.diminuirQuantidade();
  cardapio.metodos.adicionarAoCarrinho();
  cardapio.metodos.atualizarBadgeTotal();
  cardapio.metodos.carregarEtapa();
});

var cardapio = {};

var meuCarrinho = [];

var meuEndereco = null;

var meuPagamento = null;

var valorCarrinho = 0;

var valorEntrega = 5;

var celularEmpresa = "5588999834281";

cardapio.metodos = {
  init: () => {
    console.log("iniciou");

    cardapio.metodos.obterItensCardapio();
    cardapio.metodos.carregarBotaoReserva();
    cardapio.metodos.carregarBotaoLigar();
    cardapio.metodos.initPagamento();
    cardapio.metodos.initValidacaoEndereco();
    cardapio.metodos.initMascaraCep();
  },

  obterItensCardapio: (categoria = "aves", vermais = false) => {
    // Kit Detox tem renderização especial, delega para o módulo
    if (categoria === "kitDetox") {
      $(".categories ul li a").removeClass("ativo");
      $("#menu-kitDetox").addClass("ativo");
      // Dispara evento customizado para o módulo Kit Detox
      window.dispatchEvent(new CustomEvent("renderKitDetox"));
      return;
    }

    var filtro = MENU[categoria];

    if (!vermais) {
      $("[data-cards]").html("");

      // Só mostra o botão "Ver mais" se a categoria tiver mais de 8 itens
      if (filtro.length > 8) {
        $("#vermais").removeClass("hidden");
      } else {
        $("#vermais").addClass("hidden");
      }
    }

    $.each(filtro, (i, e) => {
      let price = e.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      let obs = e.obs.map((tag) => `<span class="obs-tag">${tag}</span>`).join("");

      let temp = cardapio.templates.item
        .replace(/\${img}/g, e.img)
        .replace(/\${name}/g, e.name)
        .replace(/\${dsc}/g, e.dsc)
        .replace(/\${price}/g, price)
        .replace(/\${obs}/g, obs)
        .replace(/\${peso}/g, e.peso)
        .replace(/\${kcal}/g, e.kcal)
        .replace(/\${id}/g, e.id);

      // Clicou em ver mais (+ 4 itens)

      if (vermais && i >= 8 && i < 12) {
        $("[data-cards]").append(temp);
      }

      // Paginação inicial (8 itens)

      if (!vermais && i < 8) {
        $("[data-cards]").append(temp);
      }
    });

    $(".categories ul li a").removeClass("ativo");

    $("#menu-" + categoria).addClass("ativo");
  },

  trackPixelEvent: (event, payload = {}) => {
    if (typeof fbq === "function") {
      fbq("track", event, payload);
    }
  },

  // Clique no botão de Ver mais
  verMais: () => {
    var ativo = $(".categories ul li a.ativo").attr("id").split("menu-")[1];
    cardapio.metodos.obterItensCardapio(ativo, true);

    $("#vermais").addClass("hidden");
  },

  aumentarQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());
    $("#qntd-" + id).text(qntdAtual + 1);
  },

  diminuirQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      $("#qntd-" + id).text(qntdAtual - 1);
    }
  },

  // Adicionar o item ao carrinho
  adicionarAoCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      // Obter a categoria Ativa
      let categoriaElement = $(".categories ul li a.ativo").attr("id");
      if (!categoriaElement) {
        cardapio.metodos.mensagem("Erro: nenhuma categoria selecionada", "red");
        return;
      }
      let categoria = categoriaElement.split("menu-")[1];

      //obtem a lista de itens

      let filtro = MENU[categoria];

      //obtem o item

      let item = $.grep(filtro, (e, i) => {
        return e.id == id;
      });

      if (item.length > 0) {
        // validar se já existe esse item no carrinho

        let existe = $.grep(meuCarrinho, (elem, index) => {
          return elem.id == id;
        });

        // caso já exista o item no carrinho, só altera a quantidade

        if (existe.length > 0) {
          let objIndex = meuCarrinho.findIndex((obj) => obj.id == id);
          meuCarrinho[objIndex].qntd = meuCarrinho[objIndex].qntd + qntdAtual;
        }

        // caso ainda não exista o item no carrinho, adiciona ele
        else {
          item[0].qntd = qntdAtual;
          meuCarrinho.push(item[0]);
        }

        // Dispara evento AddToCart com dados dinâmicos enriquecidos
        const categoriaAtiva = $(".categories ul li a.ativo").attr("id")?.split("menu-")[1] || "geral";
        cardapio.metodos.trackPixelEvent("AddToCart", {
          content_name: item[0].name,
          content_ids: [item[0].id],
          content_type: "product",
          content_category: categoriaAtiva,
          contents: [{ id: item[0].id, quantity: qntdAtual, item_price: item[0].price }],
          value: item[0].price * qntdAtual,
          currency: "BRL",
          num_items: qntdAtual,
        });

        // alert("Item adicionado ao carrinho");
        cardapio.metodos.mensagem("Item adicionado ao carrinho", "green");
        $("#qntd-" + id).text(0);

        cardapio.metodos.atualizarBadgeTotal();
      }
    }
  },

  // Atualiza o badge de total dos botões de carrinho
  atualizarBadgeTotal: () => {
    var total = 0;
    $.each(meuCarrinho, (i, e) => {
      total += e.qntd;
    });

    if (total > 0) {
      $(".btn-cart").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    } else {
      $(".btn-cart").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }

    $(".badge-total").html(total);
  },

  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("[data-modal='modal']").removeClass("hidden");
      cardapio.metodos.carregarCarrinho();
      document.body.style.overflow = "hidden";
    } else {
      $("[data-modal='modal']").addClass("hidden");
      document.body.style.overflow = "auto";
    }
  },

  carregarEtapa: (etapa) => {
    if (etapa == 1) {
      // etapas
      $(".line").removeClass("checked");
      $(".etapa").removeClass("checked");
      $(".etapa1").addClass("checked");

      // titulo
      $("[data-modal='titulo-etapas'] h4").text("Seu Carrinho:");

      // containers
      $(".products-container").removeClass("hidden");

      $(".local-entrega ").addClass("hidden");
      $("[data-modal='pagamento']").addClass("hidden");
      $(".resumo-pedido").addClass("hidden");
      $("[data-modal='resumo-endereco']").addClass("hidden");
      $("[data-modal='resumo-pagamento']").addClass("hidden");

      // botoes
      $("[data-modal='btn-continuar']").removeClass("hidden");

      $("[data-modal='btn-enviar']").addClass("hidden");
      $("[data-modal='btn-revisar']").addClass("hidden");
      $("[data-modal='btn-pagamento']").addClass("hidden");
      $("[data-modal='btn-voltar']").addClass("hidden");
    }

    if (etapa == 2) {
      // etapas
      $(".etapa").removeClass("checked");
      $(".line").removeClass("checked");

      $(".etapa1").addClass("checked");
      $(".etapa2").addClass("checked");
      $(".line1").addClass("checked");

      // titulo

      $("[data-modal='titulo-etapas'] h4").text("Endereço de Entrega:");

      // containers

      $("[data-modal='products']").addClass("hidden");
      $("[data-modal='resumo']").addClass("hidden");
      $("[data-modal='resumo-endereco']").addClass("hidden");
      $("[data-modal='resumo-pagamento']").addClass("hidden");
      $("[data-modal='pagamento']").addClass("hidden");
      $("[data-modal='entrega']").removeClass("hidden");
      //botoes

      $("[data-modal='btn-revisar']").removeClass("hidden");
      $("[data-modal='btn-voltar']").removeClass("hidden");

      $("[data-modal='btn-continuar']").addClass("hidden");
      $("[data-modal='btn-pagamento']").addClass("hidden");
      $("[data-modal='btn-enviar']").addClass("hidden");
    }

    if (etapa == 3) {
      // etapas
      $(".line").removeClass("checked");
      $(".etapa").removeClass("checked");

      $(".etapa1").addClass("checked");
      $(".line1").addClass("checked");

      $(".etapa2").addClass("checked");
      $(".line2").addClass("checked");

      $(".etapa3").addClass("checked");
      // titulo

      $("[data-modal='titulo-etapas'] h4").text("Forma de Pagamento:");

      // containers

      $("[data-modal='products']").addClass("hidden");
      $("[data-modal='entrega']").addClass("hidden");
      $("[data-modal='resumo']").addClass("hidden");
      $("[data-modal='resumo-endereco']").addClass("hidden");
      $("[data-modal='resumo-pagamento']").addClass("hidden");
      $("[data-modal='pagamento']").removeClass("hidden");

      const tipoPagamento = $("input[name='tipo-pagamento']:checked").val();
      if (tipoPagamento === "online") {
        $("[data-pagamento-online]").removeClass("hidden");
        $("[data-pagamento-entrega]").addClass("hidden");
        $("[data-pagamento-troco]").addClass("hidden");
        $("[data-pagamento-troco-valor]").addClass("hidden");
      }

      if (tipoPagamento === "entrega") {
        $("[data-pagamento-online]").addClass("hidden");
        $("[data-pagamento-entrega]").removeClass("hidden");
        const opcaoEntrega = $("input[name='pagamento-entrega-opcao']:checked").val();
        if (opcaoEntrega === "dinheiro") {
          $("[data-pagamento-troco]").removeClass("hidden");
          const precisaTroco = $("input[name='troco-opcao']:checked").val();
          if (precisaTroco === "sim") {
            $("[data-pagamento-troco-valor]").removeClass("hidden");
          }
        }
      }

      //botoes

      $("[data-modal='btn-pagamento']").removeClass("hidden");
      $("[data-modal='btn-voltar']").removeClass("hidden");

      $("[data-modal='btn-continuar']").addClass("hidden");
      $("[data-modal='btn-revisar']").addClass("hidden");
      $("[data-modal='btn-enviar']").addClass("hidden");
    }

    if (etapa == 4) {
      // etapas
      $(".line").removeClass("checked");

      $(".etapa1").addClass("checked");
      $(".line1").addClass("checked");

      $(".etapa2").addClass("checked");
      $(".line2").addClass("checked");

      $(".etapa3").addClass("checked");
      $(".line3").addClass("checked");

      $(".etapa4").addClass("checked");

      // titulo

      $("[data-modal='titulo-etapas'] h4").text("Itens do Pedido:");

      // containers

      $("[data-modal='products']").addClass("hidden");
      $("[data-modal='entrega']").addClass("hidden");
      $("[data-modal='pagamento']").addClass("hidden");
      $("[data-modal='resumo']").removeClass("hidden");
      $("[data-modal='resumo-endereco']").removeClass("hidden");
      $("[data-modal='resumo-pagamento']").removeClass("hidden");

      //botoes

      $("[data-modal='btn-enviar']").removeClass("hidden");
      $("[data-modal='btn-voltar']").removeClass("hidden");

      $("[data-modal='btn-continuar']").addClass("hidden");
      $("[data-modal='btn-revisar']").addClass("hidden");
      $("[data-modal='btn-pagamento']").addClass("hidden");
    }
  },

  voltarEtapa: () => {
    let etapa = $(".etapa.checked").length;
    cardapio.metodos.carregarEtapa(etapa - 1);
  },

  // Carrega lista de itens do carrinho

  carregarCarrinho: () => {
    cardapio.metodos.carregarEtapa(1);

    if (meuCarrinho.length > 0) {
      $(".products-container").html("");
      $(".products-container").css({
        "justify-content": "flex-start",
        "border-bottom": "none",
      });

      $.each(meuCarrinho, (i, e) => {
        let price = e.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        let temp = cardapio.templates.itemCarrinho
          .replace(/\${img}/g, e.img)
          .replace(/\${name}/g, e.name)
          .replace(/\${price}/g, price)
          .replace(/\${id}/g, e.id)
          .replace(/\${qntd}/g, e.qntd);
        $(".products-container").append(temp);

        // último item

        if (i + 1 == meuCarrinho.length) {
          cardapio.metodos.carregarValores();
        }
      });
    } else {
      $(".products-container").html(
        '<p class="carrinho-vazio" style="justify-self:center;"><i class="fa fa-shopping-bag"></i> Seu Carrinho está vazio</p>',
      );

      $(".products-container").css({
        "justify-content": "center",
        "border-bottom": "1px solid rgb(231, 231, 231)",
      });
      cardapio.metodos.carregarValores();
    }
  },

  // Diminuir quantidade do item no carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },

  aumentarQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
  },

  // botao remover item do carrinho

  removerItemCarrinho: (id) => {
    meuCarrinho = $.grep(meuCarrinho, (e, i) => {
      return e.id != id;
    });
    cardapio.metodos.carregarCarrinho();
    // Atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();
  },

  // Atualiza o carrinho com a quantidade atual
  atualizarCarrinho: (id, qntd) => {
    let objIndex = meuCarrinho.findIndex((obj) => obj.id == id);
    meuCarrinho[objIndex].qntd = qntd;

    // Atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();

    // Atualiza os valores (R$) totais do carrinho
    cardapio.metodos.carregarValores();
  },

  // carrega os valores de subtotal e total
  carregarValores: () => {
    valorCarrinho = 0;

    $("#valorSubtotal").text("R$ 0,00");
    $("#valorEntrega").text("R$ + 0,00");
    $("#valorTotal").text("R$ 0,00");

    $.each(meuCarrinho, (i, e) => {
      valorCarrinho += parseFloat(e.price * e.qntd);
      if (i + 1 == meuCarrinho.length) {
        $("#valorSubtotal").text(`${valorCarrinho.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`);
        $("#valorEntrega").text(`+ ${valorEntrega.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`);
        $("#valorTotal").text(
          `${(valorCarrinho + valorEntrega).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`,
        );
      }
    });
  },

  // Carrega a etapa endereços
  carregarEndereco: () => {
    if (meuCarrinho.length <= 0) {
      cardapio.metodos.mensagem("Seu carrinho está vazio");
      return;
    }

    // Dispara InitiateCheckout quando avança para etapa de endereço
    const contents = meuCarrinho.map((e) => ({
      id: e.id,
      quantity: e.qntd,
      item_price: e.price,
    }));

    const totalItems = meuCarrinho.reduce((sum, e) => sum + e.qntd, 0);

    cardapio.metodos.trackPixelEvent("InitiateCheckout", {
      content_type: "product",
      contents,
      value: valorCarrinho + valorEntrega,
      currency: "BRL",
      num_items: totalItems,
    });

    cardapio.metodos.carregarEtapa(2);
  },
  // API Via Cep
  buscarCep: () => {
    // Cria a variável com o valor do cep
    var cep = $("#cep").val().trim().replace(/\D/g, "");

    // Verifica se o CEP possui valor informado
    if (cep != "") {
      // Expressão regular para validar CEP
      var validarCep = /^[0-9]{8}$/;

      if (validarCep.test(cep)) {
        // Mostrar loader
        $("#cep-loader").removeClass("hidden");

        $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {
          // Ocultar loader
          $("#cep-loader").addClass("hidden");

          if (!("erro" in dados)) {
            // Atualiza os campos com os valores retornados

            const logradouro = dados.logradouro ? dados.logradouro.trim() : "";
            $("#endereco-entrega").val(logradouro);
            $("#bairro").val(dados.bairro);
            $("#cidade").val(dados.localidade);
            $("#uf").val(dados.uf);

            if (!logradouro) {
              cardapio.metodos.mensagem("CEP sem endereço informado. Preencha o endereço manualmente.", "info");
              $("#endereco-entrega").focus();
            } else {
              $("#numero").focus();
            }
          } else {
            cardapio.metodos.mensagem("CEP Não Encontrado. Preencha as informações manualmente.");
            $("#endereco-entrega").focus();
          }
        }).fail(function () {
          // Ocultar loader em caso de erro
          $("#cep-loader").addClass("hidden");
          cardapio.metodos.mensagem("Erro ao buscar CEP. Tente novamente.", "red");
        });
      } else {
        cardapio.metodos.mensagem("Formato do CEP inválido.");
        $("#cep").focus();
      }
    } else {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#cep").focus();
    }
  },
  // Validação Antes de prosseguir para a etapa 3
  resumoPedido: () => {
    let cep = $("#cep").val().trim();
    let endereco = $("#endereco-entrega").val().trim();
    let bairro = $("#bairro").val().trim();
    let cidade = $("#cidade").val().trim();
    let uf = $("#uf").val().trim();
    let numero = $("#numero").val().trim();
    let complemento = $("#complemento").val().trim();

    const camposObrigatorios = [
      { selector: "#endereco-entrega", valor: endereco },
      { selector: "#bairro", valor: bairro },
      { selector: "#cidade", valor: cidade },
      { selector: "#numero", valor: numero },
    ];

    camposObrigatorios.forEach((campo) => {
      if (!campo.valor) {
        $(campo.selector).addClass("input-erro");
      } else {
        $(campo.selector).removeClass("input-erro");
      }
    });

    if (cep.length <= 0) {
      cardapio.metodos.mensagem("Informe o CEP por favor");
      $("#cep").focus();
      return;
    }

    if (endereco.length <= 0 || bairro.length <= 0 || cidade.length <= 0 || numero.length <= 0) {
      cardapio.metodos.mensagem("Preencha Endereço, Bairro, Cidade e Número para continuar.");
      if (endereco.length <= 0) {
        $("#endereco-entrega").focus();
      } else if (bairro.length <= 0) {
        $("#bairro").focus();
      } else if (cidade.length <= 0) {
        $("#cidade").focus();
      } else {
        $("#numero").focus();
      }
      return;
    }

    if (uf == -1) {
      cardapio.metodos.mensagem("Informe o UF por favor");
      $("#uf").focus();
      return;
    }

    meuEndereco = {
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      cidade: cidade,
      uf: uf,
      numero: numero,
      complemento: complemento,
    };

    cardapio.metodos.carregarEtapa(3);
  },

  initValidacaoEndereco: () => {
    $(document).on("input", "#endereco-entrega, #bairro, #cidade, #numero", function () {
      if ($(this).val().trim().length > 0) {
        $(this).removeClass("input-erro");
      }
    });
  },

  // Inicializa a máscara de CEP e busca automática
  initMascaraCep: () => {
    $(document).on("input", "#cep", function (e) {
      let valor = $(this).val().replace(/\D/g, ""); // Remove tudo que não é dígito

      // Aplica a máscara 00000-000
      if (valor.length > 5) {
        valor = valor.substring(0, 5) + "-" + valor.substring(5, 8);
      }

      $(this).val(valor);

      // Remove o erro visual se houver
      $(this).removeClass("input-erro");

      // Busca automática quando completar 9 caracteres (00000-000)
      if (valor.length === 9) {
        cardapio.metodos.buscarCep();
      }
    });

    // Permitir apenas números e hífen
    $(document).on("keypress", "#cep", function (e) {
      const charCode = e.which || e.keyCode;
      const charStr = String.fromCharCode(charCode);

      // Permite apenas números
      if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
        return false;
      }
    });
  },

  initPagamento: () => {
    const atualizarVisibilidadePagamento = () => {
      const tipo = $("input[name='tipo-pagamento']:checked").val();

      if (tipo === "online") {
        $("[data-pagamento-online]").removeClass("hidden");
        $("[data-pagamento-entrega]").addClass("hidden");
        $("[data-pagamento-troco]").addClass("hidden");
        $("[data-pagamento-troco-valor]").addClass("hidden");
        $("input[name='pagamento-online-opcao']").prop("checked", true);
        $("input[name='pagamento-entrega-opcao']").prop("checked", false);
      }

      if (tipo === "entrega") {
        $("[data-pagamento-online]").addClass("hidden");
        $("[data-pagamento-entrega]").removeClass("hidden");
      }
    };

    $(document).on("change", "input[name='tipo-pagamento']", () => {
      atualizarVisibilidadePagamento();
    });

    $(document).on("change", "input[name='pagamento-entrega-opcao']", function () {
      const opcao = $(this).val();
      if (opcao === "dinheiro") {
        $("[data-pagamento-troco]").removeClass("hidden");
      } else {
        $("[data-pagamento-troco]").addClass("hidden");
        $("[data-pagamento-troco-valor]").addClass("hidden");
        $("input[name='troco-opcao'][value='nao']").prop("checked", true);
        $("#troco-para").val("");
      }
    });

    $(document).on("change", "input[name='troco-opcao']", function () {
      const precisa = $(this).val();
      if (precisa === "sim") {
        $("[data-pagamento-troco-valor]").removeClass("hidden");
      } else {
        $("[data-pagamento-troco-valor]").addClass("hidden");
        $("#troco-para").val("");
      }
    });
  },

  validarPagamento: () => {
    const tipo = $("input[name='tipo-pagamento']:checked").val();

    if (!tipo) {
      cardapio.metodos.mensagem("Selecione a forma de pagamento.");
      return;
    }

    let descricao = "";
    let opcao = "";
    let troco = null;
    let trocoPara = null;

    if (tipo === "online") {
      opcao = $("input[name='pagamento-online-opcao']:checked").val();
      if (!opcao) {
        cardapio.metodos.mensagem("Selecione a opção Pix.");
        return;
      }
      descricao = "Pagamento online: Pix";
    }

    if (tipo === "entrega") {
      opcao = $("input[name='pagamento-entrega-opcao']:checked").val();
      if (!opcao) {
        cardapio.metodos.mensagem("Selecione cartão ou dinheiro.");
        return;
      }

      if (opcao === "cartao") {
        descricao = "Pagamento na entrega: Cartão";
      }

      if (opcao === "dinheiro") {
        troco = $("input[name='troco-opcao']:checked").val();
        if (troco === "sim") {
          const valorTroco = $("#troco-para").val().trim();
          if (!valorTroco || parseFloat(valorTroco) <= 0) {
            cardapio.metodos.mensagem("Informe o valor para troco.");
            return;
          }
          trocoPara = parseFloat(valorTroco.replace(",", "."));
          const trocoFormatado = trocoPara.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          descricao = `Pagamento na entrega: Dinheiro (troco para ${trocoFormatado})`;
        } else {
          descricao = "Pagamento na entrega: Dinheiro";
        }
      }
    }

    meuPagamento = {
      tipo,
      opcao,
      troco,
      trocoPara,
      descricao,
    };

    cardapio.metodos.carregarEtapa(4);
    cardapio.metodos.carregarResumo();
  },

  // Carrega a etapa de resumo do pedido
  carregarResumo: () => {
    $(".resumo-pedido").html("");

    $.each(meuCarrinho, (i, e) => {
      let price = e.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      let temp = cardapio.templates.itemResumo
        .replace(/\${img}/g, e.img)
        .replace(/\${name}/g, e.name)
        .replace(/\${price}/g, price)
        .replace(/\${qntd}/g, e.qntd);
      $(".resumo-pedido").append(temp);
    });

    $(".nome-endereco").html(`${meuEndereco.endereco}, ${meuEndereco.numero}, ${meuEndereco.bairro} `);
    $(".nome-localidade").html(
      `${meuEndereco.cidade}-${meuEndereco.uf} / ${meuEndereco.cep}.  ${meuEndereco.complemento}.`,
    );

    if (meuPagamento?.descricao) {
      $("[data-resumo-pagamento]").text(meuPagamento.descricao);
    } else {
      $("[data-resumo-pagamento]").text("Não informado");
    }

    cardapio.metodos.finalizarPedido();
  },

  finalizarPedido: () => {
    if (meuCarrinho.length > 0 && meuEndereco != null) {
      var texto = "Olá! gostaria de fazer um pedido:";
      texto += `\n*Itens do pedido:*\n\n\${itens}`;
      texto += "\n*Endereço de entrega:*";
      texto += `\n${meuEndereco.endereco}, ${meuEndereco.numero}, ${meuEndereco.bairro}`;
      texto += `\n${meuEndereco.cidade}-${meuEndereco.uf} / ${meuEndereco.cep} ${meuEndereco.complemento}`;
      if (meuPagamento?.descricao) {
        texto += `\n\n*Forma de pagamento:* ${meuPagamento.descricao}`;
      } else {
        texto += "\n\n*Forma de pagamento:* Não informado";
      }
      texto += `\n\n*Total (com entrega): ${(valorCarrinho + valorEntrega).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}*`;

      var itens = "";

      $.each(meuCarrinho, (i, e) => {
        itens += `*${e.qntd}x* ${e.name} ...... R$ ${e.price.toFixed(2).replace(".", ",")}\n`;

        // ultimo item
        if (i + 1 == meuCarrinho.length) {
          // converter URL
          texto = texto.replace(/\${itens}/g, itens);
          let encode = encodeURI(texto);
          let URL = `https://wa.me/${celularEmpresa}?text=${encode}`;

          $("#enviarPedido").attr("href", URL);
        }
      });
    }
  },

  finalizarEnvio: () => {
    // Dispara Purchase com dados dinâmicos do carrinho
    const total = valorCarrinho + valorEntrega;
    const contents = meuCarrinho.map((e) => ({
      id: e.id,
      quantity: e.qntd,
      item_price: e.price,
    }));

    const totalItems = meuCarrinho.reduce((sum, e) => sum + e.qntd, 0);
    // Gera um order_id único baseado em timestamp
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    cardapio.metodos.trackPixelEvent("Purchase", {
      content_type: "product",
      contents,
      value: total,
      currency: "BRL",
      num_items: totalItems,
      content_ids: contents.map((c) => c.id),
      order_id: orderId,
    });

    // Mostrar modal de sucesso com timer
    cardapio.metodos.mostrarModalSucesso();
  },

  mostrarModalSucesso: () => {
    const modal = $("#modal-sucesso");
    const timerElement = $("#timer-contador");
    let tempoRestante = 3;

    // Mostrar modal
    modal.removeClass("hidden");
    timerElement.text(tempoRestante);

    // Timer que decrementa
    const interval = setInterval(() => {
      tempoRestante--;
      timerElement.text(tempoRestante);

      if (tempoRestante <= 0) {
        clearInterval(interval);
        // Chamar função para ir para WhatsApp após o timer acabar
        cardapio.metodos.irParaWhatsapp();
      }
    }, 1000);

    // Armazenar o interval no modal para poder limpar se necessário
    modal.data("timer-interval", interval);
  },

  irParaWhatsapp: () => {
    // Limpar o timer se ainda estiver rodando
    const modal = $("#modal-sucesso");
    const interval = modal.data("timer-interval");
    if (interval) {
      clearInterval(interval);
    }

    // Obter a URL do link enviarPedido que já foi preparada
    const linkWhatsapp = $("#enviarPedido").attr("href");

    // Limpar carrinho
    meuCarrinho = [];
    meuEndereco = null;
    valorCarrinho = 0;
    meuPagamento = null;

    // Limpar localStorage
    localStorage.removeItem("meuCarrinho");
    localStorage.removeItem("meuEndereco");
    localStorage.removeItem("valorCarrinho");

    // Limpar campos do formulário
    $("#cep").val("");
    $("#endereco-entrega").val("");
    $("#bairro").val("");
    $("#cidade").val("");
    $("#uf").val("");
    $("#numero").val("");
    $("#complemento").val("");
    $("input[name='tipo-pagamento']").prop("checked", false);
    $("input[name='pagamento-online-opcao']").prop("checked", false);
    $("input[name='pagamento-entrega-opcao']").prop("checked", false);
    $("input[name='troco-opcao'][value='nao']").prop("checked", true);
    $("#troco-para").val("");

    // Atualizar badge
    cardapio.metodos.atualizarBadgeTotal();

    // Fechar modal sem exibir mensagem de cancelamento
    cardapio.metodos.fecharModalSucesso(false);

    // Abrir WhatsApp após pequeno delay
    setTimeout(() => {
      window.open(linkWhatsapp, "_blank");
    }, 300);
  },

  fecharModalSucesso: (mostrarMensagemCancelamento = true) => {
    const modal = $("#modal-sucesso");
    const interval = modal.data("timer-interval");

    // Limpar timer se ainda estiver rodando
    if (interval) {
      clearInterval(interval);
    }

    // Limpar carrinho
    meuCarrinho = [];
    meuEndereco = null;
    valorCarrinho = 0;
    meuPagamento = null;

    // Limpar localStorage
    localStorage.removeItem("meuCarrinho");
    localStorage.removeItem("meuEndereco");
    localStorage.removeItem("valorCarrinho");

    // Limpar campos do formulário
    $("#cep").val("");
    $("#endereco-entrega").val("");
    $("#bairro").val("");
    $("#cidade").val("");
    $("#uf").val("");
    $("#numero").val("");
    $("#complemento").val("");
    $("input[name='tipo-pagamento']").prop("checked", false);
    $("input[name='pagamento-online-opcao']").prop("checked", false);
    $("input[name='pagamento-entrega-opcao']").prop("checked", false);
    $("input[name='troco-opcao'][value='nao']").prop("checked", true);
    $("#troco-para").val("");

    // Atualizar badge
    cardapio.metodos.atualizarBadgeTotal();

    // Fechar modal
    modal.addClass("hidden");

    // Fechar modal do carrinho também
    cardapio.metodos.abrirCarrinho(false);

    // Mostrar mensagem apenas se o usuário realmente cancelou
    if (mostrarMensagemCancelamento) {
      cardapio.metodos.mensagem("Pedido cancelado. Seu carrinho foi limpo.", "info", 3000);
    }
  },

  carregarBotaoReserva: () => {
    var texto = "Olá, gostaria de fazer uma *Reserva*";
    let encode = encodeURI(texto);
    let URL = `https://wa.me/${celularEmpresa}?text=${encode}`;

    $("#btnReserva").attr("href", URL);
  },

  carregarBotaoLigar: () => {
    var texto = "Olá! Gostaria de informações sobre os produtos ou serviços da marmifit.";
    let encode = encodeURI(texto);
    let URL = `https://wa.me/${celularEmpresa}?text=${encode}`;
    $("#btnLigar").attr("href", URL);
    $("#btnLigar").attr("target", "_blank");
  },

  mensagem: (texto, cor = "red", tempo = 3000) => {
    let id = Math.floor(Date.now() * Math.random()).toString();

    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;
    $(".container-mensagens").append(msg);

    setTimeout(() => {
      $("#msg-" + id).removeClass("fadeInDown");
      $("#msg-" + id).addClass("fadeOutUp");

      setTimeout(() => {
        $("#msg-" + id).remove();
      }, 800);
    }, tempo);
  },
};

cardapio.templates = {
  item: `<div class="box animar">
 <div class="cards__item shadow-8dp" id="\${id}">
 <div class="cards__item__image">
   <img
     src="\${img}"
     alt=""
   />
 </div>

 <div class="cards__item__content">
   <div class="cards__item__content__text">
     <h3>\${name}</h3>
     <p>\${dsc}</p>
     <span class="kcal-peso">\${kcal}kcal | \${peso}</span>
     <div class="obs-container">\${obs}</div>
     
     
     <span>\${price}</span>
   </div>

   <div class="add-to-cart">
     <div class="add-to-cart__buttons">
       <span class="add-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')" ><i class="fas fa-minus"></i></span>
       <span class="add-numero-items" id="qntd-\${id}">0</span>
       <span class="add-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')" ><i class="fas fa-plus"></i></span>
     </div>

     <div class="btn-add-box">
       <span class="btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"
        ><a ><i class="fa fa-shopping-bag"></i><span class="btn-add-text">Adicionar</span></a
       ></span>
     </div>
   </div>
 </div>
</div>
</div>`,

  itemCarrinho: `   <div class="cart__product">
                        <div class="cart__product__image">
                          <img src="\${img}" alt="">
                          <div class=" cart__product__price">
                          <h3>\${name}</h3>
                          <span>\${price}</span>
                          </div>
                        </div>

                        <div class="add-to-cart add-to-cart-modal">

                          <div class="add-to-cart__buttons">
                            <span class="add-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')" >
                              <i class="fas fa-minus"></i>
                            </span>
                            <span class="add-numero-items" id="qntd-carrinho-\${id}">\${qntd}</span>
                            <span class="add-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')" >
                              <i class="fas fa-plus"></i>
                            </span>
                          </div>

                          <div class="btn-add-box add-to-cart-modal">
                            <span  onclick="cardapio.metodos.removerItemCarrinho('\${id}')">
                              <a class="btn-add">
                                <i class="fa fa-trash"></i>
                              </a>
                            </span>
                          </div>
                        </div>
                    </div>`,

  itemResumo: `
  <div class="cart__product ">
    <div class="cart__product__image ">
      <img src="\${img}" alt="">

      <div class="cart__product__price ">
        <h3>\${name}</h3>
        <span>\${price}</span>
      </div>

    </div>

    <div class="cart__product__quantity ">
      <span>X \${qntd}</span>
    </div>
  </div>
  
  `,
};

cardapio.eventos = {};
