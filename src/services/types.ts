export interface Pessoa {
  id: string;
  nome_pessoa: string;
  email?: string;
  telefone: string;
  apartamento: string;
}

export interface Item {
  id: string;
  anunciante_id: string;
  nome_item: string;
  foto_url?: string;
  preco_diario: number;
  observacoes?: string;
}

export interface Locacao {
  id: string;
  item_id: string;
  data_inicio: string;
  data_fim: string;
  status_pagamento: string;
  locatario_id: string;
}

export interface Avaliacao {
  id: string;
  avaliador_id: string;
  item_id: string;
  estrelas: number;
  comentario?: string;
}

// Tipos para dados processados
export interface LocacaoComCalculos extends Locacao {
  dias: number;
  valor_total: number;
  item_nome?: string;
  locatario_nome?: string;
}

export interface ItemComAvaliacoes extends Item {
  avaliacao_media: number;
  total_avaliacoes: number;
  anunciante_nome?: string;
}

export interface DashboardStats {
  total_pessoas: number;
  total_itens: number;
  locacoes_ativas: number;
  dinheiro_circulado: number;
  status_locacoes: {
    pago: number;
    pendente: number;
  };
  receita_mensal: Array<{
    mes: string;
    receita: number;
  }>;
  possivel_receita_mensal: Array<{
    mes: string;
    possivel_receita: number;
  }>;
  avaliacoes_medias: Array<{
    nome: string;
    media: string;
  }>;
}
