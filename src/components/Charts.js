import React, { useContext } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { ExpenseContext } from '../context/ExpenseContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'];

const Charts = () => {
  const { state } = useContext(ExpenseContext);
  const realExpenses = state.expenses.filter(e => !e.isSettlement);

  // Category totals (pie)
  const categoryTotals = state.categories.reduce((acc, cat) => {
    const total = realExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    if (total > 0) acc[cat] = total;
    return acc;
  }, {});

  // Monthly trend (bar) - last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
  });
  const monthlyTotals = months.map(m =>
    realExpenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      })
      .reduce((s, e) => s + e.amount, 0)
  );

  // Per-person total (bar)
  const memberTotals = state.group.members.map(m =>
    realExpenses.filter(e => e.paidBy === m).reduce((s, e) => s + e.amount, 0)
  );

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: COLORS.slice(0, Object.keys(categoryTotals).length),
      borderWidth: 2,
      borderColor: 'var(--bg-surface)',
      hoverOffset: 6
    }]
  };

  const barData = {
    labels: months.map(m => m.label),
    datasets: [{
      label: 'Total ($)',
      data: monthlyTotals,
      backgroundColor: COLORS[0] + 'cc',
      borderColor: COLORS[0],
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  const memberBarData = {
    labels: state.group.members,
    datasets: [{
      label: 'Paid ($)',
      data: memberTotals,
      backgroundColor: state.group.members.map((_, i) => COLORS[i % COLORS.length] + 'cc'),
      borderColor: state.group.members.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  const commonOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, color: 'var(--text-secondary)', font: { size: 12 } } },
      title: { display: !!title, text: title, color: 'var(--text-primary)', font: { size: 14, weight: '600' } },
      tooltip: { borderWidth: 1 }
    }
  });

  const barOptions = (title) => ({
    ...commonOptions(title),
    plugins: {
      ...commonOptions(title).plugins,
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } },
      y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--text-secondary)' } }
    }
  });

  const totalSpent = realExpenses.reduce((s, e) => s + e.amount, 0);
  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];

  return (
    <div>
      <div className="page-header">
        <h1>📊 Spending Charts</h1>
        <p>Visualize your group's spending patterns</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon purple">💸</div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">${totalSpent.toFixed(0)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📂</div>
          <div>
            <div className="stat-label">Top Category</div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>{topCategory ? topCategory[0] : '—'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <div>
            <div className="stat-label">Avg / Expense</div>
            <div className="stat-value">${realExpenses.length ? (totalSpent / realExpenses.length).toFixed(0) : 0}</div>
          </div>
        </div>
      </div>

      {realExpenses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>Add some expenses to see your spending charts!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            {/* Pie Chart */}
            <div className="card">
              <div className="card-title">🥧 Spending by Category</div>
              <div className="chart-wrapper" style={{ maxHeight: 280 }}>
                {Object.keys(categoryTotals).length > 0 ? (
                  <Pie data={pieData} options={commonOptions('')} />
                ) : (
                  <div className="empty-state"><p>No data yet</p></div>
                )}
              </div>
            </div>

            {/* Monthly Bar */}
            <div className="card">
              <div className="card-title">📅 Monthly Trend</div>
              <div className="chart-wrapper" style={{ maxHeight: 280 }}>
                <Bar data={barData} options={barOptions('')} />
              </div>
            </div>
          </div>

          {/* Per-person bar */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">👥 Spending per Person</div>
            <div className="chart-wrapper" style={{ maxHeight: 220 }}>
              <Bar data={memberBarData} options={barOptions('')} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Charts;
