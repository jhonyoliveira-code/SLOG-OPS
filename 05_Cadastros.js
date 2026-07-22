/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 05_Cadastros.gs
 * Responsabilidade: cadastros-base do sistema.
 * =========================================================
 */


/* =========================================================
 * ADMINISTRADORES
 * =========================================================
 */

/**
 * Cadastra um administrador.
 *
 * Exemplo:
 * cadastrarAdministrador({
 *   nome: 'Anderson Gabriel',
 *   cpf: '00000000000',
 *   email: 'email@empresa.com',
 *   perfil: 'ADMIN_MESTRE'
 * });
 */
function cadastrarAdministrador(dados) {
  try {
    dados = dados || {};

    const nome = normalizarTexto(dados.nome);
    const cpf = somenteNumeros(dados.cpf);
    const email = normalizarEmail(dados.email);
    const perfil = normalizarParaComparacao(dados.perfil);
    const usuario = obterUsuarioAtual();

    exigirCampo(nome, 'Nome');
    exigirCampo(email, 'E-mail');
    exigirCampo(perfil, 'Perfil');

    if (!validarEmail(email)) {
      throw new Error('O e-mail informado é inválido.');
    }

    validarCpfCadastro_(cpf);

    const perfisPermitidos = [
      SLOG_CONFIG.PERFIS.ADMIN_MESTRE,
      SLOG_CONFIG.PERFIS.ADMINISTRADOR
    ];

    if (perfisPermitidos.indexOf(perfil) === -1) {
      throw new Error('O perfil do administrador é inválido.');
    }

    if (
      registroExiste(
        SLOG_ABAS.ADMINISTRADORES.nome,
        'EMAIL',
        email
      )
    ) {
      throw new Error('Já existe um administrador com este e-mail.');
    }

    if (
      cpf &&
      registroExiste(
        SLOG_ABAS.ADMINISTRADORES.nome,
        'CPF',
        cpf
      )
    ) {
      throw new Error('Já existe um administrador com este CPF.');
    }

    const registro = {
      ID_ADM: gerarId(
        SLOG_CONFIG.PREFIXOS.ADMINISTRADOR
      ),
      NOME: nome,
      CPF: cpf,
      EMAIL: email,
      PERFIL: perfil,
      ORDEM: obterProximaOrdemfuncaoOperacional_(),Ativo: true,
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.ADMINISTRADORES.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      'ADMINISTRADORES',
      registro.ID_ADM,
      {
        nome: registro.NOME,
        email: registro.EMAIL,
        perfil: registro.PERFIL
      },
      usuario
    );

    return respostaSucesso(
      'Administrador cadastrado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Atualiza um administrador.
 */
function atualizarAdministrador(idAdministrador, dados) {
  try {
    dados = dados || {};

    exigirCampo(idAdministrador, 'ID do administrador');

    const registroAtual = localizarRegistro(
      SLOG_ABAS.ADMINISTRADORES.nome,
      'ID_ADM',
      idAdministrador
    );

    if (!registroAtual) {
      throw new Error('Administrador não encontrado.');
    }

    const atualizacao = {};
    const usuario = obterUsuarioAtual();

    if (dados.nome !== undefined) {
      const nome = normalizarTexto(dados.nome);
      exigirCampo(nome, 'Nome');
      atualizacao.NOME = nome;
    }

    if (dados.cpf !== undefined) {
      const cpf = somenteNumeros(dados.cpf);
      validarCpfCadastro_(cpf);

      validarDuplicidadeCampo_(
        SLOG_ABAS.ADMINISTRADORES.nome,
        'CPF',
        cpf,
        'ID_ADM',
        idAdministrador,
        'Já existe outro administrador com este CPF.'
      );

      atualizacao.CPF = cpf;
    }

    if (dados.email !== undefined) {
      const email = normalizarEmail(dados.email);

      exigirCampo(email, 'E-mail');

      if (!validarEmail(email)) {
        throw new Error('O e-mail informado é inválido.');
      }

      validarDuplicidadeCampo_(
        SLOG_ABAS.ADMINISTRADORES.nome,
        'EMAIL',
        email,
        'ID_ADM',
        idAdministrador,
        'Já existe outro administrador com este e-mail.'
      );

      atualizacao.EMAIL = email;
    }

    if (dados.perfil !== undefined) {
      const perfil = normalizarParaComparacao(
        dados.perfil
      );

      const perfisPermitidos = [
        SLOG_CONFIG.PERFIS.ADMIN_MESTRE,
        SLOG_CONFIG.PERFIS.ADMINISTRADOR
      ];

      if (perfisPermitidos.indexOf(perfil) === -1) {
        throw new Error('O perfil informado é inválido.');
      }

      atualizacao.PERFIL = perfil;
    }

    atualizacao.ATUALIZADO_EM = agora();
    atualizacao.ATUALIZADO_POR = usuario;

    atualizarRegistroPorCampo(
      SLOG_ABAS.ADMINISTRADORES.nome,
      'ID_ADM',
      idAdministrador,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      'ADMINISTRADORES',
      idAdministrador,
      atualizacao,
      usuario
    );

    return respostaSucesso(
      'Administrador atualizado com sucesso.',
      atualizacao
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Inativa um administrador sem excluir o registro.
 */
function inativarAdministrador(idAdministrador) {
  return alterarStatusCadastro_(
    SLOG_ABAS.ADMINISTRADORES.nome,
    'ID_ADM',
    idAdministrador,
    'ADMINISTRADORES',
    SLOG_CONFIG.STATUS.INATIVO
  );
}


/**
 * Reativa um administrador.
 */
function reativarAdministrador(idAdministrador) {
  return alterarStatusCadastro_(
    SLOG_ABAS.ADMINISTRADORES.nome,
    'ID_ADM',
    idAdministrador,
    'ADMINISTRADORES',
    SLOG_CONFIG.STATUS.ATIVO
  );
}


/* =========================================================
 * COLABORADORES
 * =========================================================
 */

/**
 * Cadastra um colaborador.
 *
 * Exemplo:
 * cadastrarColaborador({
 *   matricula: '0001',
 *   nome: 'Saymon Serra',
 *   cpf: '00000000000',
 *   funcao: 'Supervisor'
 * });
 */
function cadastrarColaborador(dados) {
  try {
    dados = dados || {};

    const matricula = normalizarTexto(dados.matricula);
    const nome = normalizarTexto(dados.nome);
    const cpf = somenteNumeros(dados.cpf);
    const funcao = normalizarTexto(dados.funcao);
    const usuario = obterUsuarioAtual();

    exigirCampo(matricula, 'Matrícula');
    exigirCampo(nome, 'Nome');
    exigirCampo(funcao, 'Função');

    validarCpfCadastro_(cpf);

    if (
      registroExiste(
        SLOG_ABAS.COLABORADORES.nome,
        'MATRICULA',
        matricula
      )
    ) {
      throw new Error(
        'Já existe um colaborador com esta matrícula.'
      );
    }

    if (
      cpf &&
      registroExiste(
        SLOG_ABAS.COLABORADORES.nome,
        'CPF',
        cpf
      )
    ) {
      throw new Error(
        'Já existe um colaborador com este CPF.'
      );
    }

    const registro = {
      ID_COLABORADOR: gerarId(
        SLOG_CONFIG.PREFIXOS.COLABORADOR
      ),
      MATRICULA: matricula,
      NOME: nome,
      CPF: cpf,
      FUNCAO: funcao,
      STATUS: SLOG_CONFIG.STATUS.ATIVO,
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.COLABORADORES.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      'COLABORADORES',
      registro.ID_COLABORADOR,
      {
        matricula: registro.MATRICULA,
        nome: registro.NOME,
        funcao: registro.FUNCAO
      },
      usuario
    );

    return respostaSucesso(
      'Colaborador cadastrado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Atualiza um colaborador.
 */
function atualizarColaborador(idColaborador, dados) {
  try {
    dados = dados || {};

    exigirCampo(idColaborador, 'ID do colaborador');

    const registroAtual = localizarRegistro(
      SLOG_ABAS.COLABORADORES.nome,
      'ID_COLABORADOR',
      idColaborador
    );

    if (!registroAtual) {
      throw new Error('Colaborador não encontrado.');
    }

    const atualizacao = {};
    const usuario = obterUsuarioAtual();

    if (dados.matricula !== undefined) {
      const matricula = normalizarTexto(
        dados.matricula
      );

      exigirCampo(matricula, 'Matrícula');

      validarDuplicidadeCampo_(
        SLOG_ABAS.COLABORADORES.nome,
        'MATRICULA',
        matricula,
        'ID_COLABORADOR',
        idColaborador,
        'Já existe outro colaborador com esta matrícula.'
      );

      atualizacao.MATRICULA = matricula;
    }

    if (dados.nome !== undefined) {
      const nome = normalizarTexto(dados.nome);
      exigirCampo(nome, 'Nome');
      atualizacao.NOME = nome;
    }

    if (dados.cpf !== undefined) {
      const cpf = somenteNumeros(dados.cpf);
      validarCpfCadastro_(cpf);

      validarDuplicidadeCampo_(
        SLOG_ABAS.COLABORADORES.nome,
        'CPF',
        cpf,
        'ID_COLABORADOR',
        idColaborador,
        'Já existe outro colaborador com este CPF.'
      );

      atualizacao.CPF = cpf;
    }

    if (dados.funcao !== undefined) {
      const funcao = normalizarTexto(dados.funcao);
      exigirCampo(funcao, 'Função');
      atualizacao.FUNCAO = funcao;
    }

    atualizacao.ATUALIZADO_EM = agora();
    atualizacao.ATUALIZADO_POR = usuario;

    atualizarRegistroPorCampo(
      SLOG_ABAS.COLABORADORES.nome,
      'ID_COLABORADOR',
      idColaborador,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      'COLABORADORES',
      idColaborador,
      atualizacao,
      usuario
    );

    return respostaSucesso(
      'Colaborador atualizado com sucesso.',
      atualizacao
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Inativa um colaborador.
 *
 * Caso seja supervisor, o acesso também será inativado.
 */
function inativarColaborador(idColaborador) {
  try {
    const resultado = alterarStatusCadastro_(
      SLOG_ABAS.COLABORADORES.nome,
      'ID_COLABORADOR',
      idColaborador,
      'COLABORADORES',
      SLOG_CONFIG.STATUS.INATIVO
    );

    if (!resultado.sucesso) {
      return resultado;
    }

    const supervisor = localizarRegistro(
      SLOG_ABAS.SUPERVISORES.nome,
      'ID_COLABORADOR',
      idColaborador
    );

    if (supervisor) {
      atualizarRegistroPorCampo(
        SLOG_ABAS.SUPERVISORES.nome,
        'ID_SUPERVISOR',
        supervisor.ID_SUPERVISOR,
        {
          STATUS: SLOG_CONFIG.STATUS.INATIVO,
          ATUALIZADO_EM: agora(),
          ATUALIZADO_POR: obterUsuarioAtual()
        }
      );
    }

    return resultado;
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Reativa um colaborador.
 *
 * A reativação do acesso de supervisor deve ser feita separadamente.
 */
function reativarColaborador(idColaborador) {
  return alterarStatusCadastro_(
    SLOG_ABAS.COLABORADORES.nome,
    'ID_COLABORADOR',
    idColaborador,
    'COLABORADORES',
    SLOG_CONFIG.STATUS.ATIVO
  );
}


/* =========================================================
 * SUPERVISORES
 * =========================================================
 */

/**
 * Concede acesso de supervisor a um colaborador.
 *
 * Exemplo:
 * cadastrarSupervisor({
 *   idColaborador: 'COL-XXXXXXXXXX',
 *   pin: '1234'
 * });
 */
function cadastrarSupervisor(dados) {
  try {
    dados = dados || {};

    const idColaborador = normalizarTexto(
      dados.idColaborador
    );

    const pin = String(dados.pin || '');
    const usuario = obterUsuarioAtual();

    exigirCampo(
      idColaborador,
      'ID do colaborador'
    );

    if (!validarPin(pin)) {
      throw new Error(
        'O PIN deve possuir exatamente quatro números.'
      );
    }

    const colaborador = localizarRegistro(
      SLOG_ABAS.COLABORADORES.nome,
      'ID_COLABORADOR',
      idColaborador
    );

    if (!colaborador) {
      throw new Error('Colaborador não encontrado.');
    }

    if (
      normalizarParaComparacao(colaborador.STATUS) !==
      SLOG_CONFIG.STATUS.ATIVO
    ) {
      throw new Error(
        'O colaborador precisa estar ativo.'
      );
    }

    if (
      registroExiste(
        SLOG_ABAS.SUPERVISORES.nome,
        'ID_COLABORADOR',
        idColaborador
      )
    ) {
      throw new Error(
        'Este colaborador já possui cadastro de supervisor.'
      );
    }

    const login = gerarLoginSupervisorUnico_(
      colaborador.NOME
    );

    const registro = {
      ID_SUPERVISOR: gerarId(
        SLOG_CONFIG.PREFIXOS.SUPERVISOR
      ),
      ID_COLABORADOR: idColaborador,
      LOGIN: login,
      PIN_HASH: gerarHash(pin),
      STATUS: SLOG_CONFIG.STATUS.ATIVO,
      ULTIMO_ACESSO: '',
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.SUPERVISORES.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO_ACESSO',
      'SUPERVISORES',
      registro.ID_SUPERVISOR,
      {
        idColaborador: idColaborador,
        nome: colaborador.NOME,
        login: login
      },
      usuario
    );

    return respostaSucesso(
      'Supervisor cadastrado com sucesso.',
      {
        idSupervisor: registro.ID_SUPERVISOR,
        idColaborador: idColaborador,
        nome: colaborador.NOME,
        login: login,
        status: registro.STATUS
      }
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Altera o PIN de um supervisor.
 */
function alterarPinSupervisor(idSupervisor, novoPin) {
  try {
    exigirCampo(idSupervisor, 'ID do supervisor');

    if (!validarPin(novoPin)) {
      throw new Error(
        'O novo PIN deve possuir exatamente quatro números.'
      );
    }

    const supervisor = localizarRegistro(
      SLOG_ABAS.SUPERVISORES.nome,
      'ID_SUPERVISOR',
      idSupervisor
    );

    if (!supervisor) {
      throw new Error('Supervisor não encontrado.');
    }

    const usuario = obterUsuarioAtual();

    atualizarRegistroPorCampo(
      SLOG_ABAS.SUPERVISORES.nome,
      'ID_SUPERVISOR',
      idSupervisor,
      {
        PIN_HASH: gerarHash(novoPin),
        ATUALIZADO_EM: agora(),
        ATUALIZADO_POR: usuario
      }
    );

    registrarAuditoria(
      'ALTERACAO_PIN',
      'SUPERVISORES',
      idSupervisor,
      {
        login: supervisor.LOGIN
      },
      usuario
    );

    return respostaSucesso(
      'PIN alterado com sucesso.',
      {
        idSupervisor: idSupervisor,
        login: supervisor.LOGIN
      }
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Inativa o acesso de supervisor.
 */
function inativarSupervisor(idSupervisor) {
  return alterarStatusCadastro_(
    SLOG_ABAS.SUPERVISORES.nome,
    'ID_SUPERVISOR',
    idSupervisor,
    'SUPERVISORES',
    SLOG_CONFIG.STATUS.INATIVO
  );
}


/**
 * Reativa o acesso de supervisor.
 */
function reativarSupervisor(idSupervisor) {
  try {
    exigirCampo(idSupervisor, 'ID do supervisor');

    const supervisor = localizarRegistro(
      SLOG_ABAS.SUPERVISORES.nome,
      'ID_SUPERVISOR',
      idSupervisor
    );

    if (!supervisor) {
      throw new Error('Supervisor não encontrado.');
    }

    const colaborador = localizarRegistro(
      SLOG_ABAS.COLABORADORES.nome,
      'ID_COLABORADOR',
      supervisor.ID_COLABORADOR
    );

    if (!colaborador) {
      throw new Error(
        'O colaborador vinculado não foi encontrado.'
      );
    }

    if (
      normalizarParaComparacao(colaborador.STATUS) !==
      SLOG_CONFIG.STATUS.ATIVO
    ) {
      throw new Error(
        'Reative primeiro o cadastro do colaborador.'
      );
    }

    return alterarStatusCadastro_(
      SLOG_ABAS.SUPERVISORES.nome,
      'ID_SUPERVISOR',
      idSupervisor,
      'SUPERVISORES',
      SLOG_CONFIG.STATUS.ATIVO
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Retorna os supervisores com os dados dos colaboradores.
 */
function listarSupervisoresCompletos(apenasAtivos) {
  const supervisores = listarRegistros(
    SLOG_ABAS.SUPERVISORES.nome
  );

  const colaboradores = listarRegistros(
    SLOG_ABAS.COLABORADORES.nome
  );

  return supervisores
    .filter(function(supervisor) {
      if (!apenasAtivos) {
        return true;
      }

      return (
        normalizarParaComparacao(supervisor.STATUS) ===
        SLOG_CONFIG.STATUS.ATIVO
      );
    })
    .map(function(supervisor) {
      const colaborador = colaboradores.find(
        function(item) {
          return (
            item.ID_COLABORADOR ===
            supervisor.ID_COLABORADOR
          );
        }
      );

      return {
        ID_SUPERVISOR: supervisor.ID_SUPERVISOR,
        ID_COLABORADOR: supervisor.ID_COLABORADOR,
        MATRICULA: colaborador
          ? colaborador.MATRICULA
          : '',
        NOME: colaborador ? colaborador.NOME : '',
        CPF: colaborador ? colaborador.CPF : '',
        FUNCAO: colaborador
          ? colaborador.FUNCAO
          : '',
        LOGIN: supervisor.LOGIN,
        STATUS: supervisor.STATUS,
        ULTIMO_ACESSO: supervisor.ULTIMO_ACESSO
      };
    });
}


/* =========================================================
 * CLIENTES
 * =========================================================
 */

/**
 * Cadastra um cliente.
 */
function cadastrarCliente(dados) {
  try {
    dados = dados || {};

    const cliente = normalizarTexto(dados.cliente);
    const usuario = obterUsuarioAtual();

    exigirCampo(cliente, 'Cliente');

    if (
      registroExiste(
        SLOG_ABAS.CLIENTES.nome,
        'CLIENTE',
        cliente
      )
    ) {
      throw new Error(
        'Já existe um cliente com este nome.'
      );
    }

    const registro = {
      ID_CLIENTE: gerarId(
        SLOG_CONFIG.PREFIXOS.CLIENTE
      ),
      CLIENTE: cliente,
      STATUS: SLOG_CONFIG.STATUS.ATIVO,
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.CLIENTES.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      'CLIENTES',
      registro.ID_CLIENTE,
      {
        cliente: cliente
      },
      usuario
    );

    return respostaSucesso(
      'Cliente cadastrado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Atualiza o nome de um cliente.
 */
function atualizarCliente(idCliente, novoNome) {
  try {
    exigirCampo(idCliente, 'ID do cliente');

    const cliente = normalizarTexto(novoNome);
    exigirCampo(cliente, 'Cliente');

    const registroAtual = localizarRegistro(
      SLOG_ABAS.CLIENTES.nome,
      'ID_CLIENTE',
      idCliente
    );

    if (!registroAtual) {
      throw new Error('Cliente não encontrado.');
    }

    validarDuplicidadeCampo_(
      SLOG_ABAS.CLIENTES.nome,
      'CLIENTE',
      cliente,
      'ID_CLIENTE',
      idCliente,
      'Já existe outro cliente com este nome.'
    );

    const usuario = obterUsuarioAtual();

    atualizarRegistroPorCampo(
      SLOG_ABAS.CLIENTES.nome,
      'ID_CLIENTE',
      idCliente,
      {
        CLIENTE: cliente,
        ATUALIZADO_EM: agora(),
        ATUALIZADO_POR: usuario
      }
    );

    registrarAuditoria(
      'ATUALIZACAO',
      'CLIENTES',
      idCliente,
      {
        nomeAnterior: registroAtual.CLIENTE,
        novoNome: cliente
      },
      usuario
    );

    return respostaSucesso(
      'Cliente atualizado com sucesso.',
      {
        idCliente: idCliente,
        cliente: cliente
      }
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


function inativarCliente(idCliente) {
  return alterarStatusCadastro_(
    SLOG_ABAS.CLIENTES.nome,
    'ID_CLIENTE',
    idCliente,
    'CLIENTES',
    SLOG_CONFIG.STATUS.INATIVO
  );
}


function reativarCliente(idCliente) {
  return alterarStatusCadastro_(
    SLOG_ABAS.CLIENTES.nome,
    'ID_CLIENTE',
    idCliente,
    'CLIENTES',
    SLOG_CONFIG.STATUS.ATIVO
  );
}


/* =========================================================
 * UNIDADES
 * =========================================================
 */

/**
 * Cadastra uma unidade vinculada a um cliente.
 *
 * Tipos sugeridos:
 * EMBARCACAO
 * FPSO
 * PLATAFORMA
 * BALSA
 */
function cadastrarUnidade(dados) {
  try {
    dados = dados || {};

    const idCliente = normalizarTexto(
      dados.idCliente
    );

    const unidade = normalizarTexto(dados.unidade);
    const tipo = normalizarParaComparacao(dados.tipo);
    const usuario = obterUsuarioAtual();

    exigirCampo(idCliente, 'ID do cliente');
    exigirCampo(unidade, 'Unidade');
    exigirCampo(tipo, 'Tipo');

    const cliente = localizarRegistro(
      SLOG_ABAS.CLIENTES.nome,
      'ID_CLIENTE',
      idCliente
    );

    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    if (
      normalizarParaComparacao(cliente.STATUS) !==
      SLOG_CONFIG.STATUS.ATIVO
    ) {
      throw new Error(
        'O cliente precisa estar ativo.'
      );
    }

    const duplicada = filtrarRegistros(
      SLOG_ABAS.UNIDADES.nome,
      function(registro) {
        return (
          normalizarParaComparacao(
            registro.ID_CLIENTE
          ) ===
            normalizarParaComparacao(idCliente) &&
          normalizarParaComparacao(
            registro.UNIDADE
          ) ===
            normalizarParaComparacao(unidade)
        );
      }
    );

    if (duplicada.length > 0) {
      throw new Error(
        'Esta unidade já está cadastrada para o cliente.'
      );
    }

    const registro = {
      ID_UNIDADE: gerarId(
        SLOG_CONFIG.PREFIXOS.UNIDADE
      ),
      ID_CLIENTE: idCliente,
      UNIDADE: unidade,
      TIPO: tipo,
      STATUS: SLOG_CONFIG.STATUS.ATIVO,
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.UNIDADES.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      'UNIDADES',
      registro.ID_UNIDADE,
      {
        idCliente: idCliente,
        cliente: cliente.CLIENTE,
        unidade: unidade,
        tipo: tipo
      },
      usuario
    );

    return respostaSucesso(
      'Unidade cadastrada com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Atualiza uma unidade.
 */
function atualizarUnidade(idUnidade, dados) {
  try {
    dados = dados || {};

    exigirCampo(idUnidade, 'ID da unidade');

    const unidadeAtual = localizarRegistro(
      SLOG_ABAS.UNIDADES.nome,
      'ID_UNIDADE',
      idUnidade
    );

    if (!unidadeAtual) {
      throw new Error('Unidade não encontrada.');
    }

    const idCliente = dados.idCliente !== undefined
      ? normalizarTexto(dados.idCliente)
      : unidadeAtual.ID_CLIENTE;

    const unidade = dados.unidade !== undefined
      ? normalizarTexto(dados.unidade)
      : unidadeAtual.UNIDADE;

    const tipo = dados.tipo !== undefined
      ? normalizarParaComparacao(dados.tipo)
      : unidadeAtual.TIPO;

    exigirCampo(idCliente, 'ID do cliente');
    exigirCampo(unidade, 'Unidade');
    exigirCampo(tipo, 'Tipo');

    const cliente = localizarRegistro(
      SLOG_ABAS.CLIENTES.nome,
      'ID_CLIENTE',
      idCliente
    );

    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    const duplicadas = filtrarRegistros(
      SLOG_ABAS.UNIDADES.nome,
      function(registro) {
        return (
          registro.ID_UNIDADE !== idUnidade &&
          normalizarParaComparacao(
            registro.ID_CLIENTE
          ) === normalizarParaComparacao(idCliente) &&
          normalizarParaComparacao(
            registro.UNIDADE
          ) === normalizarParaComparacao(unidade)
        );
      }
    );

    if (duplicadas.length > 0) {
      throw new Error(
        'Já existe outra unidade com este nome para o cliente.'
      );
    }

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      ID_CLIENTE: idCliente,
      UNIDADE: unidade,
      TIPO: tipo,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      SLOG_ABAS.UNIDADES.nome,
      'ID_UNIDADE',
      idUnidade,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      'UNIDADES',
      idUnidade,
      atualizacao,
      usuario
    );

    return respostaSucesso(
      'Unidade atualizada com sucesso.',
      atualizacao
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


function inativarUnidade(idUnidade) {
  return alterarStatusCadastro_(
    SLOG_ABAS.UNIDADES.nome,
    'ID_UNIDADE',
    idUnidade,
    'UNIDADES',
    SLOG_CONFIG.STATUS.INATIVO
  );
}


function reativarUnidade(idUnidade) {
  return alterarStatusCadastro_(
    SLOG_ABAS.UNIDADES.nome,
    'ID_UNIDADE',
    idUnidade,
    'UNIDADES',
    SLOG_CONFIG.STATUS.ATIVO
  );
}


/* =========================================================
 * EQUIPAMENTOS
 * =========================================================
 */

/**
 * Cadastra equipamento ou kit.
 */
function cadastrarEquipamento(dados) {
  try {
    dados = dados || {};

    const equipamento = normalizarTexto(
      dados.equipamento
    );

    const unidadeMedida = normalizarTexto(
      dados.unidadeMedida || 'UNIDADE'
    );

    const usuario = obterUsuarioAtual();

    exigirCampo(equipamento, 'Equipamento');
    exigirCampo(unidadeMedida, 'Unidade de medida');

    if (
      registroExiste(
        SLOG_ABAS.EQUIPAMENTOS.nome,
        'EQUIPAMENTO',
        equipamento
      )
    ) {
      throw new Error(
        'Já existe um equipamento com este nome.'
      );
    }

    const registro = {
      ID_EQUIPAMENTO: gerarId(
        SLOG_CONFIG.PREFIXOS.EQUIPAMENTO
      ),
      EQUIPAMENTO: equipamento,
      UNIDADE_MEDIDA: unidadeMedida,
      STATUS: SLOG_CONFIG.STATUS.ATIVO,
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.EQUIPAMENTOS.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      'EQUIPAMENTOS',
      registro.ID_EQUIPAMENTO,
      {
        equipamento: equipamento,
        unidadeMedida: unidadeMedida
      },
      usuario
    );

    return respostaSucesso(
      'Equipamento cadastrado com sucesso.',
      registro
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Atualiza um equipamento.
 */
function atualizarEquipamento(idEquipamento, dados) {
  try {
    dados = dados || {};

    exigirCampo(
      idEquipamento,
      'ID do equipamento'
    );

    const registroAtual = localizarRegistro(
      SLOG_ABAS.EQUIPAMENTOS.nome,
      'ID_EQUIPAMENTO',
      idEquipamento
    );

    if (!registroAtual) {
      throw new Error('Equipamento não encontrado.');
    }

    const equipamento = dados.equipamento !== undefined
      ? normalizarTexto(dados.equipamento)
      : registroAtual.EQUIPAMENTO;

    const unidadeMedida =
      dados.unidadeMedida !== undefined
        ? normalizarTexto(dados.unidadeMedida)
        : registroAtual.UNIDADE_MEDIDA;

    exigirCampo(equipamento, 'Equipamento');
    exigirCampo(unidadeMedida, 'Unidade de medida');

    validarDuplicidadeCampo_(
      SLOG_ABAS.EQUIPAMENTOS.nome,
      'EQUIPAMENTO',
      equipamento,
      'ID_EQUIPAMENTO',
      idEquipamento,
      'Já existe outro equipamento com este nome.'
    );

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      EQUIPAMENTO: equipamento,
      UNIDADE_MEDIDA: unidadeMedida,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      SLOG_ABAS.EQUIPAMENTOS.nome,
      'ID_EQUIPAMENTO',
      idEquipamento,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      'EQUIPAMENTOS',
      idEquipamento,
      atualizacao,
      usuario
    );

    return respostaSucesso(
      'Equipamento atualizado com sucesso.',
      atualizacao
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


function inativarEquipamento(idEquipamento) {
  return alterarStatusCadastro_(
    SLOG_ABAS.EQUIPAMENTOS.nome,
    'ID_EQUIPAMENTO',
    idEquipamento,
    'EQUIPAMENTOS',
    SLOG_CONFIG.STATUS.INATIVO
  );
}


function reativarEquipamento(idEquipamento) {
  return alterarStatusCadastro_(
    SLOG_ABAS.EQUIPAMENTOS.nome,
    'ID_EQUIPAMENTO',
    idEquipamento,
    'EQUIPAMENTOS',
    SLOG_CONFIG.STATUS.ATIVO
  );
}


/* =========================================================
 * CONSULTAS GERAIS
 * =========================================================
 */

/**
 * Lista registros ativos de uma aba.
 */
function listarCadastrosAtivos(nomeAba) {
  return filtrarRegistros(
    nomeAba,
    function(registro) {
      return (
        normalizarParaComparacao(registro.STATUS) ===
        SLOG_CONFIG.STATUS.ATIVO
      );
    }
  );
}


/**
 * Lista clientes ativos.
 */
function listarClientesAtivos() {
  return listarCadastrosAtivos(
    SLOG_ABAS.CLIENTES.nome
  );
}


/**
 * Lista colaboradores ativos.
 */
function listarColaboradoresAtivos() {
  return listarCadastrosAtivos(
    SLOG_ABAS.COLABORADORES.nome
  );
}


/**
 * Lista equipamentos ativos.
 */
function listarEquipamentosAtivos() {
  return listarCadastrosAtivos(
    SLOG_ABAS.EQUIPAMENTOS.nome
  );
}


/**
 * Lista unidades ativas de determinado cliente.
 */
function listarUnidadesPorCliente(idCliente) {
  exigirCampo(idCliente, 'ID do cliente');

  return filtrarRegistros(
    SLOG_ABAS.UNIDADES.nome,
    function(registro) {
      return (
        normalizarParaComparacao(
          registro.ID_CLIENTE
        ) === normalizarParaComparacao(idCliente) &&
        normalizarParaComparacao(
          registro.STATUS
        ) === SLOG_CONFIG.STATUS.ATIVO
      );
    }
  );
}


/* =========================================================
 * FUNÇÕES INTERNAS
 * =========================================================
 */

/**
 * Altera o status de um cadastro.
 */
function alterarStatusCadastro_(
  nomeAba,
  campoId,
  valorId,
  modulo,
  novoStatus
) {
  try {
    exigirCampo(valorId, 'Identificador');

    const registro = localizarRegistro(
      nomeAba,
      campoId,
      valorId
    );

    if (!registro) {
      throw new Error('Registro não encontrado.');
    }

    const usuario = obterUsuarioAtual();

    atualizarRegistroPorCampo(
      nomeAba,
      campoId,
      valorId,
      {
        STATUS: novoStatus,
        ATUALIZADO_EM: agora(),
        ATUALIZADO_POR: usuario
      }
    );

    registrarAuditoria(
      novoStatus === SLOG_CONFIG.STATUS.ATIVO
        ? 'REATIVACAO'
        : 'INATIVACAO',
      modulo,
      valorId,
      {
        statusAnterior: registro.STATUS,
        novoStatus: novoStatus
      },
      usuario
    );

    return respostaSucesso(
      novoStatus === SLOG_CONFIG.STATUS.ATIVO
        ? 'Registro reativado com sucesso.'
        : 'Registro inativado com sucesso.',
      {
        id: valorId,
        status: novoStatus
      }
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Valida duplicidade, ignorando o próprio registro.
 */
function validarDuplicidadeCampo_(
  nomeAba,
  campoComparacao,
  valorComparacao,
  campoId,
  valorIdAtual,
  mensagemErro
) {
  if (estaVazio(valorComparacao)) {
    return;
  }

  const registros = listarRegistros(nomeAba);

  const duplicado = registros.some(function(registro) {
    return (
      normalizarParaComparacao(
        registro[campoComparacao]
      ) ===
        normalizarParaComparacao(valorComparacao) &&
      normalizarParaComparacao(
        registro[campoId]
      ) !==
        normalizarParaComparacao(valorIdAtual)
    );
  });

  if (duplicado) {
    throw new Error(
      mensagemErro || 'Já existe um registro com este valor.'
    );
  }
}


/**
 * Gera login único para supervisor.
 */
function gerarLoginSupervisorUnico_(nomeCompleto) {
  const loginBase = criarLoginPorNome(nomeCompleto);

  if (!loginBase) {
    throw new Error(
      'Não foi possível gerar o login do supervisor.'
    );
  }

  let login = loginBase;
  let contador = 2;

  while (
    registroExiste(
      SLOG_ABAS.SUPERVISORES.nome,
      'LOGIN',
      login
    )
  ) {
    login = loginBase + contador;
    contador++;
  }

  return login;
}


/**
 * Validação completa de CPF.
 *
 * O CPF pode ficar vazio, mas, quando preenchido,
 * deve possuir formato e dígitos válidos.
 */
function validarCpfCadastro_(cpf) {
  if (estaVazio(cpf)) {
    return true;
  }

  const numeros = somenteNumeros(cpf);

  if (numeros.length !== 11) {
    throw new Error(
      'O CPF deve possuir 11 números.'
    );
  }

  if (/^(\d)\1{10}$/.test(numeros)) {
    throw new Error('O CPF informado é inválido.');
  }

  let soma = 0;

  for (let indice = 0; indice < 9; indice++) {
    soma +=
      Number(numeros.charAt(indice)) *
      (10 - indice);
  }

  let digito1 = 11 - (soma % 11);

  if (digito1 >= 10) {
    digito1 = 0;
  }

  soma = 0;

  for (let indice = 0; indice < 10; indice++) {
    soma +=
      Number(numeros.charAt(indice)) *
      (11 - indice);
  }

  let digito2 = 11 - (soma % 11);

  if (digito2 >= 10) {
    digito2 = 0;
  }

  if (
    digito1 !== Number(numeros.charAt(9)) ||
    digito2 !== Number(numeros.charAt(10))
  ) {
    throw new Error('O CPF informado é inválido.');
  }

  return true;
}


/* =========================================================
 * TESTE DO MÓDULO
 * =========================================================
 */

/**
 * Valida se o módulo foi carregado.
 *
 * Não cria registros.
 */
function testarModuloCadastros() {
  const resultado = {
    sucesso: true,
    modulo: 'CADASTROS',
    abas: {
      administradores: abaExiste(
        SLOG_ABAS.ADMINISTRADORES.nome
      ),
      colaboradores: abaExiste(
        SLOG_ABAS.COLABORADORES.nome
      ),
      supervisores: abaExiste(
        SLOG_ABAS.SUPERVISORES.nome
      ),
      clientes: abaExiste(
        SLOG_ABAS.CLIENTES.nome
      ),
      unidades: abaExiste(
        SLOG_ABAS.UNIDADES.nome
      ),
      equipamentos: abaExiste(
        SLOG_ABAS.EQUIPAMENTOS.nome
      )
    },
    carregadoEm: formatarDataHora(agora())
  };

  resultado.sucesso = Object.keys(
    resultado.abas
  ).every(function(chave) {
    return resultado.abas[chave] === true;
  });

  console.log(JSON.stringify(resultado, null, 2));

  if (!resultado.sucesso) {
    throw new Error(
      'Uma ou mais abas do módulo não foram encontradas.'
    );
  }

  exibirNotificacao(
    'Módulo de cadastros carregado corretamente.',
    'SLOG OPS',
    5
  );

  return resultado;
}
/**
 * Retorna a próxima ordem disponível.
 */
function obterProximaOrdemFuncaoOperacional_() {
  const registros = listarRegistros(
    MODULO_FUNCOES.ABA
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