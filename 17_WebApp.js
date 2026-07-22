/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 17_WebApp.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Inicialização do WebApp.
 * Carregamento da interface principal.
 * Configurações globais da aplicação.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO WEBAPP
 * =========================================================
 */

const WEBAPP_CONFIG = Object.freeze({

  NOME: 'SLOG OPS',

  VERSAO: '1.0.0',

  TITULO:
    'SLOG OPS - Registro Operacional',

  FAVICON:
    'https://ssl.gstatic.com/docs/script/images/favicon.ico',

  HTML_PRINCIPAL:
    'Index',

  TIMEZONE:
    Session.getScriptTimeZone(),

  LOCALE:
    Session.getActiveUserLocale(),

  MODO:
    'PRODUCAO'

});


/* =========================================================
 * ENTRADA DO WEB APP
 * =========================================================
 */

/**
 * Ponto de entrada do sistema.
 *
 * Todo acesso ao aplicativo passa por aqui.
 */
function doGet(e) {

  try {

    validarSistemaWebApp_();

    const html =
      HtmlService.createTemplateFromFile(
        WEBAPP_CONFIG.HTML_PRINCIPAL
      );

    html.APP = obterConfiguracoesWebApp();

    return html
      .evaluate()
      .setTitle(
        WEBAPP_CONFIG.TITULO
      )
      .setFaviconUrl(
        WEBAPP_CONFIG.FAVICON
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );

  }

  catch (erro) {

    return HtmlService
      .createHtmlOutput(

        construirTelaErroInicial_(
          erro
        )

      )
      .setTitle(
        'Erro'
      );

  }

}
/* =========================================================
 * CONFIGURAÇÕES DISPONIBILIZADAS PARA O FRONT-END
 * =========================================================
 */

/**
 * Retorna as configurações públicas da aplicação.
 *
 * Estas informações ficam disponíveis para o HTML
 * através da variável APP.
 */
function obterConfiguracoesWebApp() {

  return {

    sistema: WEBAPP_CONFIG.NOME,

    titulo: WEBAPP_CONFIG.TITULO,

    versao: WEBAPP_CONFIG.VERSAO,

    ambiente: WEBAPP_CONFIG.MODO,

    timezone: WEBAPP_CONFIG.TIMEZONE,

    locale: WEBAPP_CONFIG.LOCALE,

    dataServidor: formatarDataHora(
      agora()
    )

  };

}


/* =========================================================
 * VALIDAÇÕES DE INICIALIZAÇÃO
 * =========================================================
 */

/**
 * Verifica se o sistema possui a estrutura mínima
 * necessária para funcionar.
 */
function validarSistemaWebApp_() {

  if (
    typeof SLOG_CONFIG === 'undefined'
  ) {
    throw new Error(
      'SLOG_CONFIG não foi encontrada.'
    );
  }

  if (
    typeof SLOG_ABAS === 'undefined'
  ) {
    throw new Error(
      'SLOG_ABAS não foi encontrada.'
    );
  }

  if (
    !SpreadsheetApp.getActiveSpreadsheet()
  ) {
    throw new Error(
      'Planilha principal não encontrada.'
    );
  }

}


/* =========================================================
 * INCLUSÃO DE ARQUIVOS HTML
 * =========================================================
 */

/**
 * Permite incluir arquivos HTML
 * utilizando:
 *
 * <?!= include("Arquivo"); ?>
 */
function include(nomeArquivo) {

  return HtmlService
    .createHtmlOutputFromFile(
      nomeArquivo
    )
    .getContent();

}
/* =========================================================
 * TELA DE ERRO DE INICIALIZAÇÃO
 * =========================================================
 */

/**
 * Constrói uma tela simples para apresentar erros
 * ocorridos antes do carregamento da interface principal.
 */
