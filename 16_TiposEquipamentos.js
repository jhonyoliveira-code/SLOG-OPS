/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 16_TiposEquipamento.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Cadastro e gerenciamento dos tipos de equipamento
 * utilizados nas Ordens de Serviço e nos RDOs.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const MODULO_TIPOS_EQUIPAMENTO = Object.freeze({
  ABA: SLOG_ABAS.TIPOS_EQUIPAMENTO.nome,
  CAMPO_ID: 'ID_TIPO_EQUIPAMENTO',
  CAMPO_NOME: 'TIPO_EQUIPAMENTO',
  CAMPO_ATIVO: 'ATIVO',
  PREFIXO_ID: 'TEQ',
  AUDITORIA: 'TIPOS_EQUIPAMENTO',
  VERSAO: '1.0.0'
});


/* =========================================================
 * CADASTRO
 * =========================================================
 */

/**
 * Cadastra um tipo de equipamento.
 *
 * Exemplo:
 *
 * cadastrarTipoEquipamento({
 *   tipoEquipamento: 'Ventilação'
 * });
 */
function cadastrarTipoEquipamento(dados) {
  try {
    dados = dados || {};

    const tipoEquipamento = normalizarTexto(
      dados.tipoEquipamento
    );

    exigirCampo(
      tipoEquipamento,
      'Tipo de equipamento'
    );

    validarDuplicidadeTipoEquipamento_(
      tipoEquipamento,
      ''
    );

    const usuario = obterUsuarioAtual();

    const registro = {
      ID_TIPO_EQUIPAMENTO: gerarIdSequencial(
        MODULO_TIPOS_EQUIPAMENTO.PREFIXO_ID,
        MODULO_TIPOS_EQUIPAMENTO.ABA,
        MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID
      ),

      TIPO_EQUIPAMENTO: tipoEquipamento,

      ATIVO: true,

      CRIADO_EM: agora(),

      CRIADO_POR: usuario,

      ATUALIZADO_EM: '',

      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      MODULO_TIPOS_EQUIPAMENTO.AUDITORIA,
      registro.ID_TIPO_EQUIPAMENTO,
      {
        tipoEquipamento:
          registro.TIPO_EQUIPAMENTO,

        ativo:
          registro.ATIVO
      },
      usuario
    );

    return respostaSucesso(
      'Tipo de equipamento cadastrado com sucesso.',
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
 * Atualiza um tipo de equipamento.
 */
function atualizarTipoEquipamento(
  idTipoEquipamento,
  dados
) {
  try {
    dados = dados || {};

    exigirCampo(
      idTipoEquipamento,
      'ID do tipo de equipamento'
    );

    const registroAtual = localizarRegistro(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
      idTipoEquipamento
    );

    if (!registroAtual) {
      throw new Error(
        'Tipo de equipamento não encontrado.'
      );
    }

    if (
      dados.tipoEquipamento === undefined
    ) {
      throw new Error(
        'Nenhuma informação foi enviada para atualização.'
      );
    }

    const tipoEquipamento = normalizarTexto(
      dados.tipoEquipamento
    );

    exigirCampo(
      tipoEquipamento,
      'Tipo de equipamento'
    );

    validarDuplicidadeTipoEquipamento_(
      tipoEquipamento,
      idTipoEquipamento
    );

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      TIPO_EQUIPAMENTO:
        tipoEquipamento,

      ATUALIZADO_EM:
        agora(),

      ATUALIZADO_POR:
        usuario
    };

    atualizarRegistroPorCampo(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
      idTipoEquipamento,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      MODULO_TIPOS_EQUIPAMENTO.AUDITORIA,
      idTipoEquipamento,
      {
        dadosAnteriores: {
          tipoEquipamento:
            registroAtual.TIPO_EQUIPAMENTO
        },

        dadosAtualizados: {
          tipoEquipamento:
            tipoEquipamento
        }
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_TIPOS_EQUIPAMENTO.ABA,
        MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
        idTipoEquipamento
      );

    return respostaSucesso(
      'Tipo de equipamento atualizado com sucesso.',
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
 * Inativa um tipo de equipamento.
 */
function inativarTipoEquipamento(
  idTipoEquipamento
) {
  return alterarSituacaoTipoEquipamento_(
    idTipoEquipamento,
    false
  );
}


/**
 * Reativa um tipo de equipamento.
 */
function reativarTipoEquipamento(
  idTipoEquipamento
) {
  return alterarSituacaoTipoEquipamento_(
    idTipoEquipamento,
    true
  );
}


/**
 * Altera o campo ATIVO.
 */
function alterarSituacaoTipoEquipamento_(
  idTipoEquipamento,
  ativo
) {
  try {
    exigirCampo(
      idTipoEquipamento,
      'ID do tipo de equipamento'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
      idTipoEquipamento
    );

    if (!registro) {
      throw new Error(
        'Tipo de equipamento não encontrado.'
      );
    }

    const situacaoAtual =
      interpretarBooleanoTipoEquipamento_(
        registro.ATIVO
      );

    if (situacaoAtual === ativo) {
      return respostaSucesso(
        ativo
          ? 'O tipo de equipamento já está ativo.'
          : 'O tipo de equipamento já está inativo.',
        registro
      );
    }

    const usuario = obterUsuarioAtual();

    atualizarRegistroPorCampo(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
      idTipoEquipamento,
      {
        ATIVO: ativo,
        ATUALIZADO_EM: agora(),
        ATUALIZADO_POR: usuario
      }
    );

    registrarAuditoria(
      ativo ? 'REATIVACAO' : 'INATIVACAO',
      MODULO_TIPOS_EQUIPAMENTO.AUDITORIA,
      idTipoEquipamento,
      {
        tipoEquipamento:
          registro.TIPO_EQUIPAMENTO,

        ativoAnterior:
          situacaoAtual,

        novoAtivo:
          ativo
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_TIPOS_EQUIPAMENTO.ABA,
        MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
        idTipoEquipamento
      );

    return respostaSucesso(
      ativo
        ? 'Tipo de equipamento reativado com sucesso.'
        : 'Tipo de equipamento inativado com sucesso.',
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
 * Lista os tipos de equipamento.
 *
 * Quando apenasAtivos for verdadeiro,
 * retorna somente registros ativos.
 */
function listarTiposEquipamento(
  apenasAtivos
) {
  const registros = listarRegistros(
    MODULO_TIPOS_EQUIPAMENTO.ABA
  );

  return registros
    .filter(function(registro) {
      if (!apenasAtivos) {
        return true;
      }

      return interpretarBooleanoTipoEquipamento_(
        registro.ATIVO
      );
    })
    .sort(function(a, b) {
      return String(
        a.TIPO_EQUIPAMENTO || ''
      ).localeCompare(
        String(
          b.TIPO_EQUIPAMENTO || ''
        ),
        'pt-BR'
      );
    });
}


/**
 * Lista somente tipos ativos.
 */
function listarTiposEquipamentoAtivos() {
  return listarTiposEquipamento(true);
}


/**
 * Lista todos os tipos.
 */
function listarTodosTiposEquipamento() {
  return listarTiposEquipamento(false);
}


/**
 * Localiza um tipo pelo ID.
 */
function obterTipoEquipamentoPorId(
  idTipoEquipamento
) {
  try {
    exigirCampo(
      idTipoEquipamento,
      'ID do tipo de equipamento'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
      idTipoEquipamento
    );

    if (!registro) {
      throw new Error(
        'Tipo de equipamento não encontrado.'
      );
    }

    return respostaSucesso(
      'Tipo de equipamento localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Localiza um tipo pelo nome.
 */
function obterTipoEquipamentoPorNome(
  nomeTipoEquipamento
) {
  try {
    const tipoEquipamento = normalizarTexto(
      nomeTipoEquipamento
    );

    exigirCampo(
      tipoEquipamento,
      'Tipo de equipamento'
    );

    const registros =
      listarTiposEquipamento(false);

    const registro = registros.find(
      function(item) {
        return (
          normalizarParaComparacao(
            item.TIPO_EQUIPAMENTO
          ) ===
          normalizarParaComparacao(
            tipoEquipamento
          )
        );
      }
    );

    if (!registro) {
      throw new Error(
        'Tipo de equipamento não encontrado.'
      );
    }

    return respostaSucesso(
      'Tipo de equipamento localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Verifica se um tipo está ativo.
 */
function tipoEquipamentoEstaAtivo(
  idTipoEquipamento
) {
  try {
    exigirCampo(
      idTipoEquipamento,
      'ID do tipo de equipamento'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_EQUIPAMENTO.ABA,
      MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
      idTipoEquipamento
    );

    if (!registro) {
      throw new Error(
        'Tipo de equipamento não encontrado.'
      );
    }

    return respostaSucesso(
      'Situação do tipo de equipamento consultada.',
      {
        idTipoEquipamento:
          registro.ID_TIPO_EQUIPAMENTO,

        tipoEquipamento:
          registro.TIPO_EQUIPAMENTO,

        ativo:
          interpretarBooleanoTipoEquipamento_(
            registro.ATIVO
          )
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
 * Cadastra os tipos iniciais.
 *
 * Pode ser executada mais de uma vez.
 * Não cria duplicidades.
 */
function popularTiposEquipamentoPadrao() {
  try {
    const tiposPadrao = [
      'Ventilação e Exaustão',
      'Monitoramento de Gases',
      'Hidrojateamento',
      'Aspiração Industrial',
      'Iluminação',
      'Resgate',
      'Acesso por Corda',
      'Movimentação de Carga',
      'Bombeamento',
      'Lavagem',
      'Ferramentas Manuais',
      'Ferramentas Elétricas',
      'Ferramentas Pneumáticas',
      'Proteção Respiratória',
      'Comunicação',
      'Sinalização e Isolamento',
      'Armazenamento de Resíduos',
      'Transporte de Resíduos',
      'Equipamento de Proteção Coletiva',
      'Outro'
    ];

    const cadastrados = [];
    const existentes = [];
    const reativados = [];
    const erros = [];

    tiposPadrao.forEach(function(
      nomeTipoEquipamento
    ) {
      const registros =
        listarTiposEquipamento(false);

      const registroExistente =
        registros.find(function(registro) {
          return (
            normalizarParaComparacao(
              registro.TIPO_EQUIPAMENTO
            ) ===
            normalizarParaComparacao(
              nomeTipoEquipamento
            )
          );
        });

      if (!registroExistente) {
        const resultadoCadastro =
          executarComTentativasTipoEquipamento_(
            function() {
              return cadastrarTipoEquipamento({
                tipoEquipamento:
                  nomeTipoEquipamento
              });
            },
            3
          );

        if (resultadoCadastro.sucesso) {
          cadastrados.push(
            nomeTipoEquipamento
          );
        } else {
          erros.push({
            tipoEquipamento:
              nomeTipoEquipamento,

            mensagem:
              resultadoCadastro.mensagem
          });
        }

        return;
      }

      const estaAtivo =
        interpretarBooleanoTipoEquipamento_(
          registroExistente.ATIVO
        );

      if (!estaAtivo) {
        const resultadoReativacao =
          executarComTentativasTipoEquipamento_(
            function() {
              return reativarTipoEquipamento(
                registroExistente
                  .ID_TIPO_EQUIPAMENTO
              );
            },
            3
          );

        if (resultadoReativacao.sucesso) {
          reativados.push(
            nomeTipoEquipamento
          );
        } else {
          erros.push({
            tipoEquipamento:
              nomeTipoEquipamento,

            mensagem:
              resultadoReativacao.mensagem
          });
        }

        return;
      }

      existentes.push(
        nomeTipoEquipamento
      );
    });

    if (erros.length > 0) {
      throw new Error(
        'A carga inicial foi concluída com erros: ' +
        JSON.stringify(erros)
      );
    }

    return respostaSucesso(
      'Carga inicial de tipos de equipamento concluída.',
      {
        cadastrados:
          cadastrados,

        reativados:
          reativados,

        existentes:
          existentes,

        totalAtivos:
          listarTiposEquipamentoAtivos()
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
function validarDuplicidadeTipoEquipamento_(
  tipoEquipamento,
  idIgnorado
) {
  const registros = listarRegistros(
    MODULO_TIPOS_EQUIPAMENTO.ABA
  );

  const duplicado = registros.some(
    function(registro) {
      const mesmoNome =
        normalizarParaComparacao(
          registro.TIPO_EQUIPAMENTO
        ) ===
        normalizarParaComparacao(
          tipoEquipamento
        );

      const outroRegistro =
        normalizarParaComparacao(
          registro.ID_TIPO_EQUIPAMENTO
        ) !==
        normalizarParaComparacao(
          idIgnorado
        );

      return mesmoNome && outroRegistro;
    }
  );

  if (duplicado) {
    throw new Error(
      'Já existe um tipo de equipamento com este nome.'
    );
  }
}


/**
 * Interpreta o valor da coluna ATIVO.
 */
function interpretarBooleanoTipoEquipamento_(
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


/**
 * Executa novamente operações que apresentem
 * erro temporário dos serviços do Google.
 */
function executarComTentativasTipoEquipamento_(
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

        ultimoErro = new Error(
          mensagem
        );
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


/* =========================================================
 * TESTES
 * =========================================================
 */

/**
 * Testa o carregamento do módulo.
 */
function testarModuloTiposEquipamento() {
  const funcoesDisponiveis = {
    cadastrar:
      typeof cadastrarTipoEquipamento ===
      'function',

    atualizar:
      typeof atualizarTipoEquipamento ===
      'function',

    inativar:
      typeof inativarTipoEquipamento ===
      'function',

    reativar:
      typeof reativarTipoEquipamento ===
      'function',

    listar:
      typeof listarTiposEquipamento ===
      'function',

    popular:
      typeof popularTiposEquipamentoPadrao ===
      'function'
  };

  const resultado = {
    sucesso: true,

    modulo:
      MODULO_TIPOS_EQUIPAMENTO.AUDITORIA,

    versao:
      MODULO_TIPOS_EQUIPAMENTO.VERSAO,

    aba:
      MODULO_TIPOS_EQUIPAMENTO.ABA,

    abaExiste:
      abaExiste(
        MODULO_TIPOS_EQUIPAMENTO.ABA
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
      'O módulo de tipos de equipamento possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de tipos de equipamento carregado corretamente.',
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
function testarCrudTiposEquipamento() {
  const identificador =
    new Date().getTime();

  const nomeInicial =
    'TESTE EQUIPAMENTO ' +
    identificador;

  const nomeAtualizado =
    'TESTE EQUIPAMENTO ATUALIZADO ' +
    identificador;

  const etapas = {};
  let idTipoEquipamento = '';

  try {
    etapas.cadastro =
      cadastrarTipoEquipamento({
        tipoEquipamento:
          nomeInicial
      });

    if (!etapas.cadastro.sucesso) {
      throw new Error(
        etapas.cadastro.mensagem ||
        'Falha no cadastro.'
      );
    }

    idTipoEquipamento =
      etapas.cadastro
        .dados
        .ID_TIPO_EQUIPAMENTO;

    etapas.atualizacao =
      atualizarTipoEquipamento(
        idTipoEquipamento,
        {
          tipoEquipamento:
            nomeAtualizado
        }
      );

    if (!etapas.atualizacao.sucesso) {
      throw new Error(
        etapas.atualizacao.mensagem ||
        'Falha na atualização.'
      );
    }

    etapas.inativacao =
      inativarTipoEquipamento(
        idTipoEquipamento
      );

    if (!etapas.inativacao.sucesso) {
      throw new Error(
        etapas.inativacao.mensagem ||
        'Falha na inativação.'
      );
    }

    etapas.reativacao =
      reativarTipoEquipamento(
        idTipoEquipamento
      );

    if (!etapas.reativacao.sucesso) {
      throw new Error(
        etapas.reativacao.mensagem ||
        'Falha na reativação.'
      );
    }

    etapas.inativacaoFinal =
      inativarTipoEquipamento(
        idTipoEquipamento
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
        MODULO_TIPOS_EQUIPAMENTO.ABA,
        MODULO_TIPOS_EQUIPAMENTO.CAMPO_ID,
        idTipoEquipamento
      );

    if (
      interpretarBooleanoTipoEquipamento_(
        registroFinal.ATIVO
      )
    ) {
      throw new Error(
        'O registro deveria terminar inativo.'
      );
    }

    const resultado = {
      sucesso: true,

      idTipoEquipamento:
        idTipoEquipamento,

      nomeFinal:
        registroFinal.TIPO_EQUIPAMENTO,

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
      'CRUD de tipos de equipamento testado com sucesso.',
      'SLOG OPS',
      5
    );

    return resultado;
  } catch (erro) {
    if (idTipoEquipamento) {
      try {
        inativarTipoEquipamento(
          idTipoEquipamento
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

          idTipoEquipamento:
            idTipoEquipamento,

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
function testarTudoTiposEquipamento() {
  const modulo =
    testarModuloTiposEquipamento();

  const cargaInicial =
    popularTiposEquipamentoPadrao();

  if (!cargaInicial.sucesso) {
    throw new Error(
      cargaInicial.mensagem ||
      'Falha na carga inicial.'
    );
  }

  const crud =
    testarCrudTiposEquipamento();

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