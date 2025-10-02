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
            <h3>Dinheiro Circulado & Possível Receita (10%)</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `R$ ${value}`, 
                      name === 'receita' ? 'Dinheiro Circulado' : 'Possível Receita (10%)'
                    ]} 
                  />
                  <Bar dataKey="receita" fill="var(--secondary-color)" name="receita" />
                  <Bar dataKey="possivelReceita" fill="#22c55e" name="possivelReceita" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
