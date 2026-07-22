/**
 * =========================================================
 * SLOG OPS
 * Arquivo: BancoDados.gs
 * Responsabilidade: acesso e manipulação das abas do banco.
 * =========================================================
 */


/**
 * Retorna a planilha vinculada ao projeto.
 */
function obterPlanilha() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  if (!planilha) {
    throw new Error(
      'Não foi possível acessar a planilha. ' +
      'Confirme se o projeto Apps Script está vinculado à planilha.'
    );
  }

  return planilha;
}


/**
 * Retorna uma aba pelo nome.
 */
function obterAba(nomeAba) {
  exigirCampo(nomeAba, 'Nome da aba');

  const planilha = obterPlanilha();
  return planilha.getSheetByName(nomeAba);
}


/**
 * Retorna uma aba ou gera erro caso ela não exista.
 */
function exigirAba(nomeAba) {
  const aba = obterAba(nomeAba);

  if (!aba) {
    throw new Error(
      'A aba "' + nomeAba + '" não foi encontrada.'
    );
  }

  return aba;
}


/**
 * Verifica se uma aba existe.
 */
function abaExiste(nomeAba) {
  return obterAba(nomeAba) !== null;
}


/**
 * Cria uma aba caso ela ainda não exista.
 */
function criarAbaSeNaoExistir(nomeAba) {
  exigirCampo(nomeAba, 'Nome da aba');

  const planilha = obterPlanilha();
  let aba = planilha.getSheetByName(nomeAba);

  if (!aba) {
    aba = planilha.insertSheet(nomeAba);
  }

  return aba;
}


/**
 * Retorna os cabeçalhos existentes em uma aba.
 */
function obterCabecalhosAba(nomeAba) {
  const aba = exigirAba(nomeAba);
  const ultimaColuna = aba.getLastColumn();

  if (ultimaColuna === 0) {
    return [];
  }

  return aba
    .getRange(1, 1, 1, ultimaColuna)
    .getValues()[0]
    .map(function(cabecalho) {
      return normalizarTexto(cabecalho);
    });
}


/**
 * Cria ou atualiza os cabeçalhos de uma aba.
 */
function configurarCabecalhosAba(nomeAba, cabecalhos) {
  exigirCampo(nomeAba, 'Nome da aba');

  if (!Array.isArray(cabecalhos) || cabecalhos.length === 0) {
    throw new Error(
      'Nenhum cabeçalho foi informado para a aba "' +
      nomeAba +
      '".'
    );
  }

  const aba = criarAbaSeNaoExistir(nomeAba);

  aba
    .getRange(1, 1, 1, cabecalhos.length)
    .setValues([cabecalhos]);

  formatarCabecalhoAba(aba, cabecalhos.length);

  return aba;
}


/**
 * Aplica a formatação padrão no cabeçalho.
 */
function formatarCabecalhoAba(aba, quantidadeColunas) {
  const intervalo = aba.getRange(
    1,
    1,
    1,
    quantidadeColunas
  );

  intervalo
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#1F4E78')
    .setFontColor('#FFFFFF')
    .setWrap(true);

  aba.setFrozenRows(1);
  aba.setRowHeight(1, 32);

  ajustarLargurasPadrao(aba, quantidadeColunas);
}


/**
 * Ajusta as larguras das colunas.
 */
function ajustarLargurasPadrao(aba, quantidadeColunas) {
  for (
    let coluna = 1;
    coluna <= quantidadeColunas;
    coluna++
  ) {
    aba.setColumnWidth(coluna, 150);
  }

  const cabecalhos = aba
    .getRange(1, 1, 1, quantidadeColunas)
    .getValues()[0];

  cabecalhos.forEach(function(cabecalho, indice) {
    const nome = normalizarParaComparacao(cabecalho);
    const coluna = indice + 1;

    if (
      nome.indexOf('OBSERVAC') !== -1 ||
      nome.indexOf('DESCRICAO') !== -1 ||
      nome.indexOf('DETALHES') !== -1 ||
      nome.indexOf('DADOS_JSON') !== -1 ||
      nome.indexOf('PROGRESSO') !== -1 ||
      nome.indexOf('MOTIVO') !== -1
    ) {
      aba.setColumnWidth(coluna, 280);
    }

    if (
      nome.indexOf('DATA') !== -1 ||
      nome.indexOf('CRIADO_EM') !== -1 ||
      nome.indexOf('ATUALIZADO_EM') !== -1 ||
      nome.indexOf('FINALIZADO_EM') !== -1 ||
      nome.indexOf('CANCELADO_EM') !== -1 ||
      nome.indexOf('ENCERRADO_EM') !== -1 ||
      nome.indexOf('ULTIMO_ACESSO') !== -1 ||
      nome.indexOf('VINCULADO_EM') !== -1 ||
      nome.indexOf('DESVINCULADO_EM') !== -1
    ) {
      aba.setColumnWidth(coluna, 165);
    }

    if (
      nome === 'ID_ADM' ||
      nome.indexOf('ID_') === 0
    ) {
      aba.setColumnWidth(coluna, 180);
    }

    if (
      nome === 'STATUS' ||
      nome === 'PERFIL' ||
      nome === 'TIPO' ||
      nome === 'PRINCIPAL'
    ) {
      aba.setColumnWidth(coluna, 140);
    }
  });
}


