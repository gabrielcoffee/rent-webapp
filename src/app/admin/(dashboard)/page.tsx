'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { DashboardService } from '@/services';
import { DashboardStats } from '@/services/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Package, Calendar, CircleDollarSign } from 'lucide-react';
import styles from './page.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className="text-center">
            <p>Carregando dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className="text-center">
            <p>{error || 'Erro ao carregar dashboard'}</p>
            <button onClick={loadStats} className="btn btn-primary">
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Dados para gráficos
  const statusData = [
    { name: 'Pago', value: stats.status_locacoes.pago, color: '#10b981' },
    { name: 'Pendente', value: stats.status_locacoes.pendente, color: '#f59e0b' }
  ];

  const receitaMensal = stats.receita_mensal;
  const possivelReceitaMensal = stats.possivel_receita_mensal;
  const avaliacoesMedias = stats.avaliacoes_medias;

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Dashboard Administrativo</h1>
          <p>Visão geral do sistema Rent</p>
        </div>

        {/* Cards de estatísticas */}
        <div className={`grid grid-4 ${styles.statsGrid}`}>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statHeader}>
              <Users className={styles.statIcon} />
              <h3>Total de Usuários</h3>
            </div>
            <p className={styles.statNumber}>{stats.total_pessoas}</p>
          </div>
          
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statHeader}>
              <Package className={styles.statIcon} />
              <h3>Itens Cadastrados</h3>
            </div>
            <p className={styles.statNumber}>{stats.total_itens}</p>
          </div>
          
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statHeader}>
              <Calendar className={styles.statIcon} />
              <h3>Locações Ativas</h3>
            </div>
            <p className={styles.statNumber}>{stats.locacoes_ativas}</p>
          </div>
          
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statHeader}>
              <CircleDollarSign className={styles.statIcon} />
              <h3>Dinheiro Circulado</h3>
            </div>
            <p className={styles.statNumber}>R$ {stats.dinheiro_circulado.toFixed(2)}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className={`grid grid-2 ${styles.chartsGrid}`}>
          <div className={`card ${styles.chartCard}`}>
            <h3>Status das Locações</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`card ${styles.chartCard}`}>
            <h3>Receita Mensal</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                  <Bar dataKey="receita" fill="var(--secondary-color)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={`grid grid-2 ${styles.chartsGrid}`}>
          <div className={`card ${styles.chartCard}`}>
            <h3>Possível Receita (10%)</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={possivelReceitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Possível Receita']} />
                  <Bar dataKey="possivelReceita" fill="var(--secondary-color)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`card ${styles.chartCard}`}>
            <h3>Avaliações dos Itens</h3>
            <div className={styles.tableContainer}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Avaliação Média</th>
                  </tr>
                </thead>
                <tbody>
                  {avaliacoesMedias.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nome}</td>
                      <td>
                        <span className={styles.rating}>
                          ⭐ {item.media}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
