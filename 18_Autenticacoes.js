/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 18_Autenticacao.gs
 * Versão: 1.0.0
 * Responsabilidade:
 * Autenticação dos usuários do WebApp.
 * Controle de sessões.
 * Validação de acesso e perfis.
 * =========================================================
 */


/* =========================================================
 * CONFIGURAÇÃO DO MÓDULO
 * =========================================================
 */

const AUTENTICACAO_CONFIG = Object.freeze({

  MODULO:
    'AUTENTICACAO',

  VERSAO:
    '1.0.0',

  PREFIXO_CACHE_SESSAO:
    'SLOG_SESSAO_',

  PREFIXO_CACHE_TENTATIVAS:
    'SLOG_TENTATIVAS_',

  DURACAO_SESSAO_SEGUNDOS:
    21600,

  DURACAO_SESSAO_HORAS:
    6,

  LIMITE_TENTATIVAS:
    5,

  BLOQUEIO_TENTATIVAS_SEGUNDOS:
    900,

  PERFIL_SUPERVISOR:
    'SUPERVISOR',

  PERFIL_ADMINISTRATIVO:
    'ADMINISTRATIVO',

  AUDITORIA:
    'AUTENTICACAO'

});


/* =========================================================
 * LOGIN DO SUPERVISOR
 * =========================================================
 */

/**
 * Realiza o login do supervisor.
 *
 * Exemplo:
 *
 * autenticarSupervisor({
 *   login: 'saymon.serra',
 *   pin: '1234'
 * });
 */
function autenticarSupervisor(dados) {

  try {

    dados = dados || {};

    const login =
      normalizarLoginAutenticacao_(
        dados.login
      );

    const pin =
      String(
        dados.pin || ''
      ).trim();

    exigirCampo(
      login,
      'Login'
    );

    if (!validarPin(pin)) {

      throw new Error(
        'O PIN deve possuir exatamente quatro números.'
      );

    }

    verificarBloqueioTentativas_(
      login
    );

    const supervisor =
      localizarSupervisorPorLogin_(
        login
      );

    if (!supervisor) {

      registrarTentativaLoginFalha_(
        login,
        'LOGIN_NAO_ENCONTRADO'
      );

      throw new Error(
        'Login ou PIN inválido.'
      );

    }

    validarSupervisorAtivo_(
      supervisor
    );

    const hashInformado =
      gerarHash(pin);

    const hashCadastrado =
      normalizarTexto(
        supervisor.PIN_HASH
      );

    if (
      !hashCadastrado ||
      hashInformado !== hashCadastrado
    ) {

      registrarTentativaLoginFalha_(
        login,
        'PIN_INVALIDO'
      );

      throw new Error(
        'Login ou PIN inválido.'
      );

    }

    const colaborador =
      localizarRegistro(
        SLOG_ABAS.COLABORADORES.nome,
        'ID_COLABORADOR',
        supervisor.ID_COLABORADOR
      );

    if (!colaborador) {

      throw new Error(
        'O colaborador vinculado ao supervisor não foi encontrado.'
      );

    }

    validarColaboradorAtivo_(
      colaborador
    );

    limparTentativasLogin_(
      login
    );

    const sessao =
      criarSessaoAutenticacao_({

        idUsuario:
          supervisor.ID_SUPERVISOR,

        idColaborador:
          supervisor.ID_COLABORADOR,

        nome:
          colaborador.NOME,

        login:
          supervisor.LOGIN,

        perfil:
          AUTENTICACAO_CONFIG
            .PERFIL_SUPERVISOR,

        funcao:
          colaborador.FUNCAO,

        matricula:
          colaborador.MATRICULA,

        origem:
          'SUPERVISORES'

      });

    atualizarUltimoAcessoSupervisor_(
      supervisor.ID_SUPERVISOR
    );

    registrarAuditoria(

      'LOGIN_SUCESSO',

      AUTENTICACAO_CONFIG.AUDITORIA,

      supervisor.ID_SUPERVISOR,

      {

        login:
          supervisor.LOGIN,

        nome:
          colaborador.NOME,

        perfil:
          AUTENTICACAO_CONFIG
            .PERFIL_SUPERVISOR,

        tokenFinal:
          obterFinalTokenAutenticacao_(
            sessao.token
          )

      },

      supervisor.LOGIN

    );

    return respostaSucesso(

      'Login realizado com sucesso.',

      construirRespostaSessaoPublica_(
        sessao
      )

    );

  } catch (erro) {

    return respostaErro(erro);

  }

}


/**
 * Nome alternativo utilizado futuramente pela API.
 */
function realizarLoginSupervisor(dados) {

  return autenticarSupervisor(
    dados
  );

}


/* =========================================================
 * LOCALIZAÇÃO E VALIDAÇÃO DO SUPERVISOR
 * =========================================================
 */

/**
 * Localiza um supervisor pelo login.
 */
