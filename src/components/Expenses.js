import React, { useState, useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import { categories } from '../data/dummyData';

const CATEGORY_ICONS = {
  'Rent': '🏠', 'Food': '🍔', 'Internet': '📶', 'Utilities': '⚡',
  'Fun': '🎮', 'Transportation': '🚗', 'Other': '📌', 'Settlement': '🤝'
};

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
];

const Expenses = () => {
  const { state, dispatch } = useContext(ExpenseContext);
  const { addToast } = useToast();
  const [currency, setCurrency] = useState(state.budget?.currency || 'USD');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    paidBy: state.group.currentUser,
    participants: [...state.group.members],
    date: today,
  });

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleParticipant = (member) => {
    setForm(prev => ({
      ...prev,
      participants: prev.participants.includes(member)
        ? prev.participants.filter(p => p !== member)
        : [...prev.participants, member]
    }));
  };

  const splitAmount = () => {
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || form.participants.length === 0) return '0.00';
    return (amt / form.participants.length).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }
    if (!form.description.trim()) {
      addToast('Please add a description', 'warning');
      return;
    }
    if (form.participants.length === 0) {
      addToast('Select at least one participant', 'warning');
      return;
    }

    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        id: Date.now(),
        amount,
        category: form.category,
        description: form.description.trim(),
        paidBy: form.paidBy,
        date: form.date,
        participants: form.participants,
        currency
      }
    });

    addToast(`Expense "${form.description}" added! 🎉`, 'success');
    setForm({
      amount: '',
      category: 'Food',
      description: '',
      paidBy: state.group.currentUser,
      participants: [...state.group.members],
      date: today,
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>➕ Add Expense</h1>
        <p>Log a new shared expense for your group</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="expense-form-grid">
              {/* Amount + Currency */}
              <div className="form-group">
                <label className="form-label">Amount</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    style={{ width: '90px', flexShrink: 0 }}
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                  </select>
                  <input
                    className="form-input"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  max={today}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_ICONS[cat] || '📌'} {cat}</option>
                  ))}
                </select>
              </div>

              {/* Paid By */}
              <div className="form-group">
                <label className="form-label">Paid By</label>
                <select className="form-select" name="paidBy" value={form.paidBy} onChange={handleChange}>
                  {state.group.members.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              {/* Split Between */}
              <div className="form-group full-width">
                <label className="form-label">Split Between</label>
                <div className="participants-grid">
                  {state.group.members.map(member => (
                    <label
                      key={member}
                      className={`participant-chip ${form.participants.includes(member) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.participants.includes(member)}
                        onChange={() => toggleParticipant(member)}
                      />
                      {member}
                    </label>
                  ))}
                </div>
              </div>

              {/* Split Preview */}
              {form.amount && form.participants.length > 0 && (
                <div className="split-banner full-width">
                  <span>💡</span>
                  <span>
                    Each person pays <strong>{currencySymbol}{splitAmount()}</strong>
                    {' '}({form.participants.length} people)
                  </span>
                </div>
              )}

              <div className="full-width">
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                  ➕ Add Expense
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Recent expenses sidebar */}
        <div>
          <div className="card">
            <div className="card-title">🕒 Recent Expenses</div>
            {state.expenses.filter(e => !e.isSettlement).slice(-5).reverse().map(expense => (
              <div key={expense.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="expense-cat-icon" style={{ width: 34, height: 34, fontSize: '1rem' }}>
                  {CATEGORY_ICONS[expense.category] || '📌'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {expense.description}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    by {expense.paidBy} · {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                  ${expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {state.expenses.filter(e => !e.isSettlement).length === 0 && (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-state-icon">📭</div>
                <p>No expenses yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
