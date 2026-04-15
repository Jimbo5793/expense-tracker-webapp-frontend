import React, { useState, useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import { categories } from '../data/dummyData';

const CATEGORY_ICONS = {
  'Rent': '🏠', 'Food': '🍔', 'Internet': '📶', 'Utilities': '⚡',
  'Fun': '🎮', 'Transportation': '🚗', 'Other': '📌', 'Settlement': '🤝'
};

const History = () => {
  const { state, dispatch } = useContext(ExpenseContext);
  const { addToast } = useToast();
  const [filter, setFilter] = useState({ category: 'All', person: 'All' });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sort, setSort] = useState({ field: 'date', dir: 'desc' });
  const [showSettlements, setShowSettlements] = useState(false);

  // Filter
  let filtered = state.expenses.filter(expense => {
    if (!showSettlements && expense.isSettlement) return false;
    const catMatch = filter.category === 'All' || expense.category === filter.category;
    const personMatch = filter.person === 'All' ||
      expense.paidBy === filter.person ||
      expense.participants.includes(filter.person);
    const dateFrom = dateRange.from ? new Date(dateRange.from) : null;
    const dateTo = dateRange.to ? new Date(dateRange.to) : null;
    const expDate = new Date(expense.date);
    const dateMatch = (!dateFrom || expDate >= dateFrom) && (!dateTo || expDate <= dateTo);
    return catMatch && personMatch && dateMatch;
  });

  // Sort
  filtered = filtered.sort((a, b) => {
    let cmp = 0;
    if (sort.field === 'date') cmp = new Date(a.date) - new Date(b.date);
    if (sort.field === 'amount') cmp = a.amount - b.amount;
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const totalSpent = filtered.filter(e => !e.isSettlement).reduce((s, e) => s + e.amount, 0);

  const handleSort = (field) => {
    setSort(prev => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const deleteExpense = (id, description) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    addToast(`"${description}" deleted`, 'danger');
  };

  const exportCSV = () => {
    const header = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Participants'];
    const rows = filtered.map(e => [
      e.date, e.description, e.category, e.amount.toFixed(2), e.paidBy, e.participants.join('; ')
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV exported!', 'success');
  };

  const sortIcon = (field) => {
    if (sort.field !== field) return '↕';
    return sort.dir === 'asc' ? '↑' : '↓';
  };

  return (
    <div>
      <div className="page-header">
        <h1>📋 Expense History</h1>
        <p>Browse and manage all recorded expenses</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Category</label>
          <select className="form-select" value={filter.category}
            onChange={e => setFilter(p => ({ ...p, category: e.target.value }))}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 130 }}>
          <label className="form-label">Person</label>
          <select className="form-select" value={filter.person}
            onChange={e => setFilter(p => ({ ...p, person: e.target.value }))}>
            <option value="All">All People</option>
            {state.group.members.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 130 }}>
          <label className="form-label">From</label>
          <input className="form-input" type="date" value={dateRange.from}
            onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
        </div>
        <div className="form-group" style={{ minWidth: 130 }}>
          <label className="form-label">To</label>
          <input className="form-input" type="date" value={dateRange.to}
            onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
        </div>
        <div className="form-group" style={{ minWidth: 120, flexShrink: 0 }}>
          <label className="form-label">Settlements</label>
          <label className="participant-chip" style={{ cursor: 'pointer', userSelect: 'none', width: 'fit-content' }}
            onClick={() => setShowSettlements(s => !s)}>
            {showSettlements ? '✅' : '⬜'} Show
          </label>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button className="btn-secondary" onClick={exportCSV} title="Export CSV">📥 Export</button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="history-summary-row">
        <div className="history-count">
          Showing <strong>{filtered.length}</strong> expenses
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className={`sort-btn ${sort.field === 'date' ? 'active' : ''}`} onClick={() => handleSort('date')}>
            Date {sortIcon('date')}
          </button>
          <button className={`sort-btn ${sort.field === 'amount' ? 'active' : ''}`} onClick={() => handleSort('amount')}>
            Amount {sortIcon('amount')}
          </button>
          <div className="history-total">Total: ${totalSpent.toFixed(2)}</div>
        </div>
      </div>

      {/* Expense Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔍</div>
          <p>No expenses match your filters</p>
        </div>
      ) : (
        <div className="expense-list">
          {filtered.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-cat-icon">
                {CATEGORY_ICONS[expense.category] || '📌'}
              </div>
              <div className="expense-info">
                <div className="expense-desc">{expense.description}</div>
                <div className="expense-meta">
                  Paid by <strong>{expense.paidBy}</strong> · {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}Split {expense.participants.length > 3
                    ? `${expense.participants.slice(0, 2).join(', ')} +${expense.participants.length - 2} more`
                    : expense.participants.join(', ')}
                </div>
              </div>
              <div className="expense-right">
                <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                <div className="expense-category-tag">{expense.category}</div>
              </div>
              {!expense.isSettlement && (
                <button
                  className="btn-icon"
                  onClick={() => deleteExpense(expense.id, expense.description)}
                  title="Delete expense"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
