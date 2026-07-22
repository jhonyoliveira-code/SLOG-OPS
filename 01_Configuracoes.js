/**
 * =========================================================
 * SLOG OPS
 * Arquivo: Configuracoes.gs
 * Responsabilidade: configurações e estrutura do banco.
 * =========================================================
 */

const SLOG_CONFIG = Object.freeze({
  NOME_SISTEMA: 'SLOG OPS',
  VERSAO: '1.2.0',
  FUSO_HORARIO: 'America/Sao_Paulo',
  LOCALIDADE_PLANILHA: 'pt_BR',

  PERFIS: Object.freeze({
    ADMIN_MESTRE: 'ADMIN_MESTRE',
    ADMINISTRADOR: 'ADMINISTRADOR',
    SUPERVISOR: 'SUPERVISOR'
  }),

  STATUS: Object.freeze({
    ATIVO: 'ATIVO',
    INATIVO: 'INATIVO',
    ABERTA: 'ABERTA',
    ENCERRADA: 'ENCERRADA',
    EM_PREENCHIMENTO: 'EM_PREENCHIMENTO',
    FINALIZADO: 'FINALIZADO',
    CANCELADO: 'CANCELADO'
  }),

  CONDICAO_DIA: Object.freeze({
    HOUVE_OPERACAO: 'HOUVE_OPERACAO',
    NAO_HOUVE_OPERACAO: 'NAO_HOUVE_OPERACAO'
  }),

  TIPOS_ATIVIDADE: Object.freeze({
    ATIVIDADE: 'ATIVIDADE',
    INTERVALO: 'INTERVALO',
    ENCERRAMENTO: 'ENCERRAMENTO'
  }),

  PREFIXOS: Object.freeze({
    ADMINISTRADOR: 'ADM',
    COLABORADOR: 'COL',
    SUPERVISOR: 'SUP',
    CLIENTE: 'CLI',
    UNIDADE: 'UNI',
    EQUIPAMENTO: 'EQP',
    ORDEM_SERVICO: 'OS',
    OS_SUPERVISOR: 'OSS',
    OS_EQUIPE: 'OSE',
    OS_EQUIPAMENTO: 'OSQ',
    RDO: 'RDO',
    RDO_EQUIPE: 'RDE',
    RDO_ATIVIDADE: 'RDA',
    RDO_ATIVIDADE_EXTRA: 'RDX',
    RDO_VERSAO: 'RDV',
    AUDITORIA: 'AUD'
  })
});


/**
 * Estrutura oficial das abas do banco.
 *
 * Não alterar os nomes dos cabeçalhos manualmente.
 */
