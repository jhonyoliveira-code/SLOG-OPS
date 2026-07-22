/**
 * =========================================================
 * SLOG OPS
 * Arquivo: Instalacao.gs
 * Responsabilidade: instalação inicial do sistema.
 * =========================================================
 */


/**
 * Executa a instalação completa do banco de dados.
 */
function instalarSistema() {
  return executarComBloqueio(function() {
    const planilha = obterPlanilha();
    const usuario = obterUsuarioAtual();
    const estruturas = obterEstruturasAbas();

    configurarPlanilhaBase_(planilha);

    estruturas.forEach(function(estrutura) {
      configurarCabecalhosAba(
        estrutura.nome,
        estrutura.cabecalhos
      );
    });

    salvarConfiguracoesIniciais_(usuario);
    removerAbaPadraoVazia_(planilha);

    registrarAuditoria(
      'INSTALACAO_SISTEMA',
      'INSTALACAO',
      planilha.getId(),
      {
        sistema: SLOG_CONFIG.NOME_SISTEMA,
        versao: SLOG_CONFIG.VERSAO,
        totalAbas: estruturas.length
      },
      usuario
    );

    const resultado = validarInstalacao();

    if (!resultado.sucesso) {
      throw new Error(
        'A instalação foi executada, mas a validação encontrou inconsistências.'
      );
    }

    exibirNotificacao(
      'Sistema instalado com sucesso.',
      SLOG_CONFIG.NOME_SISTEMA,
      8
    );

    console.log(
      JSON.stringify(resultado, null, 2)
    );

    return resultado;
  });
}


/**
 * Configura dados gerais da planilha.
 */
function configurarPlanilhaBase_(planilha) {
  planilha.setSpreadsheetTimeZone(
    SLOG_CONFIG.FUSO_HORARIO
  );

  planilha.setSpreadsheetLocale(
    SLOG_CONFIG.LOCALIDADE_PLANILHA
  );
}


/**
 * Salva as configurações iniciais do sistema.
 */
function salvarConfiguracoesIniciais_(usuario) {
  salvarConfiguracao(
    'NOME_SISTEMA',
    SLOG_CONFIG.NOME_SISTEMA,
    'Nome oficial do sistema.',
    usuario
  );

  salvarConfiguracao(
    'VERSAO_SISTEMA',
    SLOG_CONFIG.VERSAO,
    'Versão atualmente instalada.',
    usuario
  );

  salvarConfiguracao(
    'FUSO_HORARIO',
    SLOG_CONFIG.FUSO_HORARIO,
    'Fuso horário utilizado pelo sistema.',
    usuario
  );

  salvarConfiguracao(
    'LOCALIDADE_PLANILHA',
    SLOG_CONFIG.LOCALIDADE_PLANILHA,
    'Localidade aplicada à planilha.',
    usuario
  );

  salvarConfiguracao(
    'INSTALADO_EM',
    formatarDataHora(agora()),
    'Data e hora da instalação inicial.',
    usuario
  );

  salvarConfiguracao(
    'INSTALADO_POR',
    usuario,
    'Usuário responsável pela instalação.',
    usuario
  );

  salvarConfiguracao(
    'STATUS_SISTEMA',
    'ATIVO',
    'Status geral do sistema.',
    usuario
  );
}


/**
 * Remove a aba padrão quando ela estiver vazia.
 */
function removerAbaPadraoVazia_(planilha) {
  const nomesPadrao = [
    'Página1',
    'Pagina1',
    'Planilha1',
    'Sheet1'
  ];

  const abas = planilha.getSheets();

  if (abas.length <= 1) {
    return;
  }

  abas.forEach(function(aba) {
    const nome = aba.getName();

    if (nomesPadrao.indexOf(nome) === -1) {
      return;
    }

    const estaVazia =
      aba.getLastRow() <= 1 &&
      aba.getLastColumn() <= 1 &&
      estaVazio(aba.getRange('A1').getValue());

    if (estaVazia && planilha.getSheets().length > 1) {
      planilha.deleteSheet(aba);
    }
  });
}


/**
 * Valida todas as abas e cabeçalhos.
 */
function validarInstalacao() {
  const inconsistencias = [];
  const abasValidadas = [];

  obterEstruturasAbas().forEach(function(estrutura) {
    const existe = abaExiste(estrutura.nome);

    if (!existe) {
      inconsistencias.push({
        aba: estrutura.nome,
        problema: 'ABA_NAO_ENCONTRADA'
      });

      return;
    }

    const cabecalhosCorretos = validarCabecalhosAba(
      estrutura.nome,
      estrutura.cabecalhos
    );

    if (!cabecalhosCorretos) {
      inconsistencias.push({
        aba: estrutura.nome,
        problema: 'CABECALHOS_INCORRETOS'
      });

      return;
    }

    abasValidadas.push(estrutura.nome);
  });

  const resultado = {
    sucesso: inconsistencias.length === 0,
    sistema: SLOG_CONFIG.NOME_SISTEMA,
    versao: SLOG_CONFIG.VERSAO,
    planilha: obterPlanilha().getName(),
    totalAbasEsperadas: obterEstruturasAbas().length,
    totalAbasValidadas: abasValidadas.length,
    abasValidadas: abasValidadas,
    inconsistencias: inconsistencias,
    validadoEm: formatarDataHora(agora()),
    validadoPor: obterUsuarioAtual()
  };

  console.log(
    JSON.stringify(resultado, null, 2)
  );

  return resultado;
}


/**
 * Reaplica os cabeçalhos oficiais sem apagar registros.
 */
function repararEstruturaSistema() {
  return executarComBloqueio(function() {
    obterEstruturasAbas().forEach(function(estrutura) {
      configurarCabecalhosAba(
        estrutura.nome,
        estrutura.cabecalhos
      );
    });

    const resultado = validarInstalacao();

    registrarAuditoria(
      'REPARO_ESTRUTURA',
      'INSTALACAO',
      obterPlanilha().getId(),
      resultado,
      obterUsuarioAtual()
    );

    exibirNotificacao(
      resultado.sucesso
        ? 'Estrutura reparada com sucesso.'
        : 'O reparo encontrou inconsistências.',
      SLOG_CONFIG.NOME_SISTEMA,
      8
    );

    return resultado;
  });
}


/**
 * Teste final da primeira etapa.
 */
function testarInstalacao() {
  const resultado = validarInstalacao();

  if (!resultado.sucesso) {
    throw new Error(
      'A estrutura ainda possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Instalação validada sem erros.',
    'SLOG OPS',
    5
  );

  return resultado;
}