/**
 * Retorna a posição de cada cabeçalho.
 *
 * Exemplo:
 * {
 *   ID_CLIENTE: 0,
 *   CLIENTE: 1
 * }
 */
function mapearCabecalhos(nomeAba) {
  const cabecalhos = obterCabecalhosAba(nomeAba);
  const mapa = {};

  cabecalhos.forEach(function(cabecalho, indice) {
    mapa[normalizarParaComparacao(cabecalho)] = indice;
  });

  return mapa;
}


/**
 * Valida se os cabeçalhos da aba correspondem à estrutura.
 */
function validarCabecalhosAba(nomeAba, cabecalhosEsperados) {
  const cabecalhosAtuais = obterCabecalhosAba(nomeAba);

  if (cabecalhosAtuais.length !== cabecalhosEsperados.length) {
    return false;
  }

  for (
    let indice = 0;
    indice < cabecalhosEsperados.length;
    indice++
  ) {
    if (
      normalizarParaComparacao(cabecalhosAtuais[indice]) !==
      normalizarParaComparacao(cabecalhosEsperados[indice])
    ) {
      return false;
    }
  }

  return true;
}


/**
 * Retorna todos os registros de uma aba como objetos.
 */
function listarRegistros(nomeAba) {
  const aba = exigirAba(nomeAba);
  const ultimaLinha = aba.getLastRow();
  const ultimaColuna = aba.getLastColumn();

  if (ultimaLinha <= 1 || ultimaColuna === 0) {
    return [];
  }

  const cabecalhos = obterCabecalhosAba(nomeAba);

  const valores = aba
    .getRange(
      2,
      1,
      ultimaLinha - 1,
      ultimaColuna
    )
    .getValues();

  return valores
    .filter(function(linha) {
      return linha.some(function(valor) {
        return !estaVazio(valor);
      });
    })
    .map(function(linha, indice) {
      const registro = {};

      cabecalhos.forEach(function(cabecalho, coluna) {
        registro[cabecalho] = linha[coluna];
      });

      registro.__LINHA = indice + 2;

      return registro;
    });
}


/**
 * Localiza um registro pelo nome do campo e valor.
 */
function localizarRegistro(nomeAba, nomeCampo, valorProcurado) {
  const campoNormalizado = normalizarParaComparacao(nomeCampo);

  const registros = listarRegistros(nomeAba);

  return registros.find(function(registro) {
    const valorRegistro = registro[campoNormalizado];

    return (
      normalizarParaComparacao(valorRegistro) ===
      normalizarParaComparacao(valorProcurado)
    );
  }) || null;
}


/**
 * Localiza registros através de uma função de filtro.
 */
function filtrarRegistros(nomeAba, funcaoFiltro) {
  if (typeof funcaoFiltro !== 'function') {
    throw new Error(
      'A função de filtro não foi informada corretamente.'
    );
  }

  return listarRegistros(nomeAba).filter(funcaoFiltro);
}


/**
 * Insere um registro em uma aba.
 */
function inserirRegistro(nomeAba, dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error(
      'Os dados do registro não foram informados.'
    );
  }

  return executarComBloqueio(function() {
    const aba = exigirAba(nomeAba);
    const cabecalhos = obterCabecalhosAba(nomeAba);

    const linha = cabecalhos.map(function(cabecalho) {
      return Object.prototype.hasOwnProperty.call(
        dados,
        cabecalho
      )
        ? dados[cabecalho]
        : '';
    });

    aba.appendRow(linha);

    return {
      linha: aba.getLastRow(),
      dados: dados
    };
  });
}


/**
 * Atualiza um registro existente.
 */
function atualizarRegistroPorLinha(nomeAba, numeroLinha, dados) {
  if (
    !Number.isInteger(numeroLinha) ||
    numeroLinha < 2
  ) {
    throw new Error(
      'O número da linha para atualização é inválido.'
    );
  }

  if (!dados || typeof dados !== 'object') {
    throw new Error(
      'Os dados para atualização não foram informados.'
    );
  }

  return executarComBloqueio(function() {
    const aba = exigirAba(nomeAba);
    const cabecalhos = obterCabecalhosAba(nomeAba);

    const valoresAtuais = aba
      .getRange(
        numeroLinha,
        1,
        1,
        cabecalhos.length
      )
      .getValues()[0];

    const novaLinha = cabecalhos.map(function(cabecalho, indice) {
      if (
        Object.prototype.hasOwnProperty.call(
          dados,
          cabecalho
        )
      ) {
        return dados[cabecalho];
      }

      return valoresAtuais[indice];
    });

    aba
      .getRange(
        numeroLinha,
        1,
        1,
        cabecalhos.length
      )
      .setValues([novaLinha]);

    return {
      linha: numeroLinha,
      dados: dados
    };
  });
}


