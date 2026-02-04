/**
 * Módulo para verificar se a loja está aberta e bloquear pedidos quando fechada
 * Também atualiza o visual de "Aberto/Fechado" no top bar e footer
 */

export default function initVerificarFuncionamento() {
  // Horários específicos por dia da semana (ÚNICA FONTE DA VERDADE)
  // 0 = domingo, 1 = segunda, ..., 6 = sábado
  // Horário de fechamento: use 0 para meia-noite (00:00)
  const horariosPorDia = {
    0: null, // domingo - fechado
    1: [7, 17], // segunda: 7h às 17h
    2: [7, 17], // terça: 7h às 17h
    3: [7, 17], // quarta: 7h às 17h
    4: [7, 17], // quinta: 7h às 17h
    5: [7, 17], // sexta: 7h às 17h
    6: [8, 14], // sábado: 8h às 14h
  };

  /**
   * Retorna se a loja está aberta ou fechada
   * @returns {boolean} true se aberto, false se fechado
   */
  window.isLojaAberta = function () {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const diaSemanaAtual = agora.getDay();

    console.log(
      `🕐 Hora local do navegador: ${horaAtual}:${String(agora.getMinutes()).padStart(2, "0")} (dia ${diaSemanaAtual})`,
    );

    const horarioHoje = horariosPorDia[diaSemanaAtual];

    if (!horarioHoje) {
      console.log("❌ FECHADA - Dia sem expediente");
      return false; // Fechado
    }

    const [abertura, fechamento] = horarioHoje;

    // Se fechamento = 0, significa meia-noite (00:00 do dia seguinte)
    // Neste caso, está aberto se hora >= abertura OU hora < fechamento (0)
    let aberta;
    if (fechamento === 0) {
      // Fecha à meia-noite: aberto das Xh até 23:59
      aberta = horaAtual >= abertura;
    } else {
      // Horário normal: aberto das Xh até Yh
      aberta = horaAtual >= abertura && horaAtual < fechamento;
    }

    console.log(
      `🕐 Verificação: ${horaAtual}:${String(agora.getMinutes()).padStart(2, "0")} (dia ${diaSemanaAtual}) - ${aberta ? "✅ ABERTA" : "❌ FECHADA"}`,
    );
    return aberta;
  };

  /**
   * Obtém informações sobre o status da loja
   * @returns {object} { aberta: boolean, mensagem: string, proxima_abertura: string }
   */
  window.getStatusLoja = function () {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const diaSemanaAtual = agora.getDay();

    const diasSemana = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

    const horarioHoje = horariosPorDia[diaSemanaAtual];

    if (!horarioHoje) {
      // Fechado - próxima abertura
      let proximoDia = (diaSemanaAtual + 1) % 7;
      let proximoHorario = horariosPorDia[proximoDia];

      // Se amanhã também está fechado, procura o próximo dia aberto
      while (!proximoHorario && proximoDia !== diaSemanaAtual) {
        proximoDia = (proximoDia + 1) % 7;
        proximoHorario = horariosPorDia[proximoDia];
      }

      if (proximoHorario) {
        return {
          aberta: false,
          mensagem: `Loja fechada. Abre ${diasSemana[proximoDia]} às ${proximoHorario[0]}h`,
          proxima_abertura: `${diasSemana[proximoDia]} ${proximoHorario[0]}h`,
        };
      }

      return {
        aberta: false,
        mensagem: "Loja fechada no momento",
        proxima_abertura: null,
      };
    }

    if (horaAtual < horarioHoje[0]) {
      // Ainda não abriu hoje
      return {
        aberta: false,
        mensagem: `Loja abre hoje às ${horarioHoje[0]}h`,
        proxima_abertura: `hoje ${horarioHoje[0]}h`,
      };
    }

    // Se fechamento = 0 (meia-noite), nunca entra nesta condição durante o mesmo dia
    if (horarioHoje[1] !== 0 && horaAtual >= horarioHoje[1]) {
      // Fechou hoje
      let proximoDia = (diaSemanaAtual + 1) % 7;
      let proximoHorario = horariosPorDia[proximoDia];

      while (!proximoHorario && proximoDia !== diaSemanaAtual) {
        proximoDia = (proximoDia + 1) % 7;
        proximoHorario = horariosPorDia[proximoDia];
      }

      if (proximoHorario) {
        return {
          aberta: false,
          mensagem: `Loja fechada. Abre ${diasSemana[proximoDia]} às ${proximoHorario[0]}h`,
          proxima_abertura: `${diasSemana[proximoDia]} ${proximoHorario[0]}h`,
        };
      }

      return {
        aberta: false,
        mensagem: "Loja fechada no momento",
        proxima_abertura: null,
      };
    }

    // Loja aberta
    const horarioFechamento = horarioHoje[1] === 0 ? "00h (meia-noite)" : `${horarioHoje[1]}h`;
    return {
      aberta: true,
      mensagem: `Loja aberta até às ${horarioFechamento}`,
      proxima_abertura: null,
    };
  };

  /**
   * Atualiza o visual de "Aberto/Fechado" no top bar e footer
   */
  function atualizarVisualFuncionamento() {
    const funcionamentos = document.querySelectorAll(".funcionamento");

    if (funcionamentos.length > 0) {
      const aberta = window.isLojaAberta();

      funcionamentos.forEach((elemento) => {
        const textoSpan = elemento.querySelector("[data-isopen]");

        if (aberta) {
          elemento.classList.add("open");
          if (textoSpan) textoSpan.innerText = "Aberto";
        } else {
          elemento.classList.remove("open");
          if (textoSpan) textoSpan.innerText = "Fechado";
        }
      });
    }

    // Atualizar textos de horário dinamicamente
    atualizarTextosHorario();
  }

  /**
   * Atualiza os textos de horário no top bar e footer dinamicamente
   */
  function atualizarTextosHorario() {
    // Top bar
    const topBarHorarios = document.querySelector("[data-horarios-texto]");
    if (topBarHorarios) {
      const seg = horariosPorDia[1];
      const sab = horariosPorDia[6];

      if (seg && sab) {
        topBarHorarios.textContent = `Seg-Sex ${seg[0]}h-${seg[1]}h | Sab ${sab[0]}h-${sab[1]}h`;
      }
    }

    // Footer
    const footerHorarios = document.querySelector("[data-horarios-texto-footer]");
    if (footerHorarios) {
      const seg = horariosPorDia[1];
      const sab = horariosPorDia[6];

      if (seg && sab) {
        footerHorarios.textContent = `Seg-Sex ${seg[0]}h-${seg[1]}h | Sab ${sab[0]}h-${sab[1]}h`;
      }
    }
  }

  /**
   * Monitora o estado da loja e bloqueia/libera pedidos
   */
  function monitorarEstadoLoja() {
    setInterval(() => {
      const aberta = window.isLojaAberta();
      const status = window.getStatusLoja();

      // Atualizar visual de aberto/fechado
      atualizarVisualFuncionamento();

      // Bloquear/desbloquear botão de "Adicionar ao Carrinho"
      bloquearAdicionarAoCarrinho(!aberta);

      // Bloquear/desbloquear botão de "Continuar" e "Revisar Pedido"
      bloquearBotoesCheckout(!aberta);

      // Atualizar visual dos botões
      atualizarVisualBotoes(!aberta, status);
    }, 60000); // Verificar a cada 1 minuto

    // Executar imediatamente na inicialização
    const aberta = window.isLojaAberta();
    const status = window.getStatusLoja();
    atualizarVisualFuncionamento();
    bloquearAdicionarAoCarrinho(!aberta);
    bloquearBotoesCheckout(!aberta);
    atualizarVisualBotoes(!aberta, status);
  }

  /**
   * Bloqueia todos os botões de interação com itens quando loja está fechada
   */
  function bloquearAdicionarAoCarrinho(bloquear) {
    const botoesAdicionar = document.querySelectorAll(".btn-add");
    const botoesAumentar = document.querySelectorAll(".add-mais");
    const botoesDiminuir = document.querySelectorAll(".add-menos");
    const numerosQuantidade = document.querySelectorAll(".add-numero-items");
    const mensagem = "Loja fechada. Não é possível fazer pedidos no momento.";

    // Bloquear botão de adicionar ao carrinho
    botoesAdicionar.forEach((botao) => {
      if (bloquear) {
        botao.style.pointerEvents = "none";
        botao.style.opacity = "0.5";
        botao.setAttribute("data-bloqueado", "true");
        botao.title = mensagem;
      } else {
        botao.style.pointerEvents = "auto";
        botao.style.opacity = "1";
        botao.removeAttribute("data-bloqueado");
        botao.title = "";
      }
    });

    // Bloquear botões de aumentar quantidade
    botoesAumentar.forEach((botao) => {
      if (bloquear) {
        botao.style.pointerEvents = "none";
        botao.style.opacity = "0.5";
        botao.setAttribute("data-bloqueado-qty", "true");
        botao.title = mensagem;
      } else {
        botao.style.pointerEvents = "auto";
        botao.style.opacity = "1";
        botao.removeAttribute("data-bloqueado-qty");
        botao.title = "";
      }
    });

    // Bloquear botões de diminuir quantidade
    botoesDiminuir.forEach((botao) => {
      if (bloquear) {
        botao.style.pointerEvents = "none";
        botao.style.opacity = "0.5";
        botao.setAttribute("data-bloqueado-qty", "true");
        botao.title = mensagem;
      } else {
        botao.style.pointerEvents = "auto";
        botao.style.opacity = "1";
        botao.removeAttribute("data-bloqueado-qty");
        botao.title = "";
      }
    });

    // Bloquear números de quantidade (visual)
    numerosQuantidade.forEach((numero) => {
      if (bloquear) {
        numero.setAttribute("data-bloqueado-qty", "true");
      } else {
        numero.removeAttribute("data-bloqueado-qty");
      }
    });
  }

  /**
   * Bloqueia os botões de checkout quando loja está fechada
   */
  function bloquearBotoesCheckout(bloquear) {
    const btnContinuar = document.querySelector("[data-modal='btn-continuar']");
    const btnRevisar = document.querySelector("[data-modal='btn-revisar']");
    const btnPagamento = document.querySelector("[data-modal='btn-pagamento']");
    const btnEnviar = document.querySelector("[data-modal='btn-enviar']");

    [btnContinuar, btnRevisar, btnPagamento, btnEnviar].forEach((btn) => {
      if (btn) {
        if (bloquear) {
          btn.style.pointerEvents = "none";
          btn.style.opacity = "0.5";
          btn.setAttribute("data-bloqueado-checkout", "true");
        } else {
          btn.style.pointerEvents = "auto";
          btn.style.opacity = "1";
          btn.removeAttribute("data-bloqueado-checkout");
        }
      }
    });
  }

  /**
   * Atualiza o visual dos botões com mensagem de loja fechada
   */
  function atualizarVisualBotoes(fechado, status) {
    if (fechado) {
      // Mostrar aviso visual na página
      const existenteAviso = document.querySelector("[data-aviso-loja-fechada]");
      if (!existenteAviso) {
        const aviso = document.createElement("div");
        aviso.setAttribute("data-aviso-loja-fechada", "true");
        aviso.className = "aviso-loja-fechada";
        aviso.innerHTML = `
          <div class="aviso-loja-fechada__content">
            <i class="fas fa-info-circle"></i>
            <span>${status.mensagem}</span>
          </div>
        `;
        document.querySelector("#cardapio")?.parentElement.insertBefore(aviso, document.querySelector("#cardapio"));
      }
    } else {
      const aviso = document.querySelector("[data-aviso-loja-fechada]");
      if (aviso) {
        aviso.remove();
      }
    }
  }

  /**
   * Intercepta o método adicionarAoCarrinho original para validar
   */
  function interceptarAdicionarAoCarrinho() {
    const metodoOriginal = window.cardapio?.metodos?.adicionarAoCarrinho;

    if (metodoOriginal && typeof metodoOriginal === "function") {
      window.cardapio.metodos.adicionarAoCarrinho = function (id) {
        if (!window.isLojaAberta()) {
          const status = window.getStatusLoja();
          window.cardapio.metodos.mensagem(`Loja está fechada. ${status.mensagem}`, "red", 5000);
          return;
        }

        // Chamar método original se loja está aberta
        metodoOriginal.call(this, id);
      };
    }
  }

  /**
   * Intercepta o método resumoPedido original para validar
   */
  function interceptarResumoPedido() {
    const metodoOriginal = window.cardapio?.metodos?.resumoPedido;

    if (metodoOriginal && typeof metodoOriginal === "function") {
      window.cardapio.metodos.resumoPedido = function () {
        if (!window.isLojaAberta()) {
          const status = window.getStatusLoja();
          window.cardapio.metodos.mensagem(`Não é possível enviar pedidos. ${status.mensagem}`, "red", 5000);
          return;
        }

        // Chamar método original se loja está aberta
        metodoOriginal.call(this);
      };
    }
  }

  /**
   * Intercepta o método finalizarPedido original para validar
   */
  function interceptarFinalizarPedido() {
    const metodoOriginal = window.cardapio?.metodos?.finalizarPedido;

    if (metodoOriginal && typeof metodoOriginal === "function") {
      window.cardapio.metodos.finalizarPedido = function () {
        if (!window.isLojaAberta()) {
          const status = window.getStatusLoja();
          window.cardapio.metodos.mensagem(`Não é possível enviar pedidos. ${status.mensagem}`, "red", 5000);
          return;
        }

        // Chamar método original se loja está aberta
        metodoOriginal.call(this);
      };
    }
  }

  /**
   * Intercepta os métodos do cardápio do dia para validar
   */
  function interceptarCardapioDoDia() {
    // Aumentar quantidade
    const aumentarOriginal = window.cardapioDodia?.aumentarQuantidade;
    if (aumentarOriginal && typeof aumentarOriginal === "function") {
      window.cardapioDodia.aumentarQuantidade = function (id) {
        if (!window.isLojaAberta()) {
          const status = window.getStatusLoja();
          if (window.cardapio?.metodos?.mensagem) {
            window.cardapio.metodos.mensagem(`Loja está fechada. ${status.mensagem}`, "red", 5000);
          }
          return;
        }
        aumentarOriginal.call(this, id);
      };
    }

    // Diminuir quantidade
    const diminuirOriginal = window.cardapioDodia?.diminuirQuantidade;
    if (diminuirOriginal && typeof diminuirOriginal === "function") {
      window.cardapioDodia.diminuirQuantidade = function (id) {
        if (!window.isLojaAberta()) {
          const status = window.getStatusLoja();
          if (window.cardapio?.metodos?.mensagem) {
            window.cardapio.metodos.mensagem(`Loja está fechada. ${status.mensagem}`, "red", 5000);
          }
          return;
        }
        diminuirOriginal.call(this, id);
      };
    }

    // Adicionar ao carrinho
    const adicionarOriginal = window.cardapioDodia?.adicionarAoCarrinho;
    if (adicionarOriginal && typeof adicionarOriginal === "function") {
      window.cardapioDodia.adicionarAoCarrinho = function (id) {
        if (!window.isLojaAberta()) {
          const status = window.getStatusLoja();
          if (window.cardapio?.metodos?.mensagem) {
            window.cardapio.metodos.mensagem(`Loja está fechada. ${status.mensagem}`, "red", 5000);
          }
          return;
        }
        adicionarOriginal.call(this, id);
      };
    }
  }

  /**
   * Observa mudanças no DOM para detectar botões criados dinamicamente
   * (importante para o cardápio do dia que carrega assincronamente)
   */
  function observarMudancasDOM() {
    const observer = new MutationObserver(() => {
      // Quando novos elementos são adicionados, re-aplicar bloqueio se necessário
      const aberta = window.isLojaAberta();
      if (!aberta) {
        bloquearAdicionarAoCarrinho(true);
      }
    });

    // Observar mudanças no cardápio do dia
    const cardapioDoDiaContainer = document.querySelector("[data-cardapio-container]");
    if (cardapioDoDiaContainer) {
      observer.observe(cardapioDoDiaContainer, {
        childList: true,
        subtree: true,
      });
    }

    // Observar mudanças no cardápio normal
    const cardapioNormal = document.querySelector("[data-cards]");
    if (cardapioNormal) {
      observer.observe(cardapioNormal, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Iniciar monitoramento IMEDIATAMENTE
  monitorarEstadoLoja();
  observarMudancasDOM();

  // Aguardar para garantir que o cardapio.metodos está disponível
  setTimeout(() => {
    interceptarAdicionarAoCarrinho();
    interceptarResumoPedido();
    interceptarFinalizarPedido();
    interceptarCardapioDoDia();

    // Forçar re-bloqueio após interceptações
    const aberta = window.isLojaAberta();
    if (!aberta) {
      console.log("🔒 Loja fechada - bloqueando botões");
      bloquearAdicionarAoCarrinho(true);
    } else {
      console.log("✅ Loja aberta");
    }
  }, 1000);

  // Verificar novamente após 2 segundos (garantir que tudo carregou)
  setTimeout(() => {
    const aberta = window.isLojaAberta();
    if (!aberta) {
      bloquearAdicionarAoCarrinho(true);
    }
  }, 2000);
}
