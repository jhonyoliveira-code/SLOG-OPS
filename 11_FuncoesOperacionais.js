/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 11_FuncoesOperacionais.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Cadastro e gerenciamento das funções operacionais
 * utilizadas nas Ordens de Serviço, equipes e RDOs.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const MODULO_FUNCOES_OPERACIONAIS = Object.freeze({
  ABA: SLOG_ABAS.FUNCOES_OPERACIONAIS.nome,
  CAMPO_ID: 'ID_FUNCAO',
  CAMPO_NOME: 'FUNCAO',
  CAMPO_ORDEM: 'ORDEM',
  CAMPO_ATIVO: 'ATIVO',
  PREFIXO_ID: 'FUN',
  AUDITORIA: 'FUNCOES_OPERACIONAIS',
  VERSAO: '1.0.0'
});


/* =========================================================
 * CADASTRO
 * =========================================================
 */

/**
 * Cadastra uma função operacional.
 *
 * Exemplo:
 *
 * cadastrarFuncaoOperacional({
 *   funcao: 'Supervisor',
 *   ordem: 1
 * });
 */
function cadastrarFuncaoOperacional(dados) {
  try {
    dados = dados || {};

    const funcao = normalizarTexto(dados.funcao);

    exigirCampo(funcao, 'Função');

    validarDuplicidadeFuncaoOperacional_(
      funcao,
      ''
    );

    const ordem = definirOrdemFuncaoOperacional_(
      dados.ordem
    );

    const usuario = obterUsuarioAtual();

    const registro = {
      ID_FUNCAO: gerarIdSequencial(
        MODULO_FUNCOES_OPERACIONAIS.PREFIXO_ID,
        MODULO_FUNCOES_OPERACIONAIS.ABA,
        MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID
      ),

      FUNCAO: funcao,

      ORDEM: ordem,

      ATIVO: true,

      CRIADO_EM: agora(),

      CRIADO_POR: usuario,

      ATUALIZADO_EM: '',

      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      MODULO_FUNCOES_OPERACIONAIS.ABA,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      MODULO_FUNCOES_OPERACIONAIS.AUDITORIA,
      registro.ID_FUNCAO,
      {
        funcao: registro.FUNCAO,
        ordem: registro.ORDEM,
        ativo: registro.ATIVO
      },
      usuario
    );

    return respostaSucesso(
      'Função operacional cadastrada com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/* =========================================================
 * ATUALIZAÇÃO
 * =========================================================
 */

/**
 * Atualiza uma função operacional.
 *
 * Exemplo:
 *
 * atualizarFuncaoOperacional(
 *   'FUN0001',
 *   {
 *     funcao: 'Supervisor Operacional',
 *     ordem: 1
 *   }
 * );
 */
function atualizarFuncaoOperacional(
  idFuncao,
  dados
) {
  try {
    dados = dados || {};

    exigirCampo(
      idFuncao,
      'ID da função operacional'
    );

    const registroAtual = localizarRegistro(
      MODULO_FUNCOES_OPERACIONAIS.ABA,
      MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
      idFuncao
    );

    if (!registroAtual) {
      throw new Error(
        'Função operacional não encontrada.'
      );
    }

    const atualizacao = {};
    const usuario = obterUsuarioAtual();

    if (dados.funcao !== undefined) {
      const funcao = normalizarTexto(
        dados.funcao
      );

      exigirCampo(funcao, 'Função');

      validarDuplicidadeFuncaoOperacional_(
        funcao,
        idFuncao
      );

      atualizacao.FUNCAO = funcao;
    }

    if (dados.ordem !== undefined) {
      atualizacao.ORDEM =
        validarOrdemFuncaoOperacional_(
          dados.ordem
        );
    }

    const possuiAlteracao =
      Object.keys(atualizacao).length > 0;

    if (!possuiAlteracao) {
      throw new Error(
        'Nenhuma informação foi enviada para atualização.'
      );
    }

    atualizacao.ATUALIZADO_EM = agora();
    atualizacao.ATUALIZADO_POR = usuario;

    atualizarRegistroPorCampo(
      MODULO_FUNCOES_OPERACIONAIS.ABA,
      MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
      idFuncao,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      MODULO_FUNCOES_OPERACIONAIS.AUDITORIA,
      idFuncao,
      {
        dadosAnteriores: {
          funcao: registroAtual.FUNCAO,
          ordem: registroAtual.ORDEM
        },
        dadosAtualizados: atualizacao
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_FUNCOES_OPERACIONAIS.ABA,
        MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
        idFuncao
      );

    return respostaSucesso(
      'Função operacional atualizada com sucesso.',
      registroAtualizado
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/* =========================================================
 * ATIVAÇÃO E INATIVAÇÃO
 * =========================================================
 */

/**
 * Inativa uma função operacional.
 */
function inativarFuncaoOperacional(idFuncao) {
  return alterarSituacaoFuncaoOperacional_(
    idFuncao,
    false
  );
}


/**
 * Reativa uma função operacional.
 */
function reativarFuncaoOperacional(idFuncao) {
  return alterarSituacaoFuncaoOperacional_(
    idFuncao,
    true
  );
}


/**
 * Altera o campo ATIVO da função operacional.
 */
function alterarSituacaoFuncaoOperacional_(
  idFuncao,
  ativo
) {
  try {
    exigirCampo(
      idFuncao,
      'ID da função operacional'
    );

    const registro = localizarRegistro(
      MODULO_FUNCOES_OPERACIONAIS.ABA,
      MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
      idFuncao
    );

    if (!registro) {
      throw new Error(
        'Função operacional não encontrada.'
      );
    }

    const situacaoAtual =
      interpretarBooleanoFuncaoOperacional_(
        registro.ATIVO
      );

    if (situacaoAtual === ativo) {
      return respostaSucesso(
        ativo
          ? 'A função operacional já está ativa.'
          : 'A função operacional já está inativa.',
        registro
      );
    }

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      ATIVO: ativo,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      MODULO_FUNCOES_OPERACIONAIS.ABA,
      MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
      idFuncao,
      atualizacao
    );

    registrarAuditoria(
      ativo ? 'REATIVACAO' : 'INATIVACAO',
      MODULO_FUNCOES_OPERACIONAIS.AUDITORIA,
      idFuncao,
      {
        funcao: registro.FUNCAO,
        ativoAnterior: situacaoAtual,
        novoAtivo: ativo
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_FUNCOES_OPERACIONAIS.ABA,
        MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
        idFuncao
      );

    return respostaSucesso(
      ativo
        ? 'Função operacional reativada com sucesso.'
        : 'Função operacional inativada com sucesso.',
      registroAtualizado
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/* =========================================================
 * CONSULTAS
 * =========================================================
 */

/**
 * Lista todas as funções operacionais.
 *
 * Quando apenasAtivas for verdadeiro,
 * retorna somente funções ativas.
 */
function listarFuncoesOperacionais(
  apenasAtivas
) {
  const registros = listarRegistros(
    MODULO_FUNCOES_OPERACIONAIS.ABA
  );

  return registros
    .filter(function(registro) {
      if (!apenasAtivas) {
        return true;
      }

      return interpretarBooleanoFuncaoOperacional_(
        registro.ATIVO
      );
    })
    .sort(function(a, b) {
      const ordemA =
        Number(a.ORDEM) || 999999;

      const ordemB =
        Number(b.ORDEM) || 999999;

      if (ordemA !== ordemB) {
        return ordemA - ordemB;
      }

      return String(a.FUNCAO || '')
        .localeCompare(
          String(b.FUNCAO || ''),
          'pt-BR'
        );
    });
}


/**
 * Lista somente funções operacionais ativas.
 */
function listarFuncoesOperacionaisAtivas() {
  return listarFuncoesOperacionais(true);
}


/**
 * Lista todas as funções, incluindo inativas.
 */
function listarTodasFuncoesOperacionais() {
  return listarFuncoesOperacionais(false);
}


/**
 * Localiza uma função operacional pelo ID.
 */
function obterFuncaoOperacionalPorId(
  idFuncao
) {
  try {
    exigirCampo(
      idFuncao,
      'ID da função operacional'
    );

    const registro = localizarRegistro(
      MODULO_FUNCOES_OPERACIONAIS.ABA,
      MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
      idFuncao
    );

    if (!registro) {
      throw new Error(
        'Função operacional não encontrada.'
      );
    }

    return respostaSucesso(
      'Função operacional localizada com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Localiza uma função operacional pelo nome.
 */
function obterFuncaoOperacionalPorNome(
  nomeFuncao
) {
  try {
    const funcao = normalizarTexto(
      nomeFuncao
    );

    exigirCampo(funcao, 'Função');

    const registros =
      listarFuncoesOperacionais(false);

    const registro = registros.find(
      function(item) {
        return (
          normalizarParaComparacao(
            item.FUNCAO
          ) ===
          normalizarParaComparacao(
            funcao
          )
        );
      }
    );

    if (!registro) {
      throw new Error(
        'Função operacional não encontrada.'
      );
    }

    return respostaSucesso(
      'Função operacional localizada com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/* =========================================================
 * ORDENAÇÃO
 * =========================================================
 */

/**
 * Atualiza somente a ordem de uma função.
 */
function alterarOrdemFuncaoOperacional(
  idFuncao,
  novaOrdem
) {
  return atualizarFuncaoOperacional(
    idFuncao,
    {
      ordem: novaOrdem
    }
  );
}


/**
 * Reorganiza as funções ativas em sequência.
 *
 * Exemplo:
 * 1, 2, 5, 9 passa a ser 1, 2, 3, 4.
 */
function reorganizarOrdemFuncoesOperacionais() {
  try {
    const registros =
      listarFuncoesOperacionaisAtivas();

    const usuario = obterUsuarioAtual();
    let atualizados = 0;

    registros.forEach(function(
      registro,
      indice
    ) {
      const novaOrdem = indice + 1;
      const ordemAtual =
        Number(registro.ORDEM);

      if (ordemAtual === novaOrdem) {
        return;
      }

      atualizarRegistroPorCampo(
        MODULO_FUNCOES_OPERACIONAIS.ABA,
        MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
        registro.ID_FUNCAO,
        {
          ORDEM: novaOrdem,
          ATUALIZADO_EM: agora(),
          ATUALIZADO_POR: usuario
        }
      );

      atualizados++;
    });

    registrarAuditoria(
      'REORGANIZACAO_ORDEM',
      MODULO_FUNCOES_OPERACIONAIS.AUDITORIA,
      '',
      {
        totalRegistros:
          registros.length,
        totalAtualizados:
          atualizados
      },
      usuario
    );

    return respostaSucesso(
      'Ordem das funções operacionais reorganizada com sucesso.',
      {
        totalRegistros: registros.length,
        totalAtualizados: atualizados
      }
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/* =========================================================
 * CARGA INICIAL
 * =========================================================
 */

/**
 * Cadastra as funções operacionais iniciais.
 *
 * Pode ser executada mais de uma vez.
 * Não cria registros duplicados.
 */
function popularFuncoesOperacionaisPadrao() {
  try {
    const funcoesPadrao = [
      {
        funcao: 'Supervisor',
        ordem: 1
      },
      {
        funcao: 'Ajudante',
        ordem: 2
      },
      {
        funcao: 'Ajudante N1',
        ordem: 3
      },
      {
        funcao: 'Ajudante N2',
        ordem: 4
      },
      {
        funcao: 'Ajudante N3',
        ordem: 5
      },
      {
        funcao: 'Resgatista',
        ordem: 6
      },
      {
        funcao: 'Vigia',
        ordem: 7
      }
    ];

    const cadastradas = [];
    const existentes = [];
    const reativadas = [];
    const erros = [];

    funcoesPadrao.forEach(function(
      itemPadrao
    ) {
      const registros =
        listarFuncoesOperacionais(false);

      const registroExistente =
        registros.find(function(registro) {
          return (
            normalizarParaComparacao(
              registro.FUNCAO
            ) ===
            normalizarParaComparacao(
              itemPadrao.funcao
            )
          );
        });

      if (!registroExistente) {
        const resultadoCadastro =
          cadastrarFuncaoOperacional({
            funcao: itemPadrao.funcao,
            ordem: itemPadrao.ordem
          });

        if (resultadoCadastro.sucesso) {
          cadastradas.push(
            itemPadrao.funcao
          );
        } else {
          erros.push({
            funcao: itemPadrao.funcao,
            mensagem:
              resultadoCadastro.mensagem
          });
        }

        return;
      }

      const atualizacao = {};

      if (
        Number(registroExistente.ORDEM) !==
        Number(itemPadrao.ordem)
      ) {
        atualizacao.ordem =
          itemPadrao.ordem;
      }

      if (
        Object.keys(atualizacao).length > 0
      ) {
        const resultadoAtualizacao =
          atualizarFuncaoOperacional(
            registroExistente.ID_FUNCAO,
            atualizacao
          );

        if (!resultadoAtualizacao.sucesso) {
          erros.push({
            funcao: itemPadrao.funcao,
            mensagem:
              resultadoAtualizacao.mensagem
          });

          return;
        }
      }

      const estaAtiva =
        interpretarBooleanoFuncaoOperacional_(
          registroExistente.ATIVO
        );

      if (!estaAtiva) {
        const resultadoReativacao =
          reativarFuncaoOperacional(
            registroExistente.ID_FUNCAO
          );

        if (resultadoReativacao.sucesso) {
          reativadas.push(
            itemPadrao.funcao
          );
        } else {
          erros.push({
            funcao: itemPadrao.funcao,
            mensagem:
              resultadoReativacao.mensagem
          });
        }

        return;
      }

      existentes.push(itemPadrao.funcao);
    });

    if (erros.length > 0) {
      throw new Error(
        'A carga inicial foi concluída com erros: ' +
        JSON.stringify(erros)
      );
    }

    return respostaSucesso(
      'Carga inicial de funções operacionais concluída.',
      {
        cadastradas: cadastradas,
        reativadas: reativadas,
        existentes: existentes,
        totalAtivas:
          listarFuncoesOperacionaisAtivas()
            .length
      }
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/* =========================================================
 * FUNÇÕES INTERNAS
 * =========================================================
 */

/**
 * Valida se já existe outra função com o mesmo nome.
 */
function validarDuplicidadeFuncaoOperacional_(
  funcao,
  idIgnorado
) {
  const registros = listarRegistros(
    MODULO_FUNCOES_OPERACIONAIS.ABA
  );

  const duplicado = registros.some(
    function(registro) {
      const mesmoNome =
        normalizarParaComparacao(
          registro.FUNCAO
        ) ===
        normalizarParaComparacao(
          funcao
        );

      const outroRegistro =
        normalizarParaComparacao(
          registro.ID_FUNCAO
        ) !==
        normalizarParaComparacao(
          idIgnorado
        );

      return mesmoNome && outroRegistro;
    }
  );

  if (duplicado) {
    throw new Error(
      'Já existe uma função operacional com este nome.'
    );
  }
}


/**
 * Define a ordem no cadastro.
 */
function definirOrdemFuncaoOperacional_(
  ordemInformada
) {
  if (
    ordemInformada === undefined ||
    ordemInformada === null ||
    String(ordemInformada).trim() === ''
  ) {
    return obterProximaOrdemFuncaoOperacional_();
  }

  return validarOrdemFuncaoOperacional_(
    ordemInformada
  );
}


/**
 * Valida o valor da ordem.
 */
function validarOrdemFuncaoOperacional_(
  ordem
) {
  const numero = Number(ordem);

  if (
    !Number.isFinite(numero) ||
    numero <= 0 ||
    Math.floor(numero) !== numero
  ) {
    throw new Error(
      'A ordem deve ser um número inteiro maior que zero.'
    );
  }

  return numero;
}


/**
 * Retorna a próxima ordem disponível.
 */
function obterProximaOrdemFuncaoOperacional_() {
  const registros = listarRegistros(
    MODULO_FUNCOES_OPERACIONAIS.ABA
  );

  let maiorOrdem = 0;

  registros.forEach(function(registro) {
    const ordem = Number(registro.ORDEM);

    if (
      Number.isFinite(ordem) &&
      ordem > maiorOrdem
    ) {
      maiorOrdem = ordem;
    }
  });

  return maiorOrdem + 1;
}


/**
 * Interpreta valores armazenados na coluna ATIVO.
 */
function interpretarBooleanoFuncaoOperacional_(
  valor
) {
  if (valor === true) {
    return true;
  }

  if (
    valor === false ||
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return false;
  }

  const texto =
    normalizarParaComparacao(valor);

  return [
    'TRUE',
    'VERDADEIRO',
    'SIM',
    'S',
    '1',
    'ATIVO'
  ].indexOf(texto) !== -1;
}


/* =========================================================
 * TESTES
 * =========================================================
 */

/**
 * Verifica o carregamento do módulo.
 *
 * Não cria nem altera registros.
 */
function testarModuloFuncoesOperacionais() {
  const funcoesDisponiveis = {
    cadastrar:
      typeof cadastrarFuncaoOperacional ===
      'function',

    atualizar:
      typeof atualizarFuncaoOperacional ===
      'function',

    inativar:
      typeof inativarFuncaoOperacional ===
      'function',

    reativar:
      typeof reativarFuncaoOperacional ===
      'function',

    listar:
      typeof listarFuncoesOperacionais ===
      'function',

    popular:
      typeof popularFuncoesOperacionaisPadrao ===
      'function'
  };

  const resultado = {
    sucesso: true,

    modulo:
      MODULO_FUNCOES_OPERACIONAIS.AUDITORIA,

    versao:
      MODULO_FUNCOES_OPERACIONAIS.VERSAO,

    aba:
      MODULO_FUNCOES_OPERACIONAIS.ABA,

    abaExiste:
      abaExiste(
        MODULO_FUNCOES_OPERACIONAIS.ABA
      ),

    funcoesDisponiveis:
      funcoesDisponiveis,

    carregadoEm:
      formatarDataHora(agora())
  };

  resultado.sucesso =
    resultado.abaExiste &&
    Object.keys(funcoesDisponiveis)
      .every(function(chave) {
        return (
          funcoesDisponiveis[chave] === true
        );
      });

  console.log(
    JSON.stringify(resultado, null, 2)
  );

  if (!resultado.sucesso) {
    throw new Error(
      'O módulo de funções operacionais possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de funções operacionais carregado corretamente.',
    'SLOG OPS',
    5
  );

  return resultado;
}


/**
 * Testa cadastro, atualização, inativação
 * e reativação.
 *
 * O registro de teste termina inativo.
 */
function testarCrudFuncoesOperacionais() {
  const identificador =
    new Date().getTime();

  const nomeInicial =
    'TESTE FUNCAO ' + identificador;

  const nomeAtualizado =
    'TESTE FUNCAO ATUALIZADA ' +
    identificador;

  const etapas = {};
  let idFuncao = '';

  try {
    etapas.cadastro =
      cadastrarFuncaoOperacional({
        funcao: nomeInicial
      });

    if (!etapas.cadastro.sucesso) {
      throw new Error(
        etapas.cadastro.mensagem ||
        'Falha no cadastro.'
      );
    }

    idFuncao =
      etapas.cadastro.dados.ID_FUNCAO;

    etapas.atualizacao =
      atualizarFuncaoOperacional(
        idFuncao,
        {
          funcao: nomeAtualizado
        }
      );

    if (!etapas.atualizacao.sucesso) {
      throw new Error(
        etapas.atualizacao.mensagem ||
        'Falha na atualização.'
      );
    }

    etapas.inativacao =
      inativarFuncaoOperacional(
        idFuncao
      );

    if (!etapas.inativacao.sucesso) {
      throw new Error(
        etapas.inativacao.mensagem ||
        'Falha na inativação.'
      );
    }

    etapas.reativacao =
      reativarFuncaoOperacional(
        idFuncao
      );

    if (!etapas.reativacao.sucesso) {
      throw new Error(
        etapas.reativacao.mensagem ||
        'Falha na reativação.'
      );
    }

    etapas.inativacaoFinal =
      inativarFuncaoOperacional(
        idFuncao
      );

    if (!etapas.inativacaoFinal.sucesso) {
      throw new Error(
        etapas.inativacaoFinal.mensagem ||
        'Falha na inativação final.'
      );
    }

    const registroFinal =
      localizarRegistro(
        MODULO_FUNCOES_OPERACIONAIS.ABA,
        MODULO_FUNCOES_OPERACIONAIS.CAMPO_ID,
        idFuncao
      );

    if (
      interpretarBooleanoFuncaoOperacional_(
        registroFinal.ATIVO
      )
    ) {
      throw new Error(
        'O registro de teste deveria terminar inativo.'
      );
    }

    const resultado = {
      sucesso: true,
      idFuncao: idFuncao,
      nomeFinal: registroFinal.FUNCAO,
      ordemFinal: registroFinal.ORDEM,
      ativoFinal: false,
      etapas: etapas
    };

    console.log(
      JSON.stringify(resultado, null, 2)
    );

    exibirNotificacao(
      'CRUD de funções operacionais testado com sucesso.',
      'SLOG OPS',
      5
    );

    return resultado;
  } catch (erro) {
    if (idFuncao) {
      try {
        inativarFuncaoOperacional(
          idFuncao
        );
      } catch (erroLimpeza) {
        console.error(
          erroLimpeza
        );
      }
    }

    const resultadoErro = {
      sucesso: false,
      mensagem:
        erro && erro.message
          ? erro.message
          : String(erro),
      idFuncao: idFuncao,
      etapas: etapas
    };

    console.error(
      JSON.stringify(
        resultadoErro,
        null,
        2
      )
    );

    throw erro;
  }
}


/**
 * Executa os testes principais do módulo.
 */
function testarTudoFuncoesOperacionais() {
  const modulo =
    testarModuloFuncoesOperacionais();

  const cargaInicial =
    popularFuncoesOperacionaisPadrao();

  if (!cargaInicial.sucesso) {
    throw new Error(
      cargaInicial.mensagem ||
      'Falha na carga inicial.'
    );
  }

  const crud =
    testarCrudFuncoesOperacionais();

  const resultado = {
    sucesso: true,
    modulo: modulo,
    cargaInicial: cargaInicial,
    crud: crud
  };

  console.log(
    JSON.stringify(resultado, null, 2)
  );

  return resultado;
}