function construirTelaErroInicial_(erro) {

  const mensagem =
    erro && erro.message
      ? erro.message
      : String(erro || 'Erro desconhecido.');

  const mensagemSegura =
    escaparHtmlWebApp_(
      mensagem
    );

  const tituloSeguro =
    escaparHtmlWebApp_(
      WEBAPP_CONFIG.TITULO
    );

  return [
    '<!DOCTYPE html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>Erro ao iniciar o sistema</title>',

    '<style>',
    'body {',
    '  margin: 0;',
    '  padding: 24px;',
    '  min-height: 100vh;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  background: #f4f6f8;',
    '  font-family: Arial, Helvetica, sans-serif;',
    '  color: #1f2937;',
    '}',

    '.erro-container {',
    '  width: 100%;',
    '  max-width: 520px;',
    '  background: #ffffff;',
    '  border-radius: 16px;',
    '  padding: 28px;',
    '  box-sizing: border-box;',
    '  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.10);',
    '}',

    '.erro-icone {',
    '  width: 56px;',
    '  height: 56px;',
    '  margin-bottom: 18px;',
    '  border-radius: 50%;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  background: #fee2e2;',
    '  color: #b91c1c;',
    '  font-size: 28px;',
    '  font-weight: bold;',
    '}',

    'h1 {',
    '  margin: 0 0 10px;',
    '  font-size: 24px;',
    '}',

    'p {',
    '  margin: 0;',
    '  line-height: 1.6;',
    '}',

    '.erro-mensagem {',
    '  margin-top: 18px;',
    '  padding: 14px;',
    '  border-radius: 10px;',
    '  background: #f9fafb;',
    '  border: 1px solid #e5e7eb;',
    '  word-break: break-word;',
    '}',

    '.erro-rodape {',
    '  margin-top: 20px;',
    '  font-size: 13px;',
    '  color: #6b7280;',
    '}',

    '</style>',
    '</head>',

    '<body>',
    '<main class="erro-container">',

    '<div class="erro-icone">!</div>',

    '<h1>Não foi possível iniciar o sistema</h1>',

    '<p>',
    'O aplicativo encontrou uma inconsistência durante a inicialização.',
    '</p>',

    '<div class="erro-mensagem">',
    mensagemSegura,
    '</div>',

    '<div class="erro-rodape">',
    tituloSeguro,
    ' — Versão ',
    escaparHtmlWebApp_(
      WEBAPP_CONFIG.VERSAO
    ),
    '</div>',

    '</main>',
    '</body>',
    '</html>'
  ].join('');
}


/**
 * Escapa caracteres especiais antes de inserir
 * mensagens em conteúdo HTML.
 */