const SLOG_ABAS = Object.freeze({

  CONFIGURACOES: Object.freeze({
    nome: 'CONFIGURACOES',
    cabecalhos: Object.freeze([
      'CHAVE',
      'VALOR',
      'DESCRICAO',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  ADMINISTRADORES: Object.freeze({
    nome: 'ADMINISTRADORES',
    cabecalhos: Object.freeze([
      'ID_ADM',
      'NOME',
      'CPF',
      'EMAIL',
      'PERFIL',
      'STATUS',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  COLABORADORES: Object.freeze({
    nome: 'COLABORADORES',
    cabecalhos: Object.freeze([
      'ID_COLABORADOR',
      'MATRICULA',
      'NOME',
      'CPF',
      'FUNCAO',
      'STATUS',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  SUPERVISORES: Object.freeze({
    nome: 'SUPERVISORES',
    cabecalhos: Object.freeze([
      'ID_SUPERVISOR',
      'ID_COLABORADOR',
      'LOGIN',
      'PIN_HASH',
      'STATUS',
      'ULTIMO_ACESSO',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  CLIENTES: Object.freeze({
    nome: 'CLIENTES',
    cabecalhos: Object.freeze([
      'ID_CLIENTE',
      'CLIENTE',
      'STATUS',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  UNIDADES: Object.freeze({
    nome: 'UNIDADES',
    cabecalhos: Object.freeze([
      'ID_UNIDADE',
      'ID_CLIENTE',
      'UNIDADE',
      'TIPO',
      'STATUS',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  EQUIPAMENTOS: Object.freeze({
    nome: 'EQUIPAMENTOS',
    cabecalhos: Object.freeze([
      'ID_EQUIPAMENTO',
      'EQUIPAMENTO',
      'UNIDADE_MEDIDA',
      'STATUS',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),
FUNCOES_OPERACIONAIS: Object.freeze({
  nome: 'FUNCOES_OPERACIONAIS',
  cabecalhos: Object.freeze([
    'ID_FUNCAO',
    'FUNCAO',
    'ORDEM',
    'ATIVO',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR'
  ])
}),

TIPOS_SERVICO: Object.freeze({
  nome: 'TIPOS_SERVICO',
  cabecalhos: Object.freeze([
    'ID_TIPO_SERVICO',
    'TIPO_SERVICO',
    'ATIVO',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR'
  ])
}),

TIPOS_UNIDADE: Object.freeze({
  nome: 'TIPOS_UNIDADE',
  cabecalhos: Object.freeze([
    'ID_TIPO_UNIDADE',
    'TIPO_UNIDADE',
    'ATIVO',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR'
  ])
}),

MOTIVOS_STANDBY: Object.freeze({
  nome: 'MOTIVOS_STANDBY',
  cabecalhos: Object.freeze([
    'ID_MOTIVO_STANDBY',
    'MOTIVO',
    'ATIVO',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR'
  ])
}),

ATIVIDADES_PADRAO: Object.freeze({
  nome: 'ATIVIDADES_PADRAO',
  cabecalhos: Object.freeze([
    'ID_ATIVIDADE',
    'ATIVIDADE',
    'ORDEM',
    'ATIVO',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR'
  ])
}),

TIPOS_EQUIPAMENTO: Object.freeze({
  nome: 'TIPOS_EQUIPAMENTO',
  cabecalhos: Object.freeze([
    'ID_TIPO_EQUIPAMENTO',
    'TIPO_EQUIPAMENTO',
    'ATIVO',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR'
  ])
}),
  ORDENS_SERVICO: Object.freeze({
  nome: 'ORDENS_SERVICO',
  cabecalhos: Object.freeze([
    'ID_OS',
    'NUMERO_OS',
    'ID_CLIENTE',
    'ID_UNIDADE',
    'TIPO_SERVICO',
    'CONTRATO',
    'CENTRO_CUSTO',
    'DATA_ABERTURA',
    'DATA_ENCERRAMENTO',
    'OBSERVACOES',
    'STATUS',
    'CRIADO_EM',
    'CRIADO_POR',
    'ATUALIZADO_EM',
    'ATUALIZADO_POR',
    'ENCERRADO_EM',
    'ENCERRADO_POR'
  ])
}),

  OS_SUPERVISORES: Object.freeze({
    nome: 'OS_SUPERVISORES',
    cabecalhos: Object.freeze([
      'ID_OS_SUPERVISOR',
      'ID_OS',
      'ID_SUPERVISOR',
      'PRINCIPAL',
      'STATUS',
      'VINCULADO_EM',
      'VINCULADO_POR',
      'DESVINCULADO_EM',
      'DESVINCULADO_POR'
    ])
  }),

  OS_EQUIPE: Object.freeze({
  nome: 'OS_EQUIPE',
  cabecalhos: Object.freeze([
    'ID_OS_EQUIPE',
    'ID_OS',
    'ID_COLABORADOR',
    'ORDEM_EQUIPE',
    'ID_FUNCAO',
    'STATUS',
    'VINCULADO_EM',
    'VINCULADO_POR',
    'DESVINCULADO_EM',
    'DESVINCULADO_POR'
  ])
}),

  OS_EQUIPAMENTOS: Object.freeze({
    nome: 'OS_EQUIPAMENTOS',
    cabecalhos: Object.freeze([
      'ID_OS_EQUIPAMENTO',
      'ID_OS',
      'ID_EQUIPAMENTO',
      'QUANTIDADE',
      'OBSERVACAO',
      'STATUS',
      'VINCULADO_EM',
      'VINCULADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR'
    ])
  }),

  RDOS: Object.freeze({
    nome: 'RDOS',
    cabecalhos: Object.freeze([
      'ID_RDO',
      'ID_OS',
      'NUMERO_RDO',
      'SEQUENCIA',
      'ANO',
      'DATA_RDO',
      'ID_SUPERVISOR_RESPONSAVEL',
      'CONDICAO_DIA',
      'MOTIVO_NAO_OPERACAO',
      'PROGRESSO_DIARIO',
      'OBSERVACOES_GERAIS',
      'HOUVE_ATIVIDADE_EXTRA',
      'STATUS',
      'VERSAO_ATUAL',
      'CRIADO_EM',
      'CRIADO_POR',
      'ATUALIZADO_EM',
      'ATUALIZADO_POR',
      'FINALIZADO_EM',
      'FINALIZADO_POR',
      'CANCELADO_EM',
      'CANCELADO_POR',
      'MOTIVO_CANCELAMENTO'
    ])
  }),

  RDO_EQUIPE: Object.freeze({
    nome: 'RDO_EQUIPE',
    cabecalhos: Object.freeze([
      'ID_RDO_EQUIPE',
      'ID_RDO',
      'ID_COLABORADOR',
      'MATRICULA',
      'NOME',
      'CPF',
      'FUNCAO',
      'VERSAO_RDO',
      'CRIADO_EM',
      'CRIADO_POR'
    ])
  }),

  RDO_ATIVIDADES: Object.freeze({
    nome: 'RDO_ATIVIDADES',
    cabecalhos: Object.freeze([
      'ID_RDO_ATIVIDADE',
      'ID_RDO',
      'ORDEM',
      'HORARIO_INICIO',
      'TIPO',
      'DESCRICAO',
      'VERSAO_RDO',
      'CRIADO_EM',
      'CRIADO_POR'
    ])
  }),

  RDO_ATIVIDADES_EXTRAS: Object.freeze({
    nome: 'RDO_ATIVIDADES_EXTRAS',
    cabecalhos: Object.freeze([
      'ID_RDO_ATIVIDADE_EXTRA',
      'ID_RDO',
      'DURACAO',
      'DESCRICAO',
      'VERSAO_RDO',
      'CRIADO_EM',
      'CRIADO_POR'
    ])
  }),

  RDO_VERSOES: Object.freeze({
    nome: 'RDO_VERSOES',
    cabecalhos: Object.freeze([
      'ID_RDO_VERSAO',
      'ID_RDO',
      'VERSAO',
      'DADOS_JSON',
      'PDF_ID_DRIVE',
      'PDF_URL',
      'STATUS',
      'CRIADO_EM',
      'CRIADO_POR'
    ])
  }),

  AUDITORIA: Object.freeze({
    nome: 'AUDITORIA',
    cabecalhos: Object.freeze([
      'ID_AUDITORIA',
      'DATA_HORA',
      'USUARIO',
      'ACAO',
      'MODULO',
      'ID_REGISTRO',
      'DETALHES_JSON'
    ])
  })

});


/**
 * Retorna todas as estruturas de abas em formato de lista.
 */
function obterEstruturasAbas() {
  return Object.keys(SLOG_ABAS).map(function(chave) {
    return SLOG_ABAS[chave];
  });
}
