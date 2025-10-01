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

export const mockPessoas: Pessoa[] = [
  {
    id: "1",
    nome_pessoa: "Ana Silva",
    email: "ana@exemplo.com",
    telefone: "(11) 99999-1111",
    apartamento: "101"
  },
  {
    id: "2",
    nome_pessoa: "Carlos Santos",
    email: "carlos@exemplo.com",
    telefone: "(11) 99999-2222",
    apartamento: "205"
  },
  {
    id: "3",
    nome_pessoa: "Maria Oliveira",
    email: "maria@exemplo.com",
    telefone: "(11) 99999-3333",
    apartamento: "312"
  },
  {
    id: "4",
    nome_pessoa: "João Costa",
    email: "joao@exemplo.com",
    telefone: "(11) 99999-4444",
    apartamento: "108"
  },
  {
    id: "5",
    nome_pessoa: "Fernanda Lima",
    email: "fernanda@exemplo.com",
    telefone: "(11) 99999-5555",
    apartamento: "420"
  }
];

export const mockItems: Item[] = [
  {
    id: "1",
    anunciante_id: "1",
    nome_item: "Furadeira Elétrica",
    foto_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
    preco_diario: 25.00,
    observacoes: "Furadeira em perfeito estado, ideal para pequenos reparos."
  },
  {
    id: "2",
    anunciante_id: "2",
    nome_item: "Escada de Alumínio",
    foto_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
    preco_diario: 15.00,
    observacoes: "Escada de 3 metros, leve e resistente."
  },
  {
    id: "3",
    anunciante_id: "3",
    nome_item: "Aspirador de Pó",
    foto_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
    preco_diario: 20.00,
    observacoes: "Aspirador potente, ótimo para limpeza geral."
  },
  {
    id: "4",
    anunciante_id: "4",
    nome_item: "Cadeira de Praia",
    foto_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
    preco_diario: 10.00,
    observacoes: "Cadeira dobrável, ideal para praia ou piscina."
  },
  {
    id: "5",
    anunciante_id: "5",
    nome_item: "Bicicleta",
    foto_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
    preco_diario: 30.00,
    observacoes: "Bicicleta urbana, ótima para passeios."
  }
];

export const mockLocacoes: Locacao[] = [
  {
    id: "1",
    item_id: "1",
    data_inicio: "2024-01-15",
    data_fim: "2024-01-17",
    status_pagamento: "pago",
    locatario_id: "2"
  },
  {
    id: "2",
    item_id: "2",
    data_inicio: "2024-01-20",
    data_fim: "2024-01-22",
    status_pagamento: "pendente",
    locatario_id: "3"
  },
  {
    id: "3",
    item_id: "3",
    data_inicio: "2024-01-25",
    data_fim: "2024-01-27",
    status_pagamento: "pago",
    locatario_id: "4"
  },
  {
    id: "4",
    item_id: "4",
    data_inicio: "2024-02-01",
    data_fim: "2024-02-03",
    status_pagamento: "pendente",
    locatario_id: "1"
  },
  {
    id: "5",
    item_id: "5",
    data_inicio: "2024-02-05",
    data_fim: "2024-02-07",
    status_pagamento: "pago",
    locatario_id: "3"
  }
];

export const mockAvaliacoes: Avaliacao[] = [
  {
    id: "1",
    avaliador_id: "2",
    item_id: "1",
    estrelas: 5,
    comentario: "Excelente furadeira, funcionou perfeitamente!"
  },
  {
    id: "2",
    avaliador_id: "3",
    item_id: "1",
    estrelas: 4,
    comentario: "Muito boa, recomendo."
  },
  {
    id: "3",
    avaliador_id: "4",
    item_id: "2",
    estrelas: 5,
    comentario: "Escada muito resistente e estável."
  },
  {
    id: "4",
    avaliador_id: "1",
    item_id: "3",
    estrelas: 4,
    comentario: "Aspirador funcionou bem, mas poderia ter mais potência."
  },
  {
    id: "5",
    avaliador_id: "3",
    item_id: "4",
    estrelas: 5,
    comentario: "Cadeira muito confortável, perfeita para praia."
  }
];
