/**
 * Módulo para carregar Cardápio do Dia do Google Sheets
 *
 * Instruções de configuração:
 * 1. Crie uma planilha no Google Sheets com as seguintes colunas:
 *    - Coluna A: Nome do prato
 *    - Coluna B: Descrição
 *    - Coluna C: Preço
 *    - Coluna D: URL da imagem (opcional)
 *
 * 2. Publique a planilha:
 *    - Clique em "Compartilhar" > "Alterar"
 *    - Selecione "Qualquer pessoa com o link"
 *    - Copie o ID da planilha da URL
 *
 * 3. Substitua "SHEET_ID" abaixo pelo ID da sua planilha
 * 4. Substitua "CardapioDoDia" pelo nome da aba da sua planilha
 */

// https://docs.google.com/spreadsheets/d/1bIr0qVGWB-pucBZzTVk547PIllwYDdURlLcM6Kw_iZc/edit?usp=sharing

export default function initCardapioDodia() {
  // ⚠️ CONFIGURAÇÃO: Substitua com seus dados do Google Sheets
  const SHEET_ID = "1bIr0qVGWB-pucBZzTVk547PIllwYDdURlLcM6Kw_iZc"; // ID da planilha
  const SHEET_NAME = "CardapioDoDia"; // Nome da aba

  const container = document.querySelector("[data-cardapio-container]");
  const errorDiv = document.querySelector("[data-cardapio-error]");
  const loadingDiv = document.querySelector(".cardapio-do-dia__loading");
  const pratos = document.querySelector("[data-cardapio-dia]");

  if (!container) return;

  /**
   * Formata valor monetário para Real
   */
  function formatarPreco(valor) {
    const num = parseFloat(valor.toString().replace(",", "."));
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  }

  /**
   * Gera um id baseado no nome
   */
  function gerarId(nome, index) {
    const base = (nome || "prato")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)+/g, "");

    return `${base || "prato"}-${index}`;
  }

  /**
   * Cria elemento HTML do prato
   */
  function criarCardPrato(prato, index) {
    const { nome, descricao, preco, imagem, peso, kcal, obs, id: existingId } = prato;

    // Gerar ID único para o prato do dia
    const id = existingId || gerarId(nome, index);

    // Limpar URL da imagem
    let imagemUrl = (imagem || "").trim();

    // Validar se é uma URL válida
    if (imagemUrl && !imagemUrl.match(/^https?:\/\//i)) {
      imagemUrl = "";
    }

    const placeholderUrl = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop";
    const finalImageUrl = imagemUrl || placeholderUrl;

    const price = formatarPreco(preco);
    const obsFormatada = Array.isArray(obs) ? obs.map((tag) => `<span class="obs-tag">${tag}</span>`).join("") : "";

    if (typeof cardapio !== "undefined" && cardapio.templates && cardapio.templates.item) {
      return cardapio.templates.item
        .replace(/cardapio\.metodos\./g, "cardapioDodia.")
        .replace(/\${img}/g, finalImageUrl)
        .replace(/\${name}/g, nome)
        .replace(/\${dsc}/g, descricao || "Prato do dia")
        .replace(/\${price}/g, price)
        .replace(/\${obs}/g, obsFormatada)
        .replace(/\${peso}/g, peso || "")
        .replace(/\${kcal}/g, kcal || "")
        .replace(/\${id}/g, id);
    }

    return "";
  }

  /**
   * Formata dados brutos do Google Sheets
   */
  function formatarDados(dados) {
    if (!dados || !Array.isArray(dados)) return [];

    return dados
      .filter((item) => item.nome && item.preco) // Filtrar itens válidos
      .map((item) => ({
        nome: (item.nome || "").trim(),
        descricao: (item.descricao || "").trim(),
        preco: (item.preco || "0").toString().trim(),
        imagem: (item.imagem || "").trim(),
        peso: (item.peso || "").trim(),
        kcal: (item.kcal || "").trim(),
        obs: (item.obs || "")
          .toString()
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      }));
  }

  /**
   * Carrega dados do Google Sheets
   */
  async function carregarCardapio() {
    try {
      // Usar exportação CSV que funciona sem autenticação
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

      const response = await fetch(url);
      const csvText = await response.text();

      if (!csvText || csvText.includes("<!DOCTYPE")) {
        exibirErro("Planilha não acessível. Verifique se está compartilhada com 'Qualquer pessoa com o link'.");
        return;
      }

      // Parsear CSV
      const linhas = csvText.trim().split("\n");
      if (linhas.length < 2) {
        exibirErro("Planilha vazia ou sem dados.");
        return;
      }

      // Extrair headers
      const headers = linhas[0].split(",").map((h) => h.trim().toLowerCase());
      const nomeIdx = headers.indexOf("nome");
      const descricaoIdx = headers.indexOf("descricao");
      const precoIdx = headers.indexOf("preco");
      const pesoIdx = headers.indexOf("peso");
      const kcalIdx = headers.indexOf("kcal");
      const obsIdx = headers.indexOf("obs");
      const imagemIdx = headers.indexOf("imagem");

      if (nomeIdx === -1 || precoIdx === -1) {
        exibirErro('Planilha mal formatada. Colunas "nome" e "preco" são obrigatórias.');
        return;
      }

      // Parsear dados
      const pratosData = [];
      for (let i = 1; i < linhas.length; i++) {
        if (!linhas[i].trim()) continue; // Pular linhas vazias

        // Parser CSV mais robusto
        const valores = [];
        let valorAtual = "";
        let dentroDasaspas = false;

        for (let j = 0; j < linhas[i].length; j++) {
          const char = linhas[i][j];
          const proximoChar = linhas[i][j + 1];

          if (char === '"') {
            dentroDasaspas = !dentroDasaspas;
          } else if (char === "," && !dentroDasaspas) {
            valores.push(valorAtual.trim().replace(/^"|"$/g, ""));
            valorAtual = "";
          } else {
            valorAtual += char;
          }
        }
        valores.push(valorAtual.trim().replace(/^"|"$/g, ""));

        // Limpar e validar dados
        const imagem = (valores[imagemIdx] || "").trim().replace(/^"|"$/g, "");

        pratosData.push({
          nome: (valores[nomeIdx] || "").trim(),
          descricao: descricaoIdx >= 0 ? (valores[descricaoIdx] || "").trim() : "",
          preco: (valores[precoIdx] || "0").trim(),
          peso: pesoIdx >= 0 ? (valores[pesoIdx] || "").trim() : "",
          kcal: kcalIdx >= 0 ? (valores[kcalIdx] || "").trim() : "",
          obs: obsIdx >= 0 ? (valores[obsIdx] || "").trim() : "",
          imagem: imagem,
        });
      }

      const pratosFormatados = formatarDados(pratosData);

      if (pratosFormatados.length === 0) {
        exibirErro("Nenhum prato válido encontrado. Verifique a planilha.");
        return;
      }

      const pratosComId = pratosFormatados.map((item, index) => ({
        ...item,
        id: gerarId(item.nome, index),
      }));

      if (typeof cardapioDodia !== "undefined" && cardapioDodia.setItens) {
        cardapioDodia.setItens(pratosComId);
      }

      exibirPratos(pratosComId);
    } catch (erro) {
      console.error("Erro ao carregar cardápio:", erro);
      exibirErro("Erro ao carregar o cardápio do dia. Verifique a conexão.");
    }
  }

  /**
   * Exibe os pratos carregados
   */
  function exibirPratos(pratosData) {
    loadingDiv.classList.add("hidden");
    errorDiv.classList.add("hidden");
    container.classList.remove("hidden");

    pratos.innerHTML = pratosData.map((prato, index) => criarCardPrato(prato, index)).join("");
  }

  /**
   * Exibe mensagem de erro
   */
  function exibirErro(mensagem) {
    loadingDiv.classList.add("hidden");
    container.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    errorDiv.textContent = mensagem;
  }

  // Carregar cardápio ao inicializar
  carregarCardapio();
}