function escaparHtmlWebApp_(valor) {

  return String(
    valor === null ||
    valor === undefined
      ? ''
      : valor
  )
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


/* =========================================================
 * DIAGNÓSTICO DO WEBAPP
 * =========================================================
 */

/**
 * Retorna um diagnóstico básico da estrutura
 * necessária para publicação do WebApp.
 */
function diagnosticarWebApp() {

  const diagnostico = {

    sucesso: true,

    modulo:
      'WEBAPP',

    nome:
      WEBAPP_CONFIG.NOME,

    versao:
      WEBAPP_CONFIG.VERSAO,

    ambiente:
      WEBAPP_CONFIG.MODO,

    htmlPrincipal:
      WEBAPP_CONFIG.HTML_PRINCIPAL,

    timezone:
      WEBAPP_CONFIG.TIMEZONE,

    locale:
      WEBAPP_CONFIG.LOCALE,

    planilhaDisponivel:
      false,

    configuracaoDisponivel:
      false,

    abasDisponiveis:
      false,

    htmlPrincipalDisponivel:
      false,

    mensagem:
      '',

    verificadoEm:
      formatarDataHora(
        agora()
      )

  };

  try {

    diagnostico.planilhaDisponivel =
      Boolean(
        SpreadsheetApp
          .getActiveSpreadsheet()
      );

    diagnostico.configuracaoDisponivel =
      typeof SLOG_CONFIG !==
      'undefined';

    diagnostico.abasDisponiveis =
      typeof SLOG_ABAS !==
      'undefined';

    try {

      HtmlService
        .createTemplateFromFile(
          WEBAPP_CONFIG.HTML_PRINCIPAL
        );

      diagnostico.htmlPrincipalDisponivel =
        true;

    } catch (erroHtml) {

      diagnostico.htmlPrincipalDisponivel =
        false;

      diagnostico.erroHtml =
        erroHtml &&
        erroHtml.message
          ? erroHtml.message
          : String(erroHtml);

    }

    diagnostico.sucesso =
      diagnostico.planilhaDisponivel &&
      diagnostico.configuracaoDisponivel &&
      diagnostico.abasDisponiveis &&
      diagnostico.htmlPrincipalDisponivel;

    diagnostico.mensagem =
      diagnostico.sucesso
        ? 'Estrutura básica do WebApp disponível.'
        : 'O WebApp possui pendências de configuração.';

  } catch (erro) {

    diagnostico.sucesso = false;

    diagnostico.mensagem =
      erro && erro.message
        ? erro.message
        : String(erro);

  }

  console.log(
    JSON.stringify(
      diagnostico,
      null,
      2
    )
  );

  return diagnostico;
}


/* =========================================================
 * TESTES
 * =========================================================
 */

/**
 * Testa o carregamento e as dependências
 * principais do módulo WebApp.
 *
 * Observação:
 * Este teste somente será aprovado depois que
 * o arquivo Index.html for criado.
 */
function testarModuloWebApp() {

  const funcoesDisponiveis = {

    doGet:
      typeof doGet ===
      'function',

    obterConfiguracoes:
      typeof obterConfiguracoesWebApp ===
      'function',

    validarSistema:
      typeof validarSistemaWebApp_ ===
      'function',

    incluirHtml:
      typeof include ===
      'function',

    construirTelaErro:
      typeof construirTelaErroInicial_ ===
      'function',

    diagnosticar:
      typeof diagnosticarWebApp ===
      'function'

  };

  const diagnostico =
    diagnosticarWebApp();

  const resultado = {

    sucesso: true,

    modulo:
      'WEBAPP',

    versao:
      WEBAPP_CONFIG.VERSAO,

    configuracao:
      obterConfiguracoesWebApp(),

    funcoesDisponiveis:
      funcoesDisponiveis,

    diagnostico:
      diagnostico,

    testadoEm:
      formatarDataHora(
        agora()
      )

  };

  const todasFuncoesDisponiveis =
    Object.keys(
      funcoesDisponiveis
    ).every(function(chave) {

      return (
        funcoesDisponiveis[chave] ===
        true
      );

    });

  resultado.sucesso =
    todasFuncoesDisponiveis &&
    diagnostico.sucesso;

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!resultado.sucesso) {

    throw new Error(
      'O módulo WebApp possui pendências. ' +
      'O arquivo Index.html precisa existir antes do teste final.'
    );

  }

  exibirNotificacao(
    'Módulo WebApp carregado corretamente.',
    'SLOG OPS',
    5
  );

  return resultado;
}


/**
 * Testa a geração da página inicial.
 *
 * Deve ser executado somente após a criação
 * do arquivo Index.html.
 */
function testarRenderizacaoWebApp() {

  validarSistemaWebApp_();

  const resultado =
    doGet({
      parameter: {},
      parameters: {},
      queryString: ''
    });

  if (
    !resultado ||
    typeof resultado.getContent !==
    'function'
  ) {

    throw new Error(
      'A renderização não retornou um conteúdo HTML válido.'
    );

  }

  const conteudo =
    resultado.getContent();

  if (!conteudo) {

    throw new Error(
      'O conteúdo HTML retornado está vazio.'
    );

  }

  const teste = {

    sucesso: true,

    tipoRetorno:
      String(
        resultado
          .getMimeType()
      ),

    tamanhoConteudo:
      conteudo.length,

    titulo:
      WEBAPP_CONFIG.TITULO,

    renderizadoEm:
      formatarDataHora(
        agora()
      )

  };

  console.log(
    JSON.stringify(
      teste,
      null,
      2
    )
  );

  exibirNotificacao(
    'Renderização do WebApp testada com sucesso.',
    'SLOG OPS',
    5
  );

  return teste;
}