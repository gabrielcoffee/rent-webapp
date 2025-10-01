import { supabase } from '@/client/supabase';
import { DashboardStats } from './types';

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    try {
      // Buscar dados em paralelo
      const [
        pessoasResult,
        itensResult,
        locacoesResult,
        locacoesPagoResult,
        avaliacoesResult
      ] = await Promise.all([
        supabase.from('pessoa').select('id'),
        supabase.from('item').select('id'),
        supabase.from('locacao').select('*'),
        supabase.from('locacao').select(`
          item:item_id(preco_diario),
          data_inicio,
          data_fim
        `).eq('status_pagamento', 'pago'),
        supabase.from('avaliacao').select(`
          estrelas,
          item:item_id(nome_item)
        `)
      ]);

      // Processar erros
      if (pessoasResult.error) throw new Error('Erro ao buscar pessoas');
      if (itensResult.error) throw new Error('Erro ao buscar itens');
      if (locacoesResult.error) throw new Error('Erro ao buscar locações');
      if (locacoesPagoResult.error) throw new Error('Erro ao buscar locações pagas');
      if (avaliacoesResult.error) throw new Error('Erro ao buscar avaliações');

      // Calcular estatísticas básicas
      const totalPessoas = pessoasResult.data?.length || 0;
      const totalItens = itensResult.data?.length || 0;
      const locacoes = locacoesResult.data || [];
      const locacoesPago = locacoesPagoResult.data || [];
      const avaliacoes = avaliacoesResult.data || [];

      // Calcular dinheiro circulado
      const dinheiroCirculado = locacoesPago.reduce((total, locacao) => {
        const dias = this.calcularDias(locacao.data_inicio, locacao.data_fim);
        const valor = dias * (locacao.item?.preco_diario || 0);
        return total + valor;
      }, 0);

      // Calcular status das locações
      const statusLocacoes = locacoes.reduce((acc, locacao) => {
        if (locacao.status_pagamento === 'pago') {
          acc.pago++;
        } else {
          acc.pendente++;
        }
        return acc;
      }, { pago: 0, pendente: 0 });

      // Calcular receita mensal
      const receitaMensal = this.calcularReceitaMensal(locacoesPago);

      // Calcular possível receita (10%)
      const possivelReceitaMensal = receitaMensal.map(item => ({
        mes: item.mes,
        possivel_receita: item.receita * 0.1
      }));

      // Calcular médias de avaliações por item
      const avaliacoesMedias = this.calcularAvaliacoesMedias(avaliacoes);

      return {
        total_pessoas: totalPessoas,
        total_itens: totalItens,
        locacoes_ativas: locacoes.length,
        dinheiro_circulado: dinheiroCirculado,
        status_locacoes: statusLocacoes,
        receita_mensal: receitaMensal,
        possivel_receita_mensal: possivelReceitaMensal,
        avaliacoes_medias: avaliacoesMedias
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }

  private static calcularDias(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private static calcularReceitaMensal(locacoesPago: any[]): Array<{ mes: string; receita: number }> {
    const mesesMap = new Map<string, number>();

    locacoesPago.forEach(locacao => {
      const data = new Date(locacao.data_inicio);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const dias = this.calcularDias(locacao.data_inicio, locacao.data_fim);
      const valor = dias * (locacao.item?.preco_diario || 0);
      
      mesesMap.set(mes, (mesesMap.get(mes) || 0) + valor);
    });

    // Converter para array e ordenar
    return Array.from(mesesMap.entries())
      .map(([mes, receita]) => ({ mes, receita }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-12); // Últimos 12 meses
  }

  private static calcularAvaliacoesMedias(avaliacoes: any[]): Array<{ nome: string; media: string }> {
    const itensMap = new Map<string, { soma: number; total: number }>();

    avaliacoes.forEach(avaliacao => {
      const itemNome = avaliacao.item?.nome_item || 'N/A';
      const estrelas = avaliacao.estrelas;
      
      if (!itensMap.has(itemNome)) {
        itensMap.set(itemNome, { soma: 0, total: 0 });
      }
      
      const item = itensMap.get(itemNome)!;
      item.soma += estrelas;
      item.total += 1;
    });

    return Array.from(itensMap.entries())
      .map(([nome, dados]) => ({
        nome,
        media: dados.total > 0 ? (dados.soma / dados.total).toFixed(1) : '0.0'
      }))
      .sort((a, b) => parseFloat(b.media) - parseFloat(a.media))
      .slice(0, 5); // Top 5 itens
  }
}
