/**
 * =========================================================
 * SLOG OPS
 * Arquivo: Utilitarios.gs
 * Responsabilidade: funções auxiliares reutilizáveis.
 * =========================================================
 */


/**
 * Retorna a data e hora atual.
 */
function agora() {
  return new Date();
}


/**
 * Retorna o e-mail do usuário atual.
 */
function obterUsuarioAtual() {
  const emailAtivo = Session.getActiveUser().getEmail();

  if (emailAtivo) {
    return String(emailAtivo).trim().toLowerCase();
  }

  const emailEfetivo = Session.getEffectiveUser().getEmail();

  if (emailEfetivo) {
    return String(emailEfetivo).trim().toLowerCase();
  }

  return 'USUARIO_NAO_IDENTIFICADO';
}


/**
 * Remove espaços extras e converte valores em texto.
 */
function normalizarTexto(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor)
    .trim()
    .replace(/\s+/g, ' ');
}


/**
 * Normaliza um texto para comparação.
 */
function normalizarParaComparacao(valor) {
  return normalizarTexto(valor).toUpperCase();
}


/**
 * Normaliza um e-mail.
 */
function normalizarEmail(email) {
  return normalizarTexto(email).toLowerCase();
}


/**
 * Verifica se um valor está vazio.
 */
function estaVazio(valor) {
  return normalizarTexto(valor) === '';
}


/**
 * Gera um identificador único.
 *
 * Exemplo:
 * ADM-A1B2C3D4E5
 */
function gerarId(prefixo) {
  const prefixoNormalizado = normalizarParaComparacao(prefixo);

  if (!prefixoNormalizado) {
    throw new Error('O prefixo do identificador não foi informado.');
  }

  const codigo = Utilities
    .getUuid()
    .replace(/-/g, '')
    .substring(0, 10)
    .toUpperCase();

  return prefixoNormalizado + '-' + codigo;
}


/**
 * Gera um identificador sequencial com base no maior ID
 * existente em uma aba.
 *
 * Exemplos:
 * gerarIdSequencial('FUN', 'FUNCOES_OPERACIONAIS', 'ID_FUNCAO')
 * retorna FUN0001, FUN0002, FUN0003...
 *
 * gerarIdSequencial('SER', 'TIPOS_SERVICO', 'ID_TIPO_SERVICO', 5)
 * retorna SER00001, SER00002, SER00003...
 */
function gerarIdSequencial(
  prefixo,
  nomeAba,
  nomeCampoId,
  quantidadeDigitos
) {
  const prefixoNormalizado = normalizarParaComparacao(prefixo);
  const abaNormalizada = normalizarTexto(nomeAba);
  const campoNormalizado = normalizarParaComparacao(nomeCampoId);
  const digitos = quantidadeDigitos === undefined
    ? 4
    : Number(quantidadeDigitos);

  exigirCampo(prefixoNormalizado, 'Prefixo do identificador');
  exigirCampo(abaNormalizada, 'Nome da aba');
  exigirCampo(campoNormalizado, 'Campo identificador');

  if (
    !Number.isInteger(digitos) ||
    digitos < 1 ||
    digitos > 12
  ) {
    throw new Error(
      'A quantidade de dígitos do identificador deve ser ' +
      'um número inteiro entre 1 e 12.'
    );
  }

  const registros = listarRegistros(abaNormalizada);
  const prefixoRegex = escaparExpressaoRegular_(prefixoNormalizado);
  const padrao = new RegExp(
    '^' + prefixoRegex + '(\\d+)$',
    'i'
  );

  let maiorNumero = 0;

  registros.forEach(function(registro) {
    const idAtual = normalizarTexto(
      registro[campoNormalizado]
    );

    const correspondencia = idAtual.match(padrao);

    if (!correspondencia) {
      return;
    }

    const numeroAtual = Number(correspondencia[1]);

    if (
      Number.isInteger(numeroAtual) &&
      numeroAtual > maiorNumero
    ) {
      maiorNumero = numeroAtual;
    }
  });

  const proximoNumero = maiorNumero + 1;
  const numeroFormatado = String(proximoNumero)
    .padStart(digitos, '0');

  return prefixoNormalizado + numeroFormatado;
}


/**
 * Escapa caracteres especiais para uso em expressão regular.
 */
function escaparExpressaoRegular_(valor) {
  return normalizarTexto(valor).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}


/**
 * Formata uma data.
 */
function formatarData(data) {
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    return '';
  }

  return Utilities.formatDate(
    data,
    SLOG_CONFIG.FUSO_HORARIO,
    'dd/MM/yyyy'
  );
}


