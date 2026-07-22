/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 13_TiposUnidade.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Cadastro e gerenciamento dos tipos de unidade utilizados
 * nos clientes, Ordens de Serviço e RDOs.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const MODULO_TIPOS_UNIDADE = Object.freeze({
  ABA: SLOG_ABAS.TIPOS_UNIDADE.nome,
  CAMPO_ID: 'ID_TIPO_UNIDADE',
  CAMPO_NOME: 'TIPO_UNIDADE',
  CAMPO_ATIVO: 'ATIVO',
  PREFIXO_ID: 'UNI',
  AUDITORIA: 'TIPOS_UNIDADE',
  VERSAO: '1.0.0'
});


/* =========================================================
 * CADASTRO
 * =========================================================
 */

/**
 * Cadastra um tipo de unidade.
 *
 * Exemplo:
 *
 * cadastrarTipoUnidade({
 *   tipoUnidade: 'Embarcação'
 * });
 */
function cadastrarTipoUnidade(dados) {
  try {
    dados = dados || {};

    const tipoUnidade = normalizarTexto(
      dados.tipoUnidade
    );

    exigirCampo(
      tipoUnidade,
      'Tipo de unidade'
    );

    validarDuplicidadeTipoUnidade_(
      tipoUnidade,
      ''
    );

    const usuario = obterUsuarioAtual();

    const registro = {
      ID_TIPO_UNIDADE: gerarIdSequencial(
        MODULO_TIPOS_UNIDADE.PREFIXO_ID,
        MODULO_TIPOS_UNIDADE.ABA,
        MODULO_TIPOS_UNIDADE.CAMPO_ID
      ),

      TIPO_UNIDADE: tipoUnidade,

      ATIVO: true,

      CRIADO_EM: agora(),

      CRIADO_POR: usuario,

      ATUALIZADO_EM: '',

      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      MODULO_TIPOS_UNIDADE.ABA,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      MODULO_TIPOS_UNIDADE.AUDITORIA,
      registro.ID_TIPO_UNIDADE,
      {
        tipoUnidade:
          registro.TIPO_UNIDADE,
        ativo:
          registro.ATIVO
      },
      usuario
    );

    return respostaSucesso(
      'Tipo de unidade cadastrado com sucesso.',
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
 * Atualiza um tipo de unidade.
 *
 * Exemplo:
 *
 * atualizarTipoUnidade(
 *   'UNI0001',
 *   {
 *     tipoUnidade: 'Embarcação Offshore'
 *   }
 * );
 */
function atualizarTipoUnidade(
  idTipoUnidade,
  dados
) {
  try {
    dados = dados || {};

    exigirCampo(
      idTipoUnidade,
      'ID do tipo de unidade'
    );

    const registroAtual = localizarRegistro(
      MODULO_TIPOS_UNIDADE.ABA,
      MODULO_TIPOS_UNIDADE.CAMPO_ID,
      idTipoUnidade
    );

    if (!registroAtual) {
      throw new Error(
        'Tipo de unidade não encontrado.'
      );
    }

    if (dados.tipoUnidade === undefined) {
      throw new Error(
        'Nenhuma informação foi enviada para atualização.'
      );
    }

    const tipoUnidade = normalizarTexto(
      dados.tipoUnidade
    );

    exigirCampo(
      tipoUnidade,
      'Tipo de unidade'
    );

    validarDuplicidadeTipoUnidade_(
      tipoUnidade,
      idTipoUnidade
    );

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      TIPO_UNIDADE: tipoUnidade,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      MODULO_TIPOS_UNIDADE.ABA,
      MODULO_TIPOS_UNIDADE.CAMPO_ID,
      idTipoUnidade,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      MODULO_TIPOS_UNIDADE.AUDITORIA,
      idTipoUnidade,
      {
        dadosAnteriores: {
          tipoUnidade:
            registroAtual.TIPO_UNIDADE
        },
        dadosAtualizados: {
          tipoUnidade:
            tipoUnidade
        }
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_TIPOS_UNIDADE.ABA,
        MODULO_TIPOS_UNIDADE.CAMPO_ID,
        idTipoUnidade
      );

    return respostaSucesso(
      'Tipo de unidade atualizado com sucesso.',
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
 * Inativa um tipo de unidade.
 */
function inativarTipoUnidade(
  idTipoUnidade
) {
  return alterarSituacaoTipoUnidade_(
    idTipoUnidade,
    false
  );
}


/**
 * Reativa um tipo de unidade.
 */
function reativarTipoUnidade(
  idTipoUnidade
) {
  return alterarSituacaoTipoUnidade_(
    idTipoUnidade,
    true
  );
}


/**
 * Altera o campo ATIVO de um tipo de unidade.
 */
function alterarSituacaoTipoUnidade_(
  idTipoUnidade,
  ativo
) {
  try {
    exigirCampo(
      idTipoUnidade,
      'ID do tipo de unidade'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_UNIDADE.ABA,
      MODULO_TIPOS_UNIDADE.CAMPO_ID,
      idTipoUnidade
    );

    if (!registro) {
      throw new Error(
        'Tipo de unidade não encontrado.'
      );
    }

    const situacaoAtual =
      interpretarBooleanoTipoUnidade_(
        registro.ATIVO
      );

    if (situacaoAtual === ativo) {
      return respostaSucesso(
        ativo
          ? 'O tipo de unidade já está ativo.'
          : 'O tipo de unidade já está inativo.',
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
      MODULO_TIPOS_UNIDADE.ABA,
      MODULO_TIPOS_UNIDADE.CAMPO_ID,
      idTipoUnidade,
      atualizacao
    );

    registrarAuditoria(
      ativo ? 'REATIVACAO' : 'INATIVACAO',
      MODULO_TIPOS_UNIDADE.AUDITORIA,
      idTipoUnidade,
      {
        tipoUnidade:
          registro.TIPO_UNIDADE,
        ativoAnterior:
          situacaoAtual,
        novoAtivo:
          ativo
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_TIPOS_UNIDADE.ABA,
        MODULO_TIPOS_UNIDADE.CAMPO_ID,
        idTipoUnidade
      );

    return respostaSucesso(
      ativo
        ? 'Tipo de unidade reativado com sucesso.'
        : 'Tipo de unidade inativado com sucesso.',
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
 * Lista os tipos de unidade.
 *
 * Quando apenasAtivos for verdadeiro,
 * retorna somente registros ativos.
 */
function listarTiposUnidade(
  apenasAtivos
) {
  const registros = listarRegistros(
    MODULO_TIPOS_UNIDADE.ABA
  );

  return registros
    .filter(function(registro) {
      if (!apenasAtivos) {
        return true;
      }

      return interpretarBooleanoTipoUnidade_(
        registro.ATIVO
      );
    })
    .sort(function(a, b) {
      return String(
        a.TIPO_UNIDADE || ''
      ).localeCompare(
        String(
          b.TIPO_UNIDADE || ''
        ),
        'pt-BR'
      );
    });
}


/**
 * Lista somente os tipos de unidade ativos.
 */
function listarTiposUnidadeAtivos() {
  return listarTiposUnidade(true);
}


/**
 * Lista todos os tipos de unidade.
 */
function listarTodosTiposUnidade() {
  return listarTiposUnidade(false);
}


/**
 * Localiza um tipo de unidade pelo ID.
 */
function obterTipoUnidadePorId(
  idTipoUnidade
) {
  try {
    exigirCampo(
      idTipoUnidade,
      'ID do tipo de unidade'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_UNIDADE.ABA,
      MODULO_TIPOS_UNIDADE.CAMPO_ID,
      idTipoUnidade
    );

    if (!registro) {
      throw new Error(
        'Tipo de unidade não encontrado.'
      );
    }

    return respostaSucesso(
      'Tipo de unidade localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Localiza um tipo de unidade pelo nome.
 */
function obterTipoUnidadePorNome(
  nomeTipoUnidade
) {
  try {
    const tipoUnidade = normalizarTexto(
      nomeTipoUnidade
    );

    exigirCampo(
      tipoUnidade,
      'Tipo de unidade'
    );

    const registros =
      listarTiposUnidade(false);

    const registro = registros.find(
      function(item) {
        return (
          normalizarParaComparacao(
            item.TIPO_UNIDADE
          ) ===
          normalizarParaComparacao(
            tipoUnidade
          )
        );
      }
    );

    if (!registro) {
      throw new Error(
        'Tipo de unidade não encontrado.'
      );
    }

    return respostaSucesso(
      'Tipo de unidade localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Verifica se um tipo de unidade está ativo.
 */
function tipoUnidadeEstaAtivo(
  idTipoUnidade
) {
  try {
    exigirCampo(
      idTipoUnidade,
      'ID do tipo de unidade'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_UNIDADE.ABA,
      MODULO_TIPOS_UNIDADE.CAMPO_ID,
      idTipoUnidade
    );

    if (!registro) {
      throw new Error(
        'Tipo de unidade não encontrado.'
      );
    }

    return respostaSucesso(
      'Situação do tipo de unidade consultada.',
      {
        idTipoUnidade:
          registro.ID_TIPO_UNIDADE,
        tipoUnidade:
          registro.TIPO_UNIDADE,
        ativo:
          interpretarBooleanoTipoUnidade_(
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
 * Cadastra os tipos de unidade iniciais.
 *
 * Pode ser executada mais de uma vez.
 * Não cria registros duplicados.
 */
function popularTiposUnidadePadrao() {
  try {
    const tiposPadrao = [
      'Embarcação',
      'FPSO',
      'Plataforma',
      'Balsa',
      'Navio',
      'Rebocador',
      'Base Terrestre',
      'Estaleiro',
      'Terminal',
      'Unidade Industrial',
      'Galpão',
      'Outro'
    ];

    const cadastrados = [];
    const existentes = [];
    const reativados = [];
    const erros = [];

    tiposPadrao.forEach(function(
      nomeTipoUnidade
    ) {
      const registros =
        listarTiposUnidade(false);

      const registroExistente =
        registros.find(function(registro) {
          return (
            normalizarParaComparacao(
              registro.TIPO_UNIDADE
            ) ===
            normalizarParaComparacao(
              nomeTipoUnidade
            )
          );
        });

      if (!registroExistente) {
        const resultadoCadastro =
          cadastrarTipoUnidade({
            tipoUnidade:
              nomeTipoUnidade
          });

        if (resultadoCadastro.sucesso) {
          cadastrados.push(
            nomeTipoUnidade
          );
        } else {
          erros.push({
            tipoUnidade:
              nomeTipoUnidade,
            mensagem:
              resultadoCadastro.mensagem
          });
        }

        return;
      }

      const estaAtivo =
        interpretarBooleanoTipoUnidade_(
          registroExistente.ATIVO
        );

      if (!estaAtivo) {
        const resultadoReativacao =
          reativarTipoUnidade(
            registroExistente
              .ID_TIPO_UNIDADE
          );

        if (resultadoReativacao.sucesso) {
          reativados.push(
            nomeTipoUnidade
          );
        } else {
          erros.push({
            tipoUnidade:
              nomeTipoUnidade,
            mensagem:
              resultadoReativacao.mensagem
          });
        }

        return;
      }

      existentes.push(
        nomeTipoUnidade
      );
    });

    if (erros.length > 0) {
      throw new Error(
        'A carga inicial foi concluída com erros: ' +
        JSON.stringify(erros)
      );
    }

    return respostaSucesso(
      'Carga inicial de tipos de unidade concluída.',
      {
        cadastrados:
          cadastrados,
        reativados:
          reativados,
        existentes:
          existentes,
        totalAtivos:
          listarTiposUnidadeAtivos()
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
 * Valida se já existe outro tipo de unidade
 * com o mesmo nome.
 */
function validarDuplicidadeTipoUnidade_(
  tipoUnidade,
  idIgnorado
) {
  const registros = listarRegistros(
    MODULO_TIPOS_UNIDADE.ABA
  );

  const duplicado = registros.some(
    function(registro) {
      const mesmoNome =
        normalizarParaComparacao(
          registro.TIPO_UNIDADE
        ) ===
        normalizarParaComparacao(
          tipoUnidade
        );

      const outroRegistro =
        normalizarParaComparacao(
          registro.ID_TIPO_UNIDADE
        ) !==
        normalizarParaComparacao(
          idIgnorado
        );

      return mesmoNome && outroRegistro;
    }
  );

  if (duplicado) {
    throw new Error(
      'Já existe um tipo de unidade com este nome.'
    );
  }
}


/**
 * Interpreta valores armazenados na coluna ATIVO.
 */
function interpretarBooleanoTipoUnidade_(
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
function testarModuloTiposUnidade() {
  const funcoesDisponiveis = {
    cadastrar:
      typeof cadastrarTipoUnidade ===
      'function',

    atualizar:
      typeof atualizarTipoUnidade ===
      'function',

    inativar:
      typeof inativarTipoUnidade ===
      'function',

    reativar:
      typeof reativarTipoUnidade ===
      'function',

    listar:
      typeof listarTiposUnidade ===
      'function',

    popular:
      typeof popularTiposUnidadePadrao ===
      'function'
  };

  const resultado = {
    sucesso: true,

    modulo:
      MODULO_TIPOS_UNIDADE.AUDITORIA,

    versao:
      MODULO_TIPOS_UNIDADE.VERSAO,

    aba:
      MODULO_TIPOS_UNIDADE.ABA,

    abaExiste:
      abaExiste(
        MODULO_TIPOS_UNIDADE.ABA
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
      'O módulo de tipos de unidade possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de tipos de unidade carregado corretamente.',
    'SLOG OPS',
    5
  );

  return resultado;
}


/**
 * Testa cadastro, atualização,
 * inativação e reativação.
 *
 * O registro de teste termina inativo.
 */
function testarCrudTiposUnidade() {
  const identificador =
    new Date().getTime();

  const nomeInicial =
    'TESTE UNIDADE ' +
    identificador;

  const nomeAtualizado =
    'TESTE UNIDADE ATUALIZADA ' +
    identificador;

  const etapas = {};
  let idTipoUnidade = '';

  try {
    etapas.cadastro =
      cadastrarTipoUnidade({
        tipoUnidade:
          nomeInicial
      });

    if (!etapas.cadastro.sucesso) {
      throw new Error(
        etapas.cadastro.mensagem ||
        'Falha no cadastro.'
      );
    }

    idTipoUnidade =
      etapas.cadastro
        .dados
        .ID_TIPO_UNIDADE;

    etapas.atualizacao =
      atualizarTipoUnidade(
        idTipoUnidade,
        {
          tipoUnidade:
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
      inativarTipoUnidade(
        idTipoUnidade
      );

    if (!etapas.inativacao.sucesso) {
      throw new Error(
        etapas.inativacao.mensagem ||
        'Falha na inativação.'
      );
    }

    etapas.reativacao =
      reativarTipoUnidade(
        idTipoUnidade
      );

    if (!etapas.reativacao.sucesso) {
      throw new Error(
        etapas.reativacao.mensagem ||
        'Falha na reativação.'
      );
    }

    etapas.inativacaoFinal =
      inativarTipoUnidade(
        idTipoUnidade
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
        MODULO_TIPOS_UNIDADE.ABA,
        MODULO_TIPOS_UNIDADE.CAMPO_ID,
        idTipoUnidade
      );

    if (
      interpretarBooleanoTipoUnidade_(
        registroFinal.ATIVO
      )
    ) {
      throw new Error(
        'O registro de teste deveria terminar inativo.'
      );
    }

    const resultado = {
      sucesso: true,

      idTipoUnidade:
        idTipoUnidade,

      nomeFinal:
        registroFinal.TIPO_UNIDADE,

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
      'CRUD de tipos de unidade testado com sucesso.',
      'SLOG OPS',
      5
    );

    return resultado;
  } catch (erro) {
    if (idTipoUnidade) {
      try {
        inativarTipoUnidade(
          idTipoUnidade
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

      idTipoUnidade:
        idTipoUnidade,

      etapas:
        etapas
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
function testarTudoTiposUnidade() {
  const modulo =
    testarModuloTiposUnidade();

  const cargaInicial =
    popularTiposUnidadePadrao();

  if (!cargaInicial.sucesso) {
    throw new Error(
      cargaInicial.mensagem ||
      'Falha na carga inicial.'
    );
  }

  const crud =
    testarCrudTiposUnidade();

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