function localizarSupervisorPorLogin_(
  login
) {

  const loginNormalizado =
    normalizarLoginAutenticacao_(
      login
    );

  if (!loginNormalizado) {
    return null;
  }

  const supervisores =
    listarRegistros(
      SLOG_ABAS.SUPERVISORES.nome
    );

  return supervisores.find(
    function(supervisor) {

      return (
        normalizarLoginAutenticacao_(
          supervisor.LOGIN
        ) ===
        loginNormalizado
      );

    }
  ) || null;

}


/**
 * Valida se o acesso do supervisor está ativo.
 */
function validarSupervisorAtivo_(
  supervisor
) {

  if (!supervisor) {

    throw new Error(
      'Supervisor não encontrado.'
    );

  }

  const status =
    normalizarParaComparacao(
      supervisor.STATUS
    );

  if (
    status !==
    normalizarParaComparacao(
      SLOG_CONFIG.STATUS.ATIVO
    )
  ) {

    throw new Error(
      'O acesso deste supervisor está inativo.'
    );

  }

}


/**
 * Valida se o colaborador vinculado está ativo.
 */
function validarColaboradorAtivo_(
  colaborador
) {

  if (!colaborador) {

    throw new Error(
      'Colaborador não encontrado.'
    );

  }

  const status =
    normalizarParaComparacao(
      colaborador.STATUS
    );

  if (
    status !==
    normalizarParaComparacao(
      SLOG_CONFIG.STATUS.ATIVO
    )
  ) {

    throw new Error(
      'O cadastro do colaborador está inativo.'
    );

  }

}


/**
 * Atualiza a data do último acesso do supervisor.
 */
function atualizarUltimoAcessoSupervisor_(
  idSupervisor
) {

  atualizarRegistroPorCampo(

    SLOG_ABAS.SUPERVISORES.nome,

    'ID_SUPERVISOR',

    idSupervisor,

    {

      ULTIMO_ACESSO:
        agora(),

      ATUALIZADO_EM:
        agora(),

      ATUALIZADO_POR:
        'SISTEMA_WEBAPP'

    }

  );

}


/* =========================================================
 * NORMALIZAÇÃO DO LOGIN
 * =========================================================
 */

/**
 * Normaliza o login digitado pelo usuário.
 *
 * Mantém letras, números, ponto, hífen e sublinhado.
 */
function normalizarLoginAutenticacao_(
  login
) {

  return removerAcentos(
    login
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9._-]/g,
      ''
    )
    .trim();

}
/* =========================================================
 * CONTROLE DE SESSÕES
 * =========================================================
 */

/**
 * Cria uma nova sessão autenticada.
 */
function criarSessaoAutenticacao_(usuario) {

  const token = gerarIdUnico();

  const agoraData = agora();

  const expiracao = new Date(
    agoraData.getTime() +
    AUTENTICACAO_CONFIG.DURACAO_SESSAO_SEGUNDOS * 1000
  );

  const sessao = {

    token: token,

    idUsuario:
      usuario.idUsuario,

    idColaborador:
      usuario.idColaborador,

    nome:
      usuario.nome,

    login:
      usuario.login,

    perfil:
      usuario.perfil,

    funcao:
      usuario.funcao,

    matricula:
      usuario.matricula,

    origem:
      usuario.origem,

    criadoEm:
      agoraData,

    expiraEm:
      expiracao,

    ultimoAcesso:
      agoraData

  };

  CacheService
    .getScriptCache()
    .put(

      AUTENTICACAO_CONFIG
        .PREFIXO_CACHE_SESSAO +
        token,

      converterObjetoParaJson(
        sessao
      ),

      AUTENTICACAO_CONFIG
        .DURACAO_SESSAO_SEGUNDOS

    );

  return sessao;

}


/**
 * Recupera uma sessão pelo token.
 */
function obterSessao(token) {

  if (!token) {
    return null;
  }

  const conteudo =
    CacheService
      .getScriptCache()
      .get(

        AUTENTICACAO_CONFIG
          .PREFIXO_CACHE_SESSAO +
          token

      );

  if (!conteudo) {
    return null;
  }

  const sessao =
    converterJsonParaObjeto(
      conteudo
    );

  if (!sessao) {
    return null;
  }

  sessao.criadoEm =
    new Date(sessao.criadoEm);

  sessao.expiraEm =
    new Date(sessao.expiraEm);

  sessao.ultimoAcesso =
    new Date(sessao.ultimoAcesso);

  return sessao;

}


/**
 * Verifica se a sessão continua válida.
 */
function validarSessao(token) {

  const sessao =
    obterSessao(token);

  if (!sessao) {

    throw new Error(
      'Sessão inválida.'
    );

  }

  if (
    sessao.expiraEm <= agora()
  ) {

    encerrarSessao(token);

    throw new Error(
      'Sessão expirada.'
    );

  }

  return sessao;

}


/**
 * Renova o tempo da sessão.
 */