/**
 * Formata uma data com horário.
 */
function formatarDataHora(data) {
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    return '';
  }

  return Utilities.formatDate(
    data,
    SLOG_CONFIG.FUSO_HORARIO,
    'dd/MM/yyyy HH:mm:ss'
  );
}


/**
 * Formata um horário.
 */
function formatarHorario(data) {
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    return '';
  }

  return Utilities.formatDate(
    data,
    SLOG_CONFIG.FUSO_HORARIO,
    'HH:mm'
  );
}


/**
 * Converte dados para JSON com tratamento de datas.
 */
function converterParaJsonSeguro(dados) {
  try {
    return JSON.stringify(dados, function(chave, valor) {
      if (valor instanceof Date) {
        return Utilities.formatDate(
          valor,
          SLOG_CONFIG.FUSO_HORARIO,
          "yyyy-MM-dd'T'HH:mm:ss"
        );
      }

      return valor;
    });
  } catch (erro) {
    return JSON.stringify({
      erro: true,
      mensagem: erro.message
    });
  }
}


/**
 * Converte um JSON em objeto.
 */
function converterJsonSeguro(json, valorPadrao) {
  if (estaVazio(json)) {
    return valorPadrao === undefined ? null : valorPadrao;
  }

  try {
    return JSON.parse(json);
  } catch (erro) {
    return valorPadrao === undefined ? null : valorPadrao;
  }
}


/**
 * Gera hash SHA-256.
 */
function gerarHash(texto) {
  if (texto === null || texto === undefined) {
    throw new Error('Não é possível gerar hash de um valor vazio.');
  }

  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(texto),
    Utilities.Charset.UTF_8
  );

  return bytes
    .map(function(byte) {
      const valor = byte < 0 ? byte + 256 : byte;
      return ('0' + valor.toString(16)).slice(-2);
    })
    .join('');
}


/**
 * Valida se o PIN possui exatamente quatro números.
 */
function validarPin(pin) {
  return /^\d{4}$/.test(String(pin || ''));
}


/**
 * Mantém apenas números.
 */
function somenteNumeros(valor) {
  return String(valor || '').replace(/\D/g, '');
}


/**
 * Valida CPF apenas pela quantidade de números.
 *
 * A validação completa será implementada no módulo de cadastros.
 */
function validarFormatoCpf(cpf) {
  const numeros = somenteNumeros(cpf);

  return numeros === '' || numeros.length === 11;
}


/**
 * Valida um e-mail básico.
 */
function validarEmail(email) {
  if (estaVazio(email)) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarEmail(email));
}


/**
 * Converte um valor para número.
 */
function converterNumero(valor, valorPadrao) {
  if (valor === null || valor === undefined || valor === '') {
    return valorPadrao === undefined ? 0 : valorPadrao;
  }

  const numero = Number(
    String(valor)
      .replace(/\./g, '')
      .replace(',', '.')
  );

  if (!Number.isFinite(numero)) {
    return valorPadrao === undefined ? 0 : valorPadrao;
  }

  return numero;
}


/**
 * Verifica se uma quantidade é positiva.
 */
function validarQuantidade(valor) {
  return converterNumero(valor, 0) > 0;
}


/**
 * Converte diferentes valores em booleano.
 */
function converterBooleano(valor) {
  if (typeof valor === 'boolean') {
    return valor;
  }

  const texto = normalizarParaComparacao(valor);

  return [
    'TRUE',
    'VERDADEIRO',
    'SIM',
    'S',
    '1'
  ].indexOf(texto) !== -1;
}


/**
 * Retorna SIM ou NÃO.
 */
function formatarBooleano(valor) {
  return converterBooleano(valor) ? 'SIM' : 'NÃO';
}


/**
 * Remove acentos de um texto.
 */
