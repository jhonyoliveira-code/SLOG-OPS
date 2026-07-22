/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 15_AtividadesPadrao.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Cadastro e gerenciamento das atividades padrão
 * utilizadas no preenchimento dos RDOs.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const MODULO_ATIVIDADES_PADRAO = Object.freeze({
  ABA: SLOG_ABAS.ATIVIDADES_PADRAO.nome,
  CAMPO_ID: 'ID_ATIVIDADE',
  CAMPO_NOME: 'ATIVIDADE',
  CAMPO_ORDEM: 'ORDEM',
  CAMPO_ATIVO: 'ATIVO',
  PREFIXO_ID: 'ATI',
  AUDITORIA: 'ATIVIDADES_PADRAO',
  VERSAO: '1.0.0'
});


/* =========================================================
 * CADASTRO
 * =========================================================
 */

/**
 * Cadastra uma atividade padrão.
 *
 * Exemplo:
 *
 * cadastrarAtividadePadrao({
 *   atividade: 'Raspagem',
 *   ordem: 10
 * });
 */
function cadastrarAtividadePadrao(dados) {
  try {
    dados = dados || {};

    const atividade = normalizarTexto(
      dados.atividade
    );

    exigirCampo(
      atividade,
      'Atividade'
    );

    validarDuplicidadeAtividadePadrao_(
      atividade,
      ''
    );

    const ordem = definirOrdemAtividadePadrao_(
      dados.ordem
    );

    const usuario = obterUsuarioAtual();

    const registro = {
      ID_ATIVIDADE: gerarIdSequencial(
        MODULO_ATIVIDADES_PADRAO.PREFIXO_ID,
        MODULO_ATIVIDADES_PADRAO.ABA,
        MODULO_ATIVIDADES_PADRAO.CAMPO_ID
      ),

      ATIVIDADE: atividade,

      ORDEM: ordem,

      ATIVO: true,

      CRIADO_EM: agora(),

      CRIADO_POR: usuario,

      ATUALIZADO_EM: '',

      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      MODULO_ATIVIDADES_PADRAO.ABA,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      MODULO_ATIVIDADES_PADRAO.AUDITORIA,
      registro.ID_ATIVIDADE,
      {
        atividade: registro.ATIVIDADE,
        ordem: registro.ORDEM,
        ativo: registro.ATIVO
      },
      usuario
    );

    return respostaSucesso(
      'Atividade padrão cadastrada com sucesso.',
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
 * Atualiza uma atividade padrão.
 */
function atualizarAtividadePadrao(
  idAtividade,
  dados
) {
  try {
    dados = dados || {};

    exigirCampo(
      idAtividade,
      'ID da atividade'
    );

    const registroAtual = localizarRegistro(
      MODULO_ATIVIDADES_PADRAO.ABA,
      MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
      idAtividade
    );

    if (!registroAtual) {
      throw new Error(
        'Atividade padrão não encontrada.'
      );
    }

    const atualizacao = {};
    const usuario = obterUsuarioAtual();

    if (dados.atividade !== undefined) {
      const atividade = normalizarTexto(
        dados.atividade
      );

      exigirCampo(
        atividade,
        'Atividade'
      );

      validarDuplicidadeAtividadePadrao_(
        atividade,
        idAtividade
      );

      atualizacao.ATIVIDADE = atividade;
    }

    if (dados.ordem !== undefined) {
      atualizacao.ORDEM =
        validarOrdemAtividadePadrao_(
          dados.ordem
        );
    }

    if (
      Object.keys(atualizacao).length === 0
    ) {
      throw new Error(
        'Nenhuma informação foi enviada para atualização.'
      );
    }

    atualizacao.ATUALIZADO_EM = agora();
    atualizacao.ATUALIZADO_POR = usuario;

    atualizarRegistroPorCampo(
      MODULO_ATIVIDADES_PADRAO.ABA,
      MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
      idAtividade,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      MODULO_ATIVIDADES_PADRAO.AUDITORIA,
      idAtividade,
      {
        dadosAnteriores: {
          atividade: registroAtual.ATIVIDADE,
          ordem: registroAtual.ORDEM
        },
        dadosAtualizados: atualizacao
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_ATIVIDADES_PADRAO.ABA,
        MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
        idAtividade
      );

    return respostaSucesso(
      'Atividade padrão atualizada com sucesso.',
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

function inativarAtividadePadrao(
  idAtividade
) {
  return alterarSituacaoAtividadePadrao_(
    idAtividade,
    false
  );
}


function reativarAtividadePadrao(
  idAtividade
) {
  return alterarSituacaoAtividadePadrao_(
    idAtividade,
    true
  );
}


/**
 * Altera o campo ATIVO da atividade.
 */
function alterarSituacaoAtividadePadrao_(
  idAtividade,
  ativo
) {
  try {
    exigirCampo(
      idAtividade,
      'ID da atividade'
    );

    const registro = localizarRegistro(
      MODULO_ATIVIDADES_PADRAO.ABA,
      MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
      idAtividade
    );

    if (!registro) {
      throw new Error(
        'Atividade padrão não encontrada.'
      );
    }

    const situacaoAtual =
      interpretarBooleanoAtividadePadrao_(
        registro.ATIVO
      );

    if (situacaoAtual === ativo) {
      return respostaSucesso(
        ativo
          ? 'A atividade padrão já está ativa.'
          : 'A atividade padrão já está inativa.',
        registro
      );
    }

    const usuario = obterUsuarioAtual();

    atualizarRegistroPorCampo(
      MODULO_ATIVIDADES_PADRAO.ABA,
      MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
      idAtividade,
      {
        ATIVO: ativo,
        ATUALIZADO_EM: agora(),
        ATUALIZADO_POR: usuario
      }
    );

    registrarAuditoria(
      ativo ? 'REATIVACAO' : 'INATIVACAO',
      MODULO_ATIVIDADES_PADRAO.AUDITORIA,
      idAtividade,
      {
        atividade: registro.ATIVIDADE,
        ativoAnterior: situacaoAtual,
        novoAtivo: ativo
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_ATIVIDADES_PADRAO.ABA,
        MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
        idAtividade
      );

    return respostaSucesso(
      ativo
        ? 'Atividade padrão reativada com sucesso.'
        : 'Atividade padrão inativada com sucesso.',
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
 * Lista as atividades padrão.
 *
 * Quando apenasAtivas for verdadeiro,
 * retorna somente registros ativos.
 */
function listarAtividadesPadrao(
  apenasAtivas
) {
  const registros = listarRegistros(
    MODULO_ATIVIDADES_PADRAO.ABA
  );

  return registros
    .filter(function(registro) {
      if (!apenasAtivas) {
        return true;
      }

      return interpretarBooleanoAtividadePadrao_(
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

      return String(
        a.ATIVIDADE || ''
      ).localeCompare(
        String(
          b.ATIVIDADE || ''
        ),
        'pt-BR'
      );
    });
}


function listarAtividadesPadraoAtivas() {
  return listarAtividadesPadrao(true);
}


function listarTodasAtividadesPadrao() {
  return listarAtividadesPadrao(false);
}


/**
 * Localiza uma atividade pelo ID.
 */
function obterAtividadePadraoPorId(
  idAtividade
) {
  try {
    exigirCampo(
      idAtividade,
      'ID da atividade'
    );

    const registro = localizarRegistro(
      MODULO_ATIVIDADES_PADRAO.ABA,
      MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
      idAtividade
    );

    if (!registro) {
      throw new Error(
        'Atividade padrão não encontrada.'
      );
    }

    return respostaSucesso(
      'Atividade padrão localizada com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Localiza uma atividade pelo nome.
 */
function obterAtividadePadraoPorNome(
  nomeAtividade
) {
  try {
    const atividade = normalizarTexto(
      nomeAtividade
    );

    exigirCampo(
      atividade,
      'Atividade'
    );

    const registros =
      listarAtividadesPadrao(false);

    const registro = registros.find(
      function(item) {
        return (
          normalizarParaComparacao(
            item.ATIVIDADE
          ) ===
          normalizarParaComparacao(
            atividade
          )
        );
      }
    );

    if (!registro) {
      throw new Error(
        'Atividade padrão não encontrada.'
      );
    }

    return respostaSucesso(
      'Atividade padrão localizada com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Verifica se uma atividade está ativa.
 */
function atividadePadraoEstaAtiva(
  idAtividade
) {
  try {
    exigirCampo(
      idAtividade,
      'ID da atividade'
    );

    const registro = localizarRegistro(
      MODULO_ATIVIDADES_PADRAO.ABA,
      MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
      idAtividade
    );

    if (!registro) {
      throw new Error(
        'Atividade padrão não encontrada.'
      );
    }

    return respostaSucesso(
      'Situação da atividade consultada.',
      {
        idAtividade:
          registro.ID_ATIVIDADE,

        atividade:
          registro.ATIVIDADE,

        ativo:
          interpretarBooleanoAtividadePadrao_(
            registro.ATIVO
          )
      }
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
 * Atualiza somente a ordem da atividade.
 */
function alterarOrdemAtividadePadrao(
  idAtividade,
  novaOrdem
) {
  return atualizarAtividadePadrao(
    idAtividade,
    {
      ordem: novaOrdem
    }
  );
}


/**
 * Reorganiza as atividades ativas em sequência.
 */
function reorganizarOrdemAtividadesPadrao() {
  try {
    const registros =
      listarAtividadesPadraoAtivas();

    const usuario = obterUsuarioAtual();
    let totalAtualizados = 0;

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
        MODULO_ATIVIDADES_PADRAO.ABA,
        MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
        registro.ID_ATIVIDADE,
        {
          ORDEM: novaOrdem,
          ATUALIZADO_EM: agora(),
          ATUALIZADO_POR: usuario
        }
      );

      totalAtualizados++;
    });

    registrarAuditoria(
      'REORGANIZACAO_ORDEM',
      MODULO_ATIVIDADES_PADRAO.AUDITORIA,
      '',
      {
        totalRegistros: registros.length,
        totalAtualizados: totalAtualizados
      },
      usuario
    );

    return respostaSucesso(
      'Ordem das atividades reorganizada com sucesso.',
      {
        totalRegistros: registros.length,
        totalAtualizados: totalAtualizados
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
 * Cadastra as atividades padrão iniciais.
 *
 * Pode ser executada várias vezes sem duplicar.
 */
function popularAtividadesPadrao() {
  try {
    const atividadesPadrao = [
      {
        atividade: 'DDS',
        ordem: 1
      },
      {
        atividade: 'Mobilização',
        ordem: 2
      },
      {
        atividade: 'Aguardando PT',
        ordem: 3
      },
      {
        atividade: 'Aguardando PET',
        ordem: 4
      },
      {
        atividade: 'Isolamento da Área',
        ordem: 5
      },
      {
        atividade: 'Preparação da Área',
        ordem: 6
      },
      {
        atividade: 'Abertura do Tanque',
        ordem: 7
      },
      {
        atividade: 'Ventilação',
        ordem: 8
      },
      {
        atividade: 'Monitoramento de Gases',
        ordem: 9
      },
      {
        atividade: 'Inspeção Inicial',
        ordem: 10
      },
      {
        atividade: 'Entrada no Espaço Confinado',
        ordem: 11
      },
      {
        atividade: 'Raspagem',
        ordem: 12
      },
      {
        atividade: 'Lavagem',
        ordem: 13
      },
      {
        atividade: 'Hidrojateamento',
        ordem: 14
      },
      {
        atividade: 'Trapeamento',
        ordem: 15
      },
      {
        atividade: 'Aspiração',
        ordem: 16
      },
      {
        atividade: 'Ensacamento',
        ordem: 17
      },
      {
        atividade: 'Tamboramento',
        ordem: 18
      },
      {
        atividade: 'Cambagem',
        ordem: 19
      },
      {
        atividade: 'Içamento',
        ordem: 20
      },
      {
        atividade: 'Remoção de Resíduos',
        ordem: 21
      },
      {
        atividade: 'Limpeza Final',
        ordem: 22
      },
      {
        atividade: 'Inspeção Final',
        ordem: 23
      },
      {
        atividade: 'Intervalo',
        ordem: 24
      },
      {
        atividade: 'Stand-by',
        ordem: 25
      },
      {
        atividade: 'Simulado de Resgate',
        ordem: 26
      },
      {
        atividade: 'Desmobilização',
        ordem: 27
      },
      {
        atividade: 'Encerramento',
        ordem: 28
      },
      {
        atividade: 'Outro',
        ordem: 29
      }
    ];

    const cadastradas = [];
    const existentes = [];
    const reativadas = [];
    const atualizadas = [];
    const erros = [];

    atividadesPadrao.forEach(function(
      itemPadrao
    ) {
      const registros =
        listarAtividadesPadrao(false);

      const registroExistente =
        registros.find(function(registro) {
          return (
            normalizarParaComparacao(
              registro.ATIVIDADE
            ) ===
            normalizarParaComparacao(
              itemPadrao.atividade
            )
          );
        });

      if (!registroExistente) {
        const resultadoCadastro =
  executarComTentativasAtividadePadrao_(
    function() {
      return cadastrarAtividadePadrao({
        atividade:
          itemPadrao.atividade,
        ordem:
          itemPadrao.ordem
      });
    },
    3
  );

        if (resultadoCadastro.sucesso) {
          cadastradas.push(
            itemPadrao.atividade
          );
        } else {
          erros.push({
            atividade:
              itemPadrao.atividade,
            mensagem:
              resultadoCadastro.mensagem
          });
        }

        return;
      }

      if (
        Number(registroExistente.ORDEM) !==
        Number(itemPadrao.ordem)
      ) {
        const resultadoAtualizacao =
  executarComTentativasAtividadePadrao_(
    function() {
      return atualizarAtividadePadrao(
        registroExistente.ID_ATIVIDADE,
        {
          ordem:
            itemPadrao.ordem
        }
      );
    },
    3
  );

        if (resultadoAtualizacao.sucesso) {
          atualizadas.push(
            itemPadrao.atividade
          );
        } else {
          erros.push({
            atividade:
              itemPadrao.atividade,
            mensagem:
              resultadoAtualizacao.mensagem
          });

          return;
        }
      }

      const estaAtiva =
        interpretarBooleanoAtividadePadrao_(
          registroExistente.ATIVO
        );

      if (!estaAtiva) {
        const resultadoReativacao =
  executarComTentativasAtividadePadrao_(
    function() {
      return reativarAtividadePadrao(
        registroExistente.ID_ATIVIDADE
      );
    },
    3
  );

        if (resultadoReativacao.sucesso) {
          reativadas.push(
            itemPadrao.atividade
          );
        } else {
          erros.push({
            atividade:
              itemPadrao.atividade,
            mensagem:
              resultadoReativacao.mensagem
          });
        }

        return;
      }

      existentes.push(
        itemPadrao.atividade
      );
    });

    if (erros.length > 0) {
      throw new Error(
        'A carga inicial foi concluída com erros: ' +
        JSON.stringify(erros)
      );
    }

    return respostaSucesso(
      'Carga inicial de atividades padrão concluída.',
      {
        cadastradas: cadastradas,
        reativadas: reativadas,
        atualizadas: atualizadas,
        existentes: existentes,
        totalAtivas:
          listarAtividadesPadraoAtivas()
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
 * Valida duplicidade pelo nome.
 */
function validarDuplicidadeAtividadePadrao_(
  atividade,
  idIgnorado
) {
  const registros = listarRegistros(
    MODULO_ATIVIDADES_PADRAO.ABA
  );

  const duplicado = registros.some(
    function(registro) {
      const mesmoNome =
        normalizarParaComparacao(
          registro.ATIVIDADE
        ) ===
        normalizarParaComparacao(
          atividade
        );

      const outroRegistro =
        normalizarParaComparacao(
          registro.ID_ATIVIDADE
        ) !==
        normalizarParaComparacao(
          idIgnorado
        );

      return mesmoNome && outroRegistro;
    }
  );

  if (duplicado) {
    throw new Error(
      'Já existe uma atividade padrão com este nome.'
    );
  }
}


/**
 * Define a ordem no cadastro.
 */
function definirOrdemAtividadePadrao_(
  ordemInformada
) {
  if (
    ordemInformada === undefined ||
    ordemInformada === null ||
    String(ordemInformada).trim() === ''
  ) {
    return obterProximaOrdemAtividadePadrao_();
  }

  return validarOrdemAtividadePadrao_(
    ordemInformada
  );
}


/**
 * Valida a ordem.
 */
function validarOrdemAtividadePadrao_(
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
function obterProximaOrdemAtividadePadrao_() {
  const registros = listarRegistros(
    MODULO_ATIVIDADES_PADRAO.ABA
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
 * Interpreta o valor da coluna ATIVO.
 */
function interpretarBooleanoAtividadePadrao_(
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
 * Testa o carregamento do módulo.
 */
function testarModuloAtividadesPadrao() {
  const funcoesDisponiveis = {
    cadastrar:
      typeof cadastrarAtividadePadrao ===
      'function',

    atualizar:
      typeof atualizarAtividadePadrao ===
      'function',

    inativar:
      typeof inativarAtividadePadrao ===
      'function',

    reativar:
      typeof reativarAtividadePadrao ===
      'function',

    listar:
      typeof listarAtividadesPadrao ===
      'function',

    popular:
      typeof popularAtividadesPadrao ===
      'function'
  };

  const resultado = {
    sucesso: true,

    modulo:
      MODULO_ATIVIDADES_PADRAO.AUDITORIA,

    versao:
      MODULO_ATIVIDADES_PADRAO.VERSAO,

    aba:
      MODULO_ATIVIDADES_PADRAO.ABA,

    abaExiste:
      abaExiste(
        MODULO_ATIVIDADES_PADRAO.ABA
      ),

    funcoesDisponiveis:
      funcoesDisponiveis,

    carregadoEm:
      formatarDataHora(agora())
  };

  resultado.sucesso =
    resultado.abaExiste &&
    Object.keys(
      funcoesDisponiveis
    ).every(function(chave) {
      return (
        funcoesDisponiveis[chave] ===
        true
      );
    });

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  if (!resultado.sucesso) {
    throw new Error(
      'O módulo de atividades padrão possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de atividades padrão carregado corretamente.',
    'SLOG OPS',
    5
  );

  return resultado;
}


/**
 * Testa o CRUD completo.
 *
 * O registro de teste termina inativo.
 */
function testarCrudAtividadesPadrao() {
  const identificador =
    new Date().getTime();

  const nomeInicial =
    'TESTE ATIVIDADE ' +
    identificador;

  const nomeAtualizado =
    'TESTE ATIVIDADE ATUALIZADA ' +
    identificador;

  const etapas = {};
  let idAtividade = '';

  try {
    etapas.cadastro =
      cadastrarAtividadePadrao({
        atividade: nomeInicial
      });

    if (!etapas.cadastro.sucesso) {
      throw new Error(
        etapas.cadastro.mensagem ||
        'Falha no cadastro.'
      );
    }

    idAtividade =
      etapas.cadastro
        .dados
        .ID_ATIVIDADE;

    etapas.atualizacao =
      atualizarAtividadePadrao(
        idAtividade,
        {
          atividade:
            nomeAtualizado,
          ordem:
            Number(
              etapas.cadastro.dados.ORDEM
            ) + 1
        }
      );

    if (!etapas.atualizacao.sucesso) {
      throw new Error(
        etapas.atualizacao.mensagem ||
        'Falha na atualização.'
      );
    }

    etapas.inativacao =
      inativarAtividadePadrao(
        idAtividade
      );

    if (!etapas.inativacao.sucesso) {
      throw new Error(
        etapas.inativacao.mensagem ||
        'Falha na inativação.'
      );
    }

    etapas.reativacao =
      reativarAtividadePadrao(
        idAtividade
      );

    if (!etapas.reativacao.sucesso) {
      throw new Error(
        etapas.reativacao.mensagem ||
        'Falha na reativação.'
      );
    }

    etapas.inativacaoFinal =
      inativarAtividadePadrao(
        idAtividade
      );

    if (
      !etapas.inativacaoFinal.sucesso
    ) {
      throw new Error(
        etapas.inativacaoFinal.mensagem ||
        'Falha na inativação final.'
      );
    }

    const registroFinal =
      localizarRegistro(
        MODULO_ATIVIDADES_PADRAO.ABA,
        MODULO_ATIVIDADES_PADRAO.CAMPO_ID,
        idAtividade
      );

    if (
      interpretarBooleanoAtividadePadrao_(
        registroFinal.ATIVO
      )
    ) {
      throw new Error(
        'O registro deveria terminar inativo.'
      );
    }

    const resultado = {
      sucesso: true,

      idAtividade:
        idAtividade,

      nomeFinal:
        registroFinal.ATIVIDADE,

      ordemFinal:
        registroFinal.ORDEM,

      ativoFinal:
        false,

      etapas:
        etapas
    };

    console.log(
      JSON.stringify(
        resultado,
        null,
        2
      )
    );

    exibirNotificacao(
      'CRUD de atividades padrão testado com sucesso.',
      'SLOG OPS',
      5
    );

    return resultado;
  } catch (erro) {
    if (idAtividade) {
      try {
        inativarAtividadePadrao(
          idAtividade
        );
      } catch (erroLimpeza) {
        console.error(
          erroLimpeza
        );
      }
    }

    console.error(
      JSON.stringify(
        {
          sucesso: false,
          mensagem:
            erro && erro.message
              ? erro.message
              : String(erro),
          idAtividade:
            idAtividade,
          etapas:
            etapas
        },
        null,
        2
      )
    );

    throw erro;
  }
}


/**
 * Executa os testes principais.
 */
function testarTudoAtividadesPadrao() {
  const modulo =
    testarModuloAtividadesPadrao();

  const cargaInicial =
    popularAtividadesPadrao();

  if (!cargaInicial.sucesso) {
    throw new Error(
      cargaInicial.mensagem ||
      'Falha na carga inicial.'
    );
  }

  const crud =
    testarCrudAtividadesPadrao();

  const resultado = {
    sucesso: true,
    modulo: modulo,
    cargaInicial: cargaInicial,
    crud: crud
  };

  console.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  return resultado;
}
/**
 * Executa uma operação novamente quando ocorrer
 * erro temporário dos serviços do Google.
 */
function executarComTentativasAtividadePadrao_(
  operacao,
  quantidadeTentativas
) {
  const totalTentativas =
    quantidadeTentativas || 3;

  let ultimoErro = null;

  for (
    let tentativa = 1;
    tentativa <= totalTentativas;
    tentativa++
  ) {
    try {
      const resultado = operacao();

      if (
        resultado &&
        resultado.sucesso === false
      ) {
        const mensagem = String(
          resultado.mensagem || ''
        );

        const erroTemporario =
          mensagem.indexOf(
            'server error occurred'
          ) !== -1 ||
          mensagem.indexOf(
            'Service invoked too many times'
          ) !== -1 ||
          mensagem.indexOf(
            'Internal error'
          ) !== -1 ||
          mensagem.indexOf(
            'Timeout'
          ) !== -1;

        if (!erroTemporario) {
          return resultado;
        }

        ultimoErro = new Error(mensagem);
      } else {
        return resultado;
      }
    } catch (erro) {
      ultimoErro = erro;
    }

    if (tentativa < totalTentativas) {
      Utilities.sleep(
        tentativa * 1500
      );
    }
  }

  return respostaErro(
    ultimoErro ||
    new Error(
      'A operação não pôde ser concluída.'
    )
  );
}