function renovarSessao(token) {

  const sessao =
    validarSessao(token);

  sessao.ultimoAcesso =
    agora();

  sessao.expiraEm =
    new Date(

      agora().getTime() +

      AUTENTICACAO_CONFIG
        .DURACAO_SESSAO_SEGUNDOS *
        1000

    );

  CacheService
    .getScriptCache()
    .put(

      AUTENTICACAO_CONFIG
        .PREFIXO_CACHE_SESSAO +
        token,

      converterObjetoParaJson(
        sessao
      ),

      AUTENTICACAO_CONFIG
        .DURACAO_SESSAO_SEGUNDOS

    );

  return sessao;

}


/**
 * Finaliza uma sessão.
 */
function encerrarSessao(token) {

  if (!token) {
    return;
  }

  CacheService
    .getScriptCache()
    .remove(

      AUTENTICACAO_CONFIG
        .PREFIXO_CACHE_SESSAO +
        token

    );

}


/**
 * Remove todas as sessões.
 *
 * Utilizado apenas para manutenção.
 */
function limparTodasSessoes() {

  throw new Error(
    'O CacheService não permite remover todas as chaves. Utilize tokens individuais.'
  );

}


/* =========================================================
 * RESPOSTA PÚBLICA
 * =========================================================
 */

/**
 * Remove informações internas antes
 * de enviar a sessão ao Front-End.
 */
function construirRespostaSessaoPublica_(
  sessao
) {

  return {

    token:
      sessao.token,

    usuario: {

      id:
        sessao.idUsuario,

      colaborador:
        sessao.idColaborador,

      nome:
        sessao.nome,

      login:
        sessao.login,

      perfil:
        sessao.perfil,

      funcao:
        sessao.funcao,

      matricula:
        sessao.matricula

    },

    criadoEm:
      sessao.criadoEm,

    expiraEm:
      sessao.expiraEm

  };

}
/* =========================================================
 * CONTROLE DE TENTATIVAS
 * =========================================================
 */

/**
 * Verifica se o login encontra-se bloqueado.
 */
function verificarBloqueioTentativas_(login) {

  const cache =
    CacheService.getScriptCache();

  const chave =
    AUTENTICACAO_CONFIG.PREFIXO_CACHE_TENTATIVAS +
    login;

  const conteudo =
    cache.get(chave);

  if (!conteudo) {
    return;
  }

  const tentativa =
    converterJsonParaObjeto(conteudo);

  if (!tentativa) {
    return;
  }

  if (
    tentativa.quantidade >=
    AUTENTICACAO_CONFIG.LIMITE_TENTATIVAS
  ) {

    throw new Error(
      'Login temporariamente bloqueado. Tente novamente em alguns minutos.'
    );

  }

}


/**
 * Registra tentativa inválida.
 */
function registrarTentativaLoginFalha_(
  login,
  motivo
) {

  const cache =
    CacheService.getScriptCache();

  const chave =
    AUTENTICACAO_CONFIG.PREFIXO_CACHE_TENTATIVAS +
    login;

  let tentativa = {

    quantidade: 0,

    ultimoErro:
      agora(),

    motivo:
      motivo

  };

  const conteudo =
    cache.get(chave);

  if (conteudo) {

    tentativa =
      converterJsonParaObjeto(
        conteudo
      );

  }

  tentativa.quantidade++;

  tentativa.ultimoErro =
    agora();

  tentativa.motivo =
    motivo;

  cache.put(

    chave,

    converterObjetoParaJson(
      tentativa
    ),

    AUTENTICACAO_CONFIG
      .BLOQUEIO_TENTATIVAS_SEGUNDOS

  );

}


/**
 * Limpa tentativas após login bem sucedido.
 */
function limparTentativasLogin_(
  login
) {

  CacheService
    .getScriptCache()
    .remove(

      AUTENTICACAO_CONFIG
        .PREFIXO_CACHE_TENTATIVAS +
        login

    );

}


/* =========================================================
 * VALIDAÇÃO DE PERFIL
 * =========================================================
 */

/**
 * Verifica se o usuário possui
 * o perfil informado.
 */
function validarPerfilSessao(
  token,
  perfil
) {

  const sessao =
    validarSessao(
      token
    );

  if (
    normalizarParaComparacao(
      sessao.perfil
    ) !==
    normalizarParaComparacao(
      perfil
    )
  ) {

    throw new Error(
      'Usuário sem permissão para executar esta operação.'
    );

  }

  return sessao;

}


/**
 * Retorna a sessão autenticada.
 */
function obterUsuarioLogado(
  token
) {

  return validarSessao(
    token
  );

}


/**
 * Verifica se existe uma sessão válida.
 */
function usuarioEstaAutenticado(
  token
) {

  try {

    validarSessao(
      token
    );

    return true;

  } catch (erro) {

    return false;

  }

}


/* =========================================================
 * UTILITÁRIOS
 * =========================================================
 */

/**
 * Retorna apenas os últimos caracteres
 * do token para auditoria.
 */
function obterFinalTokenAutenticacao_(
  token
) {

  if (!token) {
    return '';
  }

  return token.slice(-8);

}


/**
 * Valida PIN numérico.
 */
function validarPin(
  pin
) {

  return /^[0-9]{4}$/.test(
    String(pin)
  );

}