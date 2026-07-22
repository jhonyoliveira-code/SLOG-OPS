/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 14_MotivosStandby.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Cadastro e gerenciamento dos motivos de stand-by
 * utilizados nas Ordens de Serviço e nos RDOs.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const MODULO_MOTIVOS_STANDBY = Object.freeze({
  ABA: SLOG_ABAS.MOTIVOS_STANDBY.nome,
  CAMPO_ID: 'ID_MOTIVO_STANDBY',
  CAMPO_NOME: 'MOTIVO',
  CAMPO_ATIVO: 'ATIVO',
  PREFIXO_ID: 'STB',
  AUDITORIA: 'MOTIVOS_STANDBY',
  VERSAO: '1.0.0'
});


/* =========================================================
 * CADASTRO
 * =========================================================
 */

/**
 * Cadastra um motivo de stand-by.
 *
 * Exemplo:
 *
 * cadastrarMotivoStandby({
 *   motivo: 'Aguardando liberação da PT'
 * });
 */
function cadastrarMotivoStandby(dados) {
  try {
    dados = dados || {};

    const motivo = normalizarTexto(
      dados.motivo
    );

    exigirCampo(
      motivo,
      'Motivo de stand-by'
    );

    validarDuplicidadeMotivoStandby_(
      motivo,
      ''
    );

    const usuario = obterUsuarioAtual();

    const registro = {
      ID_MOTIVO_STANDBY: gerarIdSequencial(
        MODULO_MOTIVOS_STANDBY.PREFIXO_ID,
        MODULO_MOTIVOS_STANDBY.ABA,
        MODULO_MOTIVOS_STANDBY.CAMPO_ID
      ),

      MOTIVO: motivo,

      ATIVO: true,

      CRIADO_EM: agora(),

      CRIADO_POR: usuario,

      ATUALIZADO_EM: '',

      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      MODULO_MOTIVOS_STANDBY.ABA,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      MODULO_MOTIVOS_STANDBY.AUDITORIA,
      registro.ID_MOTIVO_STANDBY,
      {
        motivo: registro.MOTIVO,
        ativo: registro.ATIVO
      },
      usuario
    );

    return respostaSucesso(
      'Motivo de stand-by cadastrado com sucesso.',
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
 * Atualiza um motivo de stand-by.
 *
 * Exemplo:
 *
 * atualizarMotivoStandby(
 *   'STB0001',
 *   {
 *     motivo: 'Aguardando emissão da PT'
 *   }
 * );
 */
function atualizarMotivoStandby(
  idMotivoStandby,
  dados
) {
  try {
    dados = dados || {};

    exigirCampo(
      idMotivoStandby,
      'ID do motivo de stand-by'
    );

    const registroAtual = localizarRegistro(
      MODULO_MOTIVOS_STANDBY.ABA,
      MODULO_MOTIVOS_STANDBY.CAMPO_ID,
      idMotivoStandby
    );

    if (!registroAtual) {
      throw new Error(
        'Motivo de stand-by não encontrado.'
      );
    }

    if (dados.motivo === undefined) {
      throw new Error(
        'Nenhuma informação foi enviada para atualização.'
      );
    }

    const motivo = normalizarTexto(
      dados.motivo
    );

    exigirCampo(
      motivo,
      'Motivo de stand-by'
    );

    validarDuplicidadeMotivoStandby_(
      motivo,
      idMotivoStandby
    );

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      MOTIVO: motivo,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      MODULO_MOTIVOS_STANDBY.ABA,
      MODULO_MOTIVOS_STANDBY.CAMPO_ID,
      idMotivoStandby,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      MODULO_MOTIVOS_STANDBY.AUDITORIA,
      idMotivoStandby,
      {
        dadosAnteriores: {
          motivo: registroAtual.MOTIVO
        },
        dadosAtualizados: {
          motivo: motivo
        }
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_MOTIVOS_STANDBY.ABA,
        MODULO_MOTIVOS_STANDBY.CAMPO_ID,
        idMotivoStandby
      );

    return respostaSucesso(
      'Motivo de stand-by atualizado com sucesso.',
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
 * Inativa um motivo de stand-by.
 */
function inativarMotivoStandby(
  idMotivoStandby
) {
  return alterarSituacaoMotivoStandby_(
    idMotivoStandby,
    false
  );
}


/**
 * Reativa um motivo de stand-by.
 */
function reativarMotivoStandby(
  idMotivoStandby
) {
  return alterarSituacaoMotivoStandby_(
    idMotivoStandby,
    true
  );
}


/**
 * Altera o campo ATIVO de um motivo de stand-by.
 */
function alterarSituacaoMotivoStandby_(
  idMotivoStandby,
  ativo
) {
  try {
    exigirCampo(
      idMotivoStandby,
      'ID do motivo de stand-by'
    );

    const registro = localizarRegistro(
      MODULO_MOTIVOS_STANDBY.ABA,
      MODULO_MOTIVOS_STANDBY.CAMPO_ID,
      idMotivoStandby
    );

    if (!registro) {
      throw new Error(
        'Motivo de stand-by não encontrado.'
      );
    }

    const situacaoAtual =
      interpretarBooleanoMotivoStandby_(
        registro.ATIVO
      );

    if (situacaoAtual === ativo) {
      return respostaSucesso(
        ativo
          ? 'O motivo de stand-by já está ativo.'
          : 'O motivo de stand-by já está inativo.',
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
      MODULO_MOTIVOS_STANDBY.ABA,
      MODULO_MOTIVOS_STANDBY.CAMPO_ID,
      idMotivoStandby,
      atualizacao
    );

    registrarAuditoria(
      ativo ? 'REATIVACAO' : 'INATIVACAO',
      MODULO_MOTIVOS_STANDBY.AUDITORIA,
      idMotivoStandby,
      {
        motivo: registro.MOTIVO,
        ativoAnterior: situacaoAtual,
        novoAtivo: ativo
      },
      usuario
    );

    const registroAtualizado =
      localizarRegistro(
        MODULO_MOTIVOS_STANDBY.ABA,
        MODULO_MOTIVOS_STANDBY.CAMPO_ID,
        idMotivoStandby
      );

    return respostaSucesso(
      ativo
        ? 'Motivo de stand-by reativado com sucesso.'
        : 'Motivo de stand-by inativado com sucesso.',
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
 * Lista os motivos de stand-by.
 *
 * Quando apenasAtivos for verdadeiro,
 * retorna somente registros ativos.
 */
function listarMotivosStandby(
  apenasAtivos
) {
  const registros = listarRegistros(
    MODULO_MOTIVOS_STANDBY.ABA
  );

  return registros
    .filter(function(registro) {
      if (!apenasAtivos) {
        return true;
      }

      return interpretarBooleanoMotivoStandby_(
        registro.ATIVO
      );
    })
    .sort(function(a, b) {
      return String(
        a.MOTIVO || ''
      ).localeCompare(
        String(
          b.MOTIVO || ''
        ),
        'pt-BR'
      );
    });
}


/**
 * Lista somente motivos de stand-by ativos.
 */
function listarMotivosStandbyAtivos() {
  return listarMotivosStandby(true);
}


/**
 * Lista todos os motivos de stand-by.
 */
function listarTodosMotivosStandby() {
  return listarMotivosStandby(false);
}


/**
 * Localiza um motivo de stand-by pelo ID.
 */
function obterMotivoStandbyPorId(
  idMotivoStandby
) {
  try {
    exigirCampo(
      idMotivoStandby,
      'ID do motivo de stand-by'
    );

    const registro = localizarRegistro(
      MODULO_MOTIVOS_STANDBY.ABA,
      MODULO_MOTIVOS_STANDBY.CAMPO_ID,
      idMotivoStandby
    );

    if (!registro) {
      throw new Error(
        'Motivo de stand-by não encontrado.'
      );
    }

    return respostaSucesso(
      'Motivo de stand-by localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Localiza um motivo de stand-by pelo nome.
 */
function obterMotivoStandbyPorNome(
  nomeMotivo
) {
  try {
    const motivo = normalizarTexto(
      nomeMotivo
    );

    exigirCampo(
      motivo,
      'Motivo de stand-by'
    );

    const registros =
      listarMotivosStandby(false);

    const registro = registros.find(
      function(item) {
        return (
          normalizarParaComparacao(
            item.MOTIVO
          ) ===
          normalizarParaComparacao(
            motivo
          )
        );
      }
    );

    if (!registro) {
      throw new Error(
        'Motivo de stand-by não encontrado.'
      );
    }

    return respostaSucesso(
      'Motivo de stand-by localizado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Verifica se um motivo de stand-by está ativo.
 */
function motivoStandbyEstaAtivo(
  idMotivoStandby
) {
  try {
    exigirCampo(
      idMotivoStandby,
      'ID do motivo de stand-by'
    );

    const registro = localizarRegistro(
      MODULO_MOTIVOS_STANDBY.ABA,
      MODULO_MOTIVOS_STANDBY.CAMPO_ID,
      idMotivoStandby
    );

    if (!registro) {
      throw new Error(
        'Motivo de stand-by não encontrado.'
      );
    }

    return respostaSucesso(
      'Situação do motivo de stand-by consultada.',
      {
        idMotivoStandby:
          registro.ID_MOTIVO_STANDBY,

        motivo:
          registro.MOTIVO,

        ativo:
          interpretarBooleanoMotivoStandby_(
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
 * Cadastra os motivos de stand-by iniciais.
 *
 * Pode ser executada mais de uma vez.
 * Não cria registros duplicados.
 */
function popularMotivosStandbyPadrao() {
  try {
    const motivosPadrao = [
      'Aguardando DDS',
      'Aguardando emissão da PT',
      'Aguardando liberação da PET',
      'Aguardando liberação da área',
      'Aguardando autorização do cliente',
      'Aguardando fiscalização',
      'Aguardando equipe do cliente',
      'Aguardando equipamento',
      'Aguardando material',
      'Aguardando transporte',
      'Aguardando movimentação de carga',
      'Aguardando abertura do tanque',
      'Aguardando ventilação do ambiente',
      'Aguardando monitoramento de gases',
      'Falta de energia',
      'Falha de equipamento',
      'Manutenção de equipamento',
      'Condição climática adversa',
      'Interrupção por segurança',
      'Simulado de emergência',
      'Incidente operacional',
      'Interferência de outra atividade',
      'Área indisponível',
      'Embarcação indisponível',
      'Unidade indisponível',
      'Orientação do cliente',
      'Outro'
    ];

    const cadastrados = [];
    const existentes = [];
    const reativados = [];
    const erros = [];

    motivosPadrao.forEach(function(
      nomeMotivo
    ) {
      const registros =
        listarMotivosStandby(false);

      const registroExistente =
        registros.find(function(registro) {
          return (
            normalizarParaComparacao(
              registro.MOTIVO
            ) ===
            normalizarParaComparacao(
              nomeMotivo
            )
          );
        });

      if (!registroExistente) {
        const resultadoCadastro =
          cadastrarMotivoStandby({
            motivo: nomeMotivo
          });

        if (resultadoCadastro.sucesso) {
          cadastrados.push(
            nomeMotivo
          );
        } else {
          erros.push({
            motivo: nomeMotivo,
            mensagem:
              resultadoCadastro.mensagem
          });
        }

        return;
      }

      const estaAtivo =
        interpretarBooleanoMotivoStandby_(
          registroExistente.ATIVO
        );

      if (!estaAtivo) {
        const resultadoReativacao =
          reativarMotivoStandby(
            registroExistente
              .ID_MOTIVO_STANDBY
          );

        if (resultadoReativacao.sucesso) {
          reativados.push(
            nomeMotivo
          );
        } else {
          erros.push({
            motivo: nomeMotivo,
            mensagem:
              resultadoReativacao.mensagem
          });
        }

        return;
      }

      existentes.push(
        nomeMotivo
      );
    });

    if (erros.length > 0) {
      throw new Error(
        'A carga inicial foi concluída com erros: ' +
        JSON.stringify(erros)
      );
    }

    return respostaSucesso(
      'Carga inicial de motivos de stand-by concluída.',
      {
        cadastrados:
          cadastrados,

        reativados:
          reativados,

        existentes:
          existentes,

        totalAtivos:
          listarMotivosStandbyAtivos()
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
 * Valida se já existe outro motivo de stand-by
 * com o mesmo nome.
 */
function validarDuplicidadeMotivoStandby_(
  motivo,
  idIgnorado
) {
  const registros = listarRegistros(
    MODULO_MOTIVOS_STANDBY.ABA
  );

  const duplicado = registros.some(
    function(registro) {
      const mesmoNome =
        normalizarParaComparacao(
          registro.MOTIVO
        ) ===
        normalizarParaComparacao(
          motivo
        );

      const outroRegistro =
        normalizarParaComparacao(
          registro.ID_MOTIVO_STANDBY
        ) !==
        normalizarParaComparacao(
          idIgnorado
        );

      return mesmoNome && outroRegistro;
    }
  );

  if (duplicado) {
    throw new Error(
      'Já existe um motivo de stand-by com este nome.'
    );
  }
}


/**
 * Interpreta valores armazenados na coluna ATIVO.
 */
function interpretarBooleanoMotivoStandby_(
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
function testarModuloMotivosStandby() {
  const funcoesDisponiveis = {
    cadastrar:
      typeof cadastrarMotivoStandby ===
      'function',

    atualizar:
      typeof atualizarMotivoStandby ===
      'function',

    inativar:
      typeof inativarMotivoStandby ===
      'function',

    reativar:
      typeof reativarMotivoStandby ===
      'function',

    listar:
      typeof listarMotivosStandby ===
      'function',

    popular:
      typeof popularMotivosStandbyPadrao ===
      'function'
  };

  const resultado = {
    sucesso: true,

    modulo:
      MODULO_MOTIVOS_STANDBY.AUDITORIA,

    versao:
      MODULO_MOTIVOS_STANDBY.VERSAO,

    aba:
      MODULO_MOTIVOS_STANDBY.ABA,

    abaExiste:
      abaExiste(
        MODULO_MOTIVOS_STANDBY.ABA
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
      'O módulo de motivos de stand-by possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de motivos de stand-by carregado corretamente.',
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
function testarCrudMotivosStandby() {
  const identificador =
    new Date().getTime();

  const nomeInicial =
    'TESTE STANDBY ' +
    identificador;

  const nomeAtualizado =
    'TESTE STANDBY ATUALIZADO ' +
    identificador;

  const etapas = {};
  let idMotivoStandby = '';

  try {
    etapas.cadastro =
      cadastrarMotivoStandby({
        motivo: nomeInicial
      });

    if (!etapas.cadastro.sucesso) {
      throw new Error(
        etapas.cadastro.mensagem ||
        'Falha no cadastro.'
      );
    }

    idMotivoStandby =
      etapas.cadastro
        .dados
        .ID_MOTIVO_STANDBY;

    etapas.atualizacao =
      atualizarMotivoStandby(
        idMotivoStandby,
        {
          motivo: nomeAtualizado
        }
      );

    if (!etapas.atualizacao.sucesso) {
      throw new Error(
        etapas.atualizacao.mensagem ||
        'Falha na atualização.'
      );
    }

    etapas.inativacao =
      inativarMotivoStandby(
        idMotivoStandby
      );

    if (!etapas.inativacao.sucesso) {
      throw new Error(
        etapas.inativacao.mensagem ||
        'Falha na inativação.'
      );
    }

    etapas.reativacao =
      reativarMotivoStandby(
        idMotivoStandby
      );

    if (!etapas.reativacao.sucesso) {
      throw new Error(
        etapas.reativacao.mensagem ||
        'Falha na reativação.'
      );
    }

    etapas.inativacaoFinal =
      inativarMotivoStandby(
        idMotivoStandby
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
        MODULO_MOTIVOS_STANDBY.ABA,
        MODULO_MOTIVOS_STANDBY.CAMPO_ID,
        idMotivoStandby
      );

    if (
      interpretarBooleanoMotivoStandby_(
        registroFinal.ATIVO
      )
    ) {
      throw new Error(
        'O registro de teste deveria terminar inativo.'
      );
    }

    const resultado = {
      sucesso: true,

      idMotivoStandby:
        idMotivoStandby,

      nomeFinal:
        registroFinal.MOTIVO,

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
      'CRUD de motivos de stand-by testado com sucesso.',
      'SLOG OPS',
      5
    );

    return resultado;
  } catch (erro) {
    if (idMotivoStandby) {
      try {
        inativarMotivoStandby(
          idMotivoStandby
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

      idMotivoStandby:
        idMotivoStandby,

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
function testarTudoMotivosStandby() {
  const modulo =
    testarModuloMotivosStandby();

  const cargaInicial =
    popularMotivosStandbyPadrao();

  if (!cargaInicial.sucesso) {
    throw new Error(
      cargaInicial.mensagem ||
      'Falha na carga inicial.'
    );
  }

  const crud =
    testarCrudMotivosStandby();

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