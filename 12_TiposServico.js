/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 12_TiposServico.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Cadastro e gerenciamento dos tipos de serviço utilizados
 * nas Ordens de Serviço e nos RDOs.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const MODULO_TIPOS_SERVICO = Object.freeze({
  ABA: SLOG_ABAS.TIPOS_SERVICO.nome,
  CAMPO_ID: 'ID_TIPO_SERVICO',
  CAMPO_NOME: 'TIPO_SERVICO',
  CAMPO_ATIVO: 'ATIVO',
  PREFIXO_ID: 'SER',
  AUDITORIA: 'TIPOS_SERVICO',
  VERSAO: '1.0.0'
});


/* =========================================================
 * CADASTRO
 * =========================================================
 */

/**
 * Cadastra um tipo de serviço.
 *
 * Exemplo:
 *
 * cadastrarTipoServico({
 *   tipoServico: 'Limpeza de Tanque'
 * });
 */
function cadastrarTipoServico(dados) {
  try {
    dados = dados || {};

    const tipoServico = normalizarTexto(
      dados.tipoServico
    );

    exigirCampo(
      tipoServico,
      'Tipo de serviço'
    );

    validarDuplicidadeTipoServico_(
      tipoServico,
      ''
    );

    const usuario = obterUsuarioAtual();

    const registro = {
      ID_TIPO_SERVICO: gerarIdSequencial(
        MODULO_TIPOS_SERVICO.PREFIXO_ID,
        MODULO_TIPOS_SERVICO.ABA,
        MODULO_TIPOS_SERVICO.CAMPO_ID
      ),

      TIPO_SERVICO: tipoServico,

      ATIVO: true,

      CRIADO_EM: agora(),

      CRIADO_POR: usuario,

      ATUALIZADO_EM: '',

      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      MODULO_TIPOS_SERVICO.ABA,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      MODULO_TIPOS_SERVICO.AUDITORIA,
      registro.ID_TIPO_SERVICO,
      {
        tipoServico:
          registro.TIPO_SERVICO,
        ativo:
          registro.ATIVO
      },
      usuario
    );

    return respostaSucesso(
      'Tipo de serviço cadastrado com sucesso.',
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
 * Atualiza um tipo de serviço.
 *
 * Exemplo:
 *
 * atualizarTipoServico(
 *   'SER0001',
 *   {
 *     tipoServico: 'Limpeza de Tanques'
 *   }
 * );
 */
function atualizarTipoServico(
  idTipoServico,
  dados
) {
  try {
    dados = dados || {};

    exigirCampo(
      idTipoServico,
      'ID do tipo de serviço'
    );

    const registroAtual = localizarRegistro(
      MODULO_TIPOS_SERVICO.ABA,
      MODULO_TIPOS_SERVICO.CAMPO_ID,
      idTipoServico
    );

    if (!registroAtual) {
      throw new Error(
        'Tipo de serviço não encontrado.'
      );
    }

    if (dados.tipoServico === undefined) {
      throw new Error(
        'Nenhuma informação foi enviada para atualização.'
      );
    }

    const tipoServico = normalizarTexto(
      dados.tipoServico
    );

    exigirCampo(
      tipoServico,
      'Tipo de serviço'
    );

    validarDuplicidadeTipoServico_(
      tipoServico,
      idTipoServico
    );

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      TIPO_SERVICO: tipoServico,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      MODULO_TIPOS_SERVICO.ABA,
      MODULO_TIPOS_SERVICO.CAMPO_ID,
      idTipoServico,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      MODULO_TIPOS_SERVICO.AUDITORIA,
      idTipoServico,
      {
        dadosAnteriores: {
          tipoServico:
            registroAtual.TIPO_SERVICO
        },
        dadosAtualizados: {
          tipoServico: tipoServico
        }
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_TIPOS_SERVICO.ABA,
        MODULO_TIPOS_SERVICO.CAMPO_ID,
        idTipoServico
      );

    return respostaSucesso(
      'Tipo de serviço atualizado com sucesso.',
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
 * Inativa um tipo de serviço.
 */
function inativarTipoServico(
  idTipoServico
) {
  return alterarSituacaoTipoServico_(
    idTipoServico,
    false
  );
}


/**
 * Reativa um tipo de serviço.
 */
function reativarTipoServico(
  idTipoServico
) {
  return alterarSituacaoTipoServico_(
    idTipoServico,
    true
  );
}


/**
 * Altera o campo ATIVO de um tipo de serviço.
 */
function alterarSituacaoTipoServico_(
  idTipoServico,
  ativo
) {
  try {
    exigirCampo(
      idTipoServico,
      'ID do tipo de serviço'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_SERVICO.ABA,
      MODULO_TIPOS_SERVICO.CAMPO_ID,
      idTipoServico
    );

    if (!registro) {
      throw new Error(
        'Tipo de serviço não encontrado.'
      );
    }

    const situacaoAtual =
      interpretarBooleanoTipoServico_(
        registro.ATIVO
      );

    if (situacaoAtual === ativo) {
      return respostaSucesso(
        ativo
          ? 'O tipo de serviço já está ativo.'
          : 'O tipo de serviço já está inativo.',
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
      MODULO_TIPOS_SERVICO.ABA,
      MODULO_TIPOS_SERVICO.CAMPO_ID,
      idTipoServico,
      atualizacao
    );

    registrarAuditoria(
      ativo ? 'REATIVACAO' : 'INATIVACAO',
      MODULO_TIPOS_SERVICO.AUDITORIA,
      idTipoServico,
      {
        tipoServico:
          registro.TIPO_SERVICO,
        ativoAnterior:
          situacaoAtual,
        novoAtivo:
          ativo
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_TIPOS_SERVICO.ABA,
        MODULO_TIPOS_SERVICO.CAMPO_ID,
        idTipoServico
      );

    return respostaSucesso(
      ativo
        ? 'Tipo de serviço reativado com sucesso.'
        : 'Tipo de serviço inativado com sucesso.',
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
 * Lista os tipos de serviço.
 *
 * Quando apenasAtivos for verdadeiro,
 * retorna somente registros ativos.
 */
function listarTiposServico(
  apenasAtivos
) {
  const registros = listarRegistros(
    MODULO_TIPOS_SERVICO.ABA
  );

  return registros
    .filter(function(registro) {
      if (!apenasAtivos) {
        return true;
      }

      return interpretarBooleanoTipoServico_(
        registro.ATIVO
      );
    })
    .sort(function(a, b) {
      return String(
        a.TIPO_SERVICO || ''
      ).localeCompare(
        String(
          b.TIPO_SERVICO || ''
        ),
        'pt-BR'
      );
    });
}


/**
 * Lista somente tipos de serviço ativos.
 */
function listarTiposServicoAtivos() {
  return listarTiposServico(true);
}


/**
 * Lista todos os tipos de serviço.
 */
function listarTodosTiposServico() {
  return listarTiposServico(false);
}


/**
 * Localiza um tipo de serviço pelo ID.
 */
function obterTipoServicoPorId(
  idTipoServico
) {
  try {
    exigirCampo(
      idTipoServico,
      'ID do tipo de serviço'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_SERVICO.ABA,
      MODULO_TIPOS_SERVICO.CAMPO_ID,
      idTipoServico
    );

    if (!registro) {
      throw new Error(
        'Tipo de serviço não encontrado.'
      );
    }

    return respostaSucesso(
      'Tipo de serviço localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Localiza um tipo de serviço pelo nome.
 */
function obterTipoServicoPorNome(
  nomeTipoServico
) {
  try {
    const tipoServico = normalizarTexto(
      nomeTipoServico
    );

    exigirCampo(
      tipoServico,
      'Tipo de serviço'
    );

    const registros =
      listarTiposServico(false);

    const registro = registros.find(
      function(item) {
        return (
          normalizarParaComparacao(
            item.TIPO_SERVICO
          ) ===
          normalizarParaComparacao(
            tipoServico
          )
        );
      }
    );

    if (!registro) {
      throw new Error(
        'Tipo de serviço não encontrado.'
      );
    }

    return respostaSucesso(
      'Tipo de serviço localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Verifica se um tipo de serviço está ativo.
 */
function tipoServicoEstaAtivo(
  idTipoServico
) {
  try {
    exigirCampo(
      idTipoServico,
      'ID do tipo de serviço'
    );

    const registro = localizarRegistro(
      MODULO_TIPOS_SERVICO.ABA,
      MODULO_TIPOS_SERVICO.CAMPO_ID,
      idTipoServico
    );

    if (!registro) {
      throw new Error(
        'Tipo de serviço não encontrado.'
      );
    }

    return respostaSucesso(
      'Situação do tipo de serviço consultada.',
      {
        idTipoServico:
          registro.ID_TIPO_SERVICO,
        tipoServico:
          registro.TIPO_SERVICO,
        ativo:
          interpretarBooleanoTipoServico_(
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
 * Cadastra os tipos de serviço iniciais.
 *
 * Pode ser executada mais de uma vez.
 * Não cria registros duplicados.
 */
function popularTiposServicoPadrao() {
  try {
    const tiposPadrao = [
      'Limpeza de Tanque',
      'Limpeza Naval',
      'Limpeza Industrial',
      'Limpeza de Coifa e Dutos',
      'Hidrojateamento',
      'Resgate em Altura',
      'Resgate em Espaço Confinado',
      'Treinamento NR-33',
      'Treinamento NR-35',
      'Inspeção Técnica',
      'Apoio Operacional',
      'Outro'
    ];

    const cadastrados = [];
    const existentes = [];
    const reativados = [];
    const erros = [];

    tiposPadrao.forEach(function(
      nomeTipoServico
    ) {
      const registros =
        listarTiposServico(false);

      const registroExistente =
        registros.find(function(registro) {
          return (
            normalizarParaComparacao(
              registro.TIPO_SERVICO
            ) ===
            normalizarParaComparacao(
              nomeTipoServico
            )
          );
        });

      if (!registroExistente) {
        const resultadoCadastro =
          cadastrarTipoServico({
            tipoServico:
              nomeTipoServico
          });

        if (resultadoCadastro.sucesso) {
          cadastrados.push(
            nomeTipoServico
          );
        } else {
          erros.push({
            tipoServico:
              nomeTipoServico,
            mensagem:
              resultadoCadastro.mensagem
          });
        }

        return;
      }

      const estaAtivo =
        interpretarBooleanoTipoServico_(
          registroExistente.ATIVO
        );

      if (!estaAtivo) {
        const resultadoReativacao =
          reativarTipoServico(
            registroExistente
              .ID_TIPO_SERVICO
          );

        if (resultadoReativacao.sucesso) {
          reativados.push(
            nomeTipoServico
          );
        } else {
          erros.push({
            tipoServico:
              nomeTipoServico,
            mensagem:
              resultadoReativacao.mensagem
          });
        }

        return;
      }

      existentes.push(
        nomeTipoServico
      );
    });

    if (erros.length > 0) {
      throw new Error(
        'A carga inicial foi concluída com erros: ' +
        JSON.stringify(erros)
      );
    }

    return respostaSucesso(
      'Carga inicial de tipos de serviço concluída.',
      {
        cadastrados:
          cadastrados,
        reativados:
          reativados,
        existentes:
          existentes,
        totalAtivos:
          listarTiposServicoAtivos()
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
 * Valida se já existe outro tipo de serviço
 * com o mesmo nome.
 */
function validarDuplicidadeTipoServico_(
  tipoServico,
  idIgnorado
) {
  const registros = listarRegistros(
    MODULO_TIPOS_SERVICO.ABA
  );

  const duplicado = registros.some(
    function(registro) {
      const mesmoNome =
        normalizarParaComparacao(
          registro.TIPO_SERVICO
        ) ===
        normalizarParaComparacao(
          tipoServico
        );

      const outroRegistro =
        normalizarParaComparacao(
          registro.ID_TIPO_SERVICO
        ) !==
        normalizarParaComparacao(
          idIgnorado
        );

      return mesmoNome && outroRegistro;
    }
  );

  if (duplicado) {
    throw new Error(
      'Já existe um tipo de serviço com este nome.'
    );
  }
}


/**
 * Interpreta valores armazenados na coluna ATIVO.
 */
function interpretarBooleanoTipoServico_(
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
function testarModuloTiposServico() {
  const funcoesDisponiveis = {
    cadastrar:
      typeof cadastrarTipoServico ===
      'function',

    atualizar:
      typeof atualizarTipoServico ===
      'function',

    inativar:
      typeof inativarTipoServico ===
      'function',

    reativar:
      typeof reativarTipoServico ===
      'function',

    listar:
      typeof listarTiposServico ===
      'function',

    popular:
      typeof popularTiposServicoPadrao ===
      'function'
  };

  const resultado = {
    sucesso: true,

    modulo:
      MODULO_TIPOS_SERVICO.AUDITORIA,

    versao:
      MODULO_TIPOS_SERVICO.VERSAO,

    aba:
      MODULO_TIPOS_SERVICO.ABA,

    abaExiste:
      abaExiste(
        MODULO_TIPOS_SERVICO.ABA
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
      'O módulo de tipos de serviço possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de tipos de serviço carregado corretamente.',
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
function testarCrudTiposServico() {
  const identificador =
    new Date().getTime();

  const nomeInicial =
    'TESTE SERVICO ' +
    identificador;

  const nomeAtualizado =
    'TESTE SERVICO ATUALIZADO ' +
    identificador;

  const etapas = {};
  let idTipoServico = '';

  try {
    etapas.cadastro =
      cadastrarTipoServico({
        tipoServico:
          nomeInicial
      });

    if (!etapas.cadastro.sucesso) {
      throw new Error(
        etapas.cadastro.mensagem ||
        'Falha no cadastro.'
      );
    }

    idTipoServico =
      etapas.cadastro
        .dados
        .ID_TIPO_SERVICO;

    etapas.atualizacao =
      atualizarTipoServico(
        idTipoServico,
        {
          tipoServico:
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
      inativarTipoServico(
        idTipoServico
      );

    if (!etapas.inativacao.sucesso) {
      throw new Error(
        etapas.inativacao.mensagem ||
        'Falha na inativação.'
      );
    }

    etapas.reativacao =
      reativarTipoServico(
        idTipoServico
      );

    if (!etapas.reativacao.sucesso) {
      throw new Error(
        etapas.reativacao.mensagem ||
        'Falha na reativação.'
      );
    }

    etapas.inativacaoFinal =
      inativarTipoServico(
        idTipoServico
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
        MODULO_TIPOS_SERVICO.ABA,
        MODULO_TIPOS_SERVICO.CAMPO_ID,
        idTipoServico
      );

    if (
      interpretarBooleanoTipoServico_(
        registroFinal.ATIVO
      )
    ) {
      throw new Error(
        'O registro de teste deveria terminar inativo.'
      );
    }

    const resultado = {
      sucesso: true,

      idTipoServico:
        idTipoServico,

      nomeFinal:
        registroFinal.TIPO_SERVICO,

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
      'CRUD de tipos de serviço testado com sucesso.',
      'SLOG OPS',
      5
    );

    return resultado;
  } catch (erro) {
    if (idTipoServico) {
      try {
        inativarTipoServico(
          idTipoServico
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

      idTipoServico:
        idTipoServico,

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
function testarTudoTiposServico() {
  const modulo =
    testarModuloTiposServico();

  const cargaInicial =
    popularTiposServicoPadrao();

  if (!cargaInicial.sucesso) {
    throw new Error(
      cargaInicial.mensagem ||
      'Falha na carga inicial.'
    );
  }

  const crud =
    testarCrudTiposServico();

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