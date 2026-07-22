/**
 * =========================================================
 * SLOG OPS
 * Arquivo: 06_OrdensServico.gs
 * Etapa 1: cadastro e atualização de Ordens de Serviço.
 * =========================================================
 */


/**
 * Cadastra uma Ordem de Serviço.
 *
 * Exemplo de uso futuro pela interface:
 *
 * cadastrarOrdemServico({
 *   numeroOs: '0042/2026',
 *   idCliente: 'CLI-XXXXXXXXXX',
 *   idUnidade: 'UNI-XXXXXXXXXX',
 *   tipoServico: 'Limpeza de tanque',
 *   contrato: '',
 *   centroCusto: '',
 *   dataAbertura: '2026-07-21',
 *   observacoes: ''
 * });
 */
function cadastrarOrdemServico(dados) {
  try {
    dados = dados || {};

    const numeroOs = normalizarNumeroOs_(dados.numeroOs);
    const idCliente = normalizarTexto(dados.idCliente);
    const idUnidade = normalizarTexto(dados.idUnidade);
    const tipoServico = normalizarTexto(dados.tipoServico);
    const contrato = normalizarTexto(dados.contrato);
    const centroCusto = normalizarTexto(dados.centroCusto);
    const dataAbertura = converterDataOperacional_(
      dados.dataAbertura,
      'Data de abertura'
    );
    const observacoes = normalizarTexto(dados.observacoes);
    const usuario = obterUsuarioAtual();

    exigirCampo(numeroOs, 'Número da OS');
    exigirCampo(idCliente, 'Cliente');
    exigirCampo(idUnidade, 'Unidade');
    exigirCampo(tipoServico, 'Tipo de serviço');

    validarRelacionamentoClienteUnidade_(
      idCliente,
      idUnidade,
      true
    );

    if (
      registroExiste(
        SLOG_ABAS.ORDENS_SERVICO.nome,
        'NUMERO_OS',
        numeroOs
      )
    ) {
      throw new Error(
        'Já existe uma Ordem de Serviço com este número.'
      );
    }

    const registro = {
      ID_OS: gerarId(
        SLOG_CONFIG.PREFIXOS.ORDEM_SERVICO
      ),
      NUMERO_OS: numeroOs,
      ID_CLIENTE: idCliente,
      ID_UNIDADE: idUnidade,
      TIPO_SERVICO: tipoServico,
      CONTRATO: contrato,
      CENTRO_CUSTO: centroCusto,
      DATA_ABERTURA: dataAbertura,
      DATA_ENCERRAMENTO: '',
      OBSERVACOES: observacoes,
      STATUS: SLOG_CONFIG.STATUS.ABERTA,
      CRIADO_EM: agora(),
      CRIADO_POR: usuario,
      ATUALIZADO_EM: '',
      ATUALIZADO_POR: '',
      ENCERRADO_EM: '',
      ENCERRADO_POR: ''
    };

    inserirRegistro(
      SLOG_ABAS.ORDENS_SERVICO.nome,
      registro
    );

    registrarAuditoria(
      'CADASTRO',
      'ORDENS_SERVICO',
      registro.ID_OS,
      {
        numeroOs: numeroOs,
        idCliente: idCliente,
        idUnidade: idUnidade,
        tipoServico: tipoServico
      },
      usuario
    );

    return respostaSucesso(
      'Ordem de Serviço cadastrada com sucesso.',
      obterOrdemServicoCompleta(registro.ID_OS)
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Atualiza uma Ordem de Serviço aberta.
 */
function atualizarOrdemServico(idOs, dados) {
  try {
    dados = dados || {};

    exigirCampo(idOs, 'ID da OS');

    const osAtual = localizarRegistro(
      SLOG_ABAS.ORDENS_SERVICO.nome,
      'ID_OS',
      idOs
    );

    if (!osAtual) {
      throw new Error(
        'Ordem de Serviço não encontrada.'
      );
    }

    if (
      normalizarParaComparacao(osAtual.STATUS) !==
      SLOG_CONFIG.STATUS.ABERTA
    ) {
      throw new Error(
        'Somente Ordens de Serviço abertas podem ser alteradas.'
      );
    }

    const numeroOs = dados.numeroOs !== undefined
      ? normalizarNumeroOs_(dados.numeroOs)
      : osAtual.NUMERO_OS;

    const idCliente = dados.idCliente !== undefined
      ? normalizarTexto(dados.idCliente)
      : osAtual.ID_CLIENTE;

    const idUnidade = dados.idUnidade !== undefined
      ? normalizarTexto(dados.idUnidade)
      : osAtual.ID_UNIDADE;

    const tipoServico = dados.tipoServico !== undefined
      ? normalizarTexto(dados.tipoServico)
      : osAtual.TIPO_SERVICO;

    const contrato = dados.contrato !== undefined
      ? normalizarTexto(dados.contrato)
      : osAtual.CONTRATO;

    const centroCusto = dados.centroCusto !== undefined
      ? normalizarTexto(dados.centroCusto)
      : osAtual.CENTRO_CUSTO;

    const dataAbertura = dados.dataAbertura !== undefined
      ? converterDataOperacional_(
          dados.dataAbertura,
          'Data de abertura'
        )
      : osAtual.DATA_ABERTURA;

    const observacoes = dados.observacoes !== undefined
      ? normalizarTexto(dados.observacoes)
      : osAtual.OBSERVACOES;

    exigirCampo(numeroOs, 'Número da OS');
    exigirCampo(idCliente, 'Cliente');
    exigirCampo(idUnidade, 'Unidade');
    exigirCampo(tipoServico, 'Tipo de serviço');

    validarRelacionamentoClienteUnidade_(
      idCliente,
      idUnidade,
      true
    );

    validarDuplicidadeCampo_(
      SLOG_ABAS.ORDENS_SERVICO.nome,
      'NUMERO_OS',
      numeroOs,
      'ID_OS',
      idOs,
      'Já existe outra Ordem de Serviço com este número.'
    );

    const usuario = obterUsuarioAtual();

    const atualizacao = {
      NUMERO_OS: numeroOs,
      ID_CLIENTE: idCliente,
      ID_UNIDADE: idUnidade,
      TIPO_SERVICO: tipoServico,
      CONTRATO: contrato,
      CENTRO_CUSTO: centroCusto,
      DATA_ABERTURA: dataAbertura,
      OBSERVACOES: observacoes,
      ATUALIZADO_EM: agora(),
      ATUALIZADO_POR: usuario
    };

    atualizarRegistroPorCampo(
      SLOG_ABAS.ORDENS_SERVICO.nome,
      'ID_OS',
      idOs,
      atualizacao
    );

    registrarAuditoria(
      'ATUALIZACAO',
      'ORDENS_SERVICO',
      idOs,
      {
        dadosAnteriores: {
          numeroOs: osAtual.NUMERO_OS,
          idCliente: osAtual.ID_CLIENTE,
          idUnidade: osAtual.ID_UNIDADE,
          tipoServico: osAtual.TIPO_SERVICO,
          contrato: osAtual.CONTRATO,
          centroCusto: osAtual.CENTRO_CUSTO,
          dataAbertura: osAtual.DATA_ABERTURA,
          observacoes: osAtual.OBSERVACOES
        },
        novosDados: atualizacao
      },
      usuario
    );

    return respostaSucesso(
      'Ordem de Serviço atualizada com sucesso.',
      obterOrdemServicoCompleta(idOs)
    );
  } catch (erro) {
    return respostaErro(erro);
  }
}


/**
 * Retorna uma Ordem de Serviço com os nomes
 * do cliente e da unidade.
 */
function obterOrdemServicoCompleta(idOs) {
  exigirCampo(idOs, 'ID da OS');

  const ordemServico = localizarRegistro(
    SLOG_ABAS.ORDENS_SERVICO.nome,
    'ID_OS',
    idOs
  );

  if (!ordemServico) {
    return null;
  }

  const cliente = localizarRegistro(
    SLOG_ABAS.CLIENTES.nome,
    'ID_CLIENTE',
    ordemServico.ID_CLIENTE
  );

  const unidade = localizarRegistro(
    SLOG_ABAS.UNIDADES.nome,
    'ID_UNIDADE',
    ordemServico.ID_UNIDADE
  );

  return {
    ID_OS: ordemServico.ID_OS,
    NUMERO_OS: ordemServico.NUMERO_OS,
    ID_CLIENTE: ordemServico.ID_CLIENTE,
    CLIENTE: cliente ? cliente.CLIENTE : '',
    ID_UNIDADE: ordemServico.ID_UNIDADE,
    UNIDADE: unidade ? unidade.UNIDADE : '',
    TIPO_UNIDADE: unidade ? unidade.TIPO : '',
    TIPO_SERVICO: ordemServico.TIPO_SERVICO,
    CONTRATO: ordemServico.CONTRATO,
    CENTRO_CUSTO: ordemServico.CENTRO_CUSTO,
    DATA_ABERTURA: ordemServico.DATA_ABERTURA,
    DATA_ENCERRAMENTO:
      ordemServico.DATA_ENCERRAMENTO,
    OBSERVACOES: ordemServico.OBSERVACOES,
    STATUS: ordemServico.STATUS,
    CRIADO_EM: ordemServico.CRIADO_EM,
    CRIADO_POR: ordemServico.CRIADO_POR,
    ATUALIZADO_EM: ordemServico.ATUALIZADO_EM,
    ATUALIZADO_POR: ordemServico.ATUALIZADO_POR,
    ENCERRADO_EM: ordemServico.ENCERRADO_EM,
    ENCERRADO_POR: ordemServico.ENCERRADO_POR
  };
}


/**
 * Lista as Ordens de Serviço.
 *
 * Informe true para retornar somente OS abertas.
 */
function listarOrdensServico(apenasAbertas) {
  return listarRegistros(
    SLOG_ABAS.ORDENS_SERVICO.nome
  )
    .filter(function(ordemServico) {
      if (!apenasAbertas) {
        return true;
      }

      return (
        normalizarParaComparacao(
          ordemServico.STATUS
        ) === SLOG_CONFIG.STATUS.ABERTA
      );
    })
    .map(function(ordemServico) {
      return obterOrdemServicoCompleta(
        ordemServico.ID_OS
      );
    });
}


/**
 * Pesquisa uma OS pelo número.
 */
function obterOrdemServicoPorNumero(numeroOs) {
  const numeroNormalizado =
    normalizarNumeroOs_(numeroOs);

  exigirCampo(numeroNormalizado, 'Número da OS');

  const ordemServico = localizarRegistro(
    SLOG_ABAS.ORDENS_SERVICO.nome,
    'NUMERO_OS',
    numeroNormalizado
  );

  if (!ordemServico) {
    return null;
  }

  return obterOrdemServicoCompleta(
    ordemServico.ID_OS
  );
}


/* =========================================================
 * FUNÇÕES INTERNAS
 * =========================================================
 */

/**
 * Normaliza o número da OS.
 *
 * Exemplos:
 * 42/2026       -> 0042/2026
 * 0042/2026     -> 0042/2026
 * 0042-03/2026  -> rejeitado, pois é número de RDO
 */
function normalizarNumeroOs_(numeroOs) {
  const valor = normalizarParaComparacao(numeroOs)
    .replace(/\s/g, '');

  if (!valor) {
    return '';
  }

  if (/^\d{4}-\d{2}\/\d{4}$/.test(valor)) {
    throw new Error(
      'Foi informado um número de RDO no campo da OS.'
    );
  }

  const correspondencia = valor.match(
    /^(\d{1,6})\/(\d{4})$/
  );

  if (!correspondencia) {
    throw new Error(
      'Utilize o formato 0042/2026 para o número da OS.'
    );
  }

  const numero = correspondencia[1]
    .padStart(4, '0');

  const ano = correspondencia[2];

  return numero + '/' + ano;
}


/**
 * Valida o cliente e a unidade informados.
 */
function validarRelacionamentoClienteUnidade_(
  idCliente,
  idUnidade,
  exigirAtivos
) {
  const cliente = localizarRegistro(
    SLOG_ABAS.CLIENTES.nome,
    'ID_CLIENTE',
    idCliente
  );

  if (!cliente) {
    throw new Error('Cliente não encontrado.');
  }

  const unidade = localizarRegistro(
    SLOG_ABAS.UNIDADES.nome,
    'ID_UNIDADE',
    idUnidade
  );

  if (!unidade) {
    throw new Error('Unidade não encontrada.');
  }

  if (
    normalizarParaComparacao(
      unidade.ID_CLIENTE
    ) !== normalizarParaComparacao(idCliente)
  ) {
    throw new Error(
      'A unidade selecionada não pertence ao cliente informado.'
    );
  }

  if (exigirAtivos) {
    if (
      normalizarParaComparacao(cliente.STATUS) !==
      SLOG_CONFIG.STATUS.ATIVO
    ) {
      throw new Error(
        'O cliente selecionado está inativo.'
      );
    }

    if (
      normalizarParaComparacao(unidade.STATUS) !==
      SLOG_CONFIG.STATUS.ATIVO
    ) {
      throw new Error(
        'A unidade selecionada está inativa.'
      );
    }
  }

  return {
    cliente: cliente,
    unidade: unidade
  };
}


/**
 * Converte a data operacional.
 *
 * Aceita:
 * - objeto Date;
 * - texto no formato yyyy-MM-dd;
 * - texto no formato dd/MM/yyyy.
 */
function converterDataOperacional_(
  valor,
  nomeCampo
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return '';
  }

  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) {
      throw new Error(
        'A ' + nomeCampo + ' é inválida.'
      );
    }

    return new Date(
      valor.getFullYear(),
      valor.getMonth(),
      valor.getDate()
    );
  }

  const texto = normalizarTexto(valor);
  let correspondencia;
  let ano;
  let mes;
  let dia;

  correspondencia = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (correspondencia) {
    ano = Number(correspondencia[1]);
    mes = Number(correspondencia[2]);
    dia = Number(correspondencia[3]);
  } else {
    correspondencia = texto.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (!correspondencia) {
      throw new Error(
        'A ' +
        nomeCampo +
        ' deve estar no formato dd/MM/yyyy.'
      );
    }

    dia = Number(correspondencia[1]);
    mes = Number(correspondencia[2]);
    ano = Number(correspondencia[3]);
  }

  const data = new Date(ano, mes - 1, dia);

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    throw new Error(
      'A ' + nomeCampo + ' é inválida.'
    );
  }

  return data;
}


/* =========================================================
 * TESTE
 * =========================================================
 */

/**
 * Testa apenas a estrutura do módulo.
 * Não cria nenhuma OS.
 */
function testarModuloOrdensServico() {
  const cabecalhosCorretos = validarCabecalhosAba(
    SLOG_ABAS.ORDENS_SERVICO.nome,
    SLOG_ABAS.ORDENS_SERVICO.cabecalhos
  );

  const resultado = {
    sucesso: cabecalhosCorretos,
    modulo: 'ORDENS_SERVICO',
    abaExiste: abaExiste(
      SLOG_ABAS.ORDENS_SERVICO.nome
    ),
    cabecalhosCorretos: cabecalhosCorretos,
    quantidadeOrdens: contarRegistros(
      SLOG_ABAS.ORDENS_SERVICO.nome
    ),
    carregadoEm: formatarDataHora(agora())
  };

  console.log(JSON.stringify(resultado, null, 2));

  if (!resultado.sucesso) {
    throw new Error(
      'O módulo de Ordens de Serviço possui inconsistências.'
    );
  }

  exibirNotificacao(
    'Módulo de OS carregado corretamente.',
    'SLOG OPS',
    5
  );

  return resultado;
}