/**
 * Atualiza um registro usando um campo identificador.
 */
function atualizarRegistroPorCampo(
  nomeAba,
  nomeCampo,
  valorCampo,
  dados
) {
  const registro = localizarRegistro(
    nomeAba,
    nomeCampo,
    valorCampo
  );

  if (!registro) {
    throw new Error(
      'Registro não encontrado na aba "' +
      nomeAba +
      '".'
    );
  }

  return atualizarRegistroPorLinha(
    nomeAba,
    registro.__LINHA,
    dados
  );
}


/**
 * Verifica se existe registro com determinado valor.
 */
function registroExiste(nomeAba, nomeCampo, valorCampo) {
  return localizarRegistro(
    nomeAba,
    nomeCampo,
    valorCampo
  ) !== null;
}


/**
 * Conta registros de uma aba.
 */
function contarRegistros(nomeAba) {
  return listarRegistros(nomeAba).length;
}


/**
 * Exclui todos os dados, mantendo o cabeçalho.
 *
 * Deve ser usado somente durante testes ou manutenção.
 */
function limparDadosAba(nomeAba) {
  const aba = exigirAba(nomeAba);
  const ultimaLinha = aba.getLastRow();
  const ultimaColuna = aba.getLastColumn();

  if (ultimaLinha <= 1 || ultimaColuna === 0) {
    return;
  }

  aba
    .getRange(
      2,
      1,
      ultimaLinha - 1,
      ultimaColuna
    )
    .clearContent();
}


/**
 * Cria ou atualiza uma configuração.
 */
function salvarConfiguracao(
  chave,
  valor,
  descricao,
  usuario
) {
  const nomeAba = SLOG_ABAS.CONFIGURACOES.nome;

  const chaveNormalizada =
    normalizarParaComparacao(chave);

  exigirCampo(chaveNormalizada, 'Chave da configuração');

  const registroExistente = localizarRegistro(
    nomeAba,
    'CHAVE',
    chaveNormalizada
  );

  const dados = {
    CHAVE: chaveNormalizada,
    VALOR: valor,
    DESCRICAO: descricao || '',
    ATUALIZADO_EM: agora(),
    ATUALIZADO_POR:
      usuario || obterUsuarioAtual()
  };

  if (registroExistente) {
    atualizarRegistroPorLinha(
      nomeAba,
      registroExistente.__LINHA,
      dados
    );

    return dados;
  }

  inserirRegistro(nomeAba, dados);

  return dados;
}


/**
 * Retorna o valor de uma configuração.
 */
function obterConfiguracao(chave, valorPadrao) {
  const nomeAba = SLOG_ABAS.CONFIGURACOES.nome;

  if (!abaExiste(nomeAba)) {
    return valorPadrao === undefined
      ? null
      : valorPadrao;
  }

  const registro = localizarRegistro(
    nomeAba,
    'CHAVE',
    normalizarParaComparacao(chave)
  );

  if (!registro) {
    return valorPadrao === undefined
      ? null
      : valorPadrao;
  }

  return registro.VALOR;
}


/**
 * Registra uma ação na auditoria.
 */
function registrarAuditoria(
  acao,
  modulo,
  idRegistro,
  detalhes,
  usuario
) {
  const nomeAba = SLOG_ABAS.AUDITORIA.nome;

  if (!abaExiste(nomeAba)) {
    return null;
  }

  const dados = {
    ID_AUDITORIA: gerarId(
      SLOG_CONFIG.PREFIXOS.AUDITORIA
    ),
    DATA_HORA: agora(),
    USUARIO:
      usuario || obterUsuarioAtual(),
    ACAO: normalizarParaComparacao(acao),
    MODULO: normalizarParaComparacao(modulo),
    ID_REGISTRO: idRegistro || '',
    DETALHES_JSON: converterParaJsonSeguro(
      detalhes || {}
    )
  };

  inserirRegistro(nomeAba, dados);

  return dados;
}


/**
 * Retorna um resumo do banco de dados.
 */
function obterResumoBancoDados() {
  const resumo = {};

  obterEstruturasAbas().forEach(function(estrutura) {
    resumo[estrutura.nome] = {
      existe: abaExiste(estrutura.nome),
      registros: abaExiste(estrutura.nome)
        ? contarRegistros(estrutura.nome)
        : 0,
      cabecalhosCorretos: abaExiste(estrutura.nome)
        ? validarCabecalhosAba(
            estrutura.nome,
            estrutura.cabecalhos
          )
        : false
    };
  });

  return resumo;
}


/**
 * Teste isolado do banco de dados.
 *
 * Execute apenas após a instalação.
 */
function testarBancoDados() {
  const resumo = obterResumoBancoDados();

  console.log(
    JSON.stringify(resumo, null, 2)
  );

  exibirNotificacao(
    'Banco de dados validado.',
    'Teste SLOG OPS',
    5
  );

  return resumo;
}