function removerAcentos(valor) {
  return normalizarTexto(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}


/**
 * Cria uma versão simples de texto para login.
 */
function criarTextoLogin(valor) {
  return removerAcentos(valor)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
}


/**
 * Cria login com primeiro e último nome.
 *
 * Exemplo:
 * Saymon da Silva Serra -> saymon.serra
 */
function criarLoginPorNome(nomeCompleto) {
  const nomeNormalizado = removerAcentos(nomeCompleto)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  const partes = nomeNormalizado
    .split(/\s+/)
    .filter(function(parte) {
      return parte !== '';
    });

  if (partes.length === 0) {
    return '';
  }

  if (partes.length === 1) {
    return partes[0];
  }

  return partes[0] + '.' + partes[partes.length - 1];
}


/**
 * Gera um token aleatório.
 */
function gerarToken() {
  return Utilities
    .getUuid()
    .replace(/-/g, '') +
    Utilities
      .getUuid()
      .replace(/-/g, '');
}


/**
 * Cria uma cópia simples de um objeto.
 */
function copiarObjeto(objeto) {
  if (!objeto || typeof objeto !== 'object') {
    return objeto;
  }

  return JSON.parse(JSON.stringify(objeto));
}


/**
 * Retorna somente as propriedades permitidas.
 */
function selecionarCampos(objeto, camposPermitidos) {
  const resultado = {};

  if (!objeto || !Array.isArray(camposPermitidos)) {
    return resultado;
  }

  camposPermitidos.forEach(function(campo) {
    if (
      Object.prototype.hasOwnProperty.call(objeto, campo)
    ) {
      resultado[campo] = objeto[campo];
    }
  });

  return resultado;
}


/**
 * Remove valores vazios de um objeto.
 */
function removerCamposVazios(objeto) {
  const resultado = {};

  if (!objeto || typeof objeto !== 'object') {
    return resultado;
  }

  Object.keys(objeto).forEach(function(chave) {
    const valor = objeto[chave];

    if (
      valor !== null &&
      valor !== undefined &&
      normalizarTexto(valor) !== ''
    ) {
      resultado[chave] = valor;
    }
  });

  return resultado;
}


/**
 * Garante que um campo obrigatório foi informado.
 */
function exigirCampo(valor, nomeCampo) {
  if (estaVazio(valor)) {
    throw new Error(
      'O campo "' + nomeCampo + '" é obrigatório.'
    );
  }

  return valor;
}


/**
 * Garante que uma condição seja verdadeira.
 */
function exigirCondicao(condicao, mensagem) {
  if (!condicao) {
    throw new Error(mensagem || 'A operação não pôde ser concluída.');
  }
}


/**
 * Retorna uma resposta padrão de sucesso.
 */
function respostaSucesso(mensagem, dados) {
  return {
    sucesso: true,
    mensagem: mensagem || 'Operação concluída com sucesso.',
    dados: dados === undefined ? null : dados
  };
}


/**
 * Retorna uma resposta padrão de erro.
 */
function respostaErro(erro) {
  const mensagem = erro instanceof Error
    ? erro.message
    : normalizarTexto(erro);

  return {
    sucesso: false,
    mensagem: mensagem || 'Ocorreu um erro inesperado.',
    dados: null
  };
}


/**
 * Executa uma função com bloqueio.
 */
function executarComBloqueio(funcao) {
  const bloqueio = LockService.getScriptLock();

  bloqueio.waitLock(30000);

  try {
    return funcao();
  } finally {
    bloqueio.releaseLock();
  }
}


/**
 * Exibe uma notificação na planilha.
 */
function exibirNotificacao(mensagem, titulo, segundos) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  if (!planilha) {
    return;
  }

  planilha.toast(
    normalizarTexto(mensagem),
    titulo || SLOG_CONFIG.NOME_SISTEMA,
    segundos || 5
  );
}


/**
 * Retorna informações básicas para teste.
 */
function obterInformacoesSistema() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  return {
    sistema: SLOG_CONFIG.NOME_SISTEMA,
    versao: SLOG_CONFIG.VERSAO,
    fusoHorario: SLOG_CONFIG.FUSO_HORARIO,
    usuario: obterUsuarioAtual(),
    dataHora: formatarDataHora(agora()),
    planilhaId: planilha ? planilha.getId() : '',
    planilhaNome: planilha ? planilha.getName() : ''
  };
}


/**
 * Teste isolado deste arquivo.
 */
function testarUtilitarios() {
  const teste = {
    id: gerarId('TST'),
    idSequencialFuncao: gerarIdSequencial(
      'FUN',
      SLOG_ABAS.FUNCOES_OPERACIONAIS.nome,
      'ID_FUNCAO'
    ),
    usuario: obterUsuarioAtual(),
    dataHora: formatarDataHora(agora()),
    login: criarLoginPorNome('Saymon da Silva Serra'),
    pinValido: validarPin('1234'),
    hashGerado: gerarHash('1234').length === 64
  };

  console.log(JSON.stringify(teste, null, 2));

  exibirNotificacao(
    'Utilitários carregados corretamente.',
    'Teste SLOG OPS',
    5
  );

  return teste;
}