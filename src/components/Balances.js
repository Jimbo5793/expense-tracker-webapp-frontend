import React, { useState, useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';

const AVATAR_COLORS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#3b82f6,#2563eb)',
  'linear-gradient(135deg,#ec4899,#db2777)',
];
const getInitials = (name) => name.trim().slice(0, 2).toUpperCase();
const getColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const SettleModal = ({ debtor, creditor, amount, onConfirm, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-title">⚖️ Settle Up</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
        <strong>{debtor}</strong> owes <strong>{creditor}</strong>{' '}
        <span style={{ color: 'var(--success)', fontWeight: 700 }}>${amount.toFixed(2)}</span>.
        <br />Confirm settlement?
      </p>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={onConfirm}>✅ Confirm Settlement</button>
      </div>
    </div>
  </div>
);

const Balances = () => {
  const { state, dispatch } = useContext(ExpenseContext);
  const { addToast } = useToast();
  const [settleModal, setSettleModal] = useState(null);
  const [budgetInput, setBudgetInput] = useState(state.budget?.monthly || 500);

  const maxAbs = Math.max(...state.group.members.map(m => Math.abs(state.balances[m] || 0)), 1);
  const totalSpent = state.expenses.filter(e => !e.isSettlement).reduce((s, e) => s + e.amount, 0);
  const budgetPercent = Math.min((totalSpent / (state.budget?.monthly || 500)) * 100, 100);

  // Personal balance
  const personalBalance = state.balances[state.group.currentUser] || 0;


  const openSettle = (member) => {
    const balance = state.balances[member] || 0;
    if (balance <= 0) return;
    // member owes — find who they owe
    const creditor = state.group.members
      .filter(m => m !== member && (state.balances[m] || 0) < 0)
      .sort((a, b) => (state.balances[a] || 0) - (state.balances[b] || 0))[0] || state.group.members.find(m => m !== member);
    setSettleModal({ debtor: member, creditor, amount: balance });
  };

  const confirmSettle = () => {
    if (!settleModal) return;
    dispatch({ type: 'SETTLE_BALANCE', payload: { from: settleModal.debtor, to: settleModal.creditor } });
    addToast(`${settleModal.debtor} settled up! 🎉`, 'success');
    setSettleModal(null);
  };

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) return;
    dispatch({ type: 'SET_BUDGET', payload: { monthly: val } });
    addToast('Budget updated!', 'success');
  };

  const pointsMax = 200;
  const pointsPercent = Math.min((state.gamification.points / pointsMax) * 100, 100);
  const circumference = 2 * Math.PI * 30;

  return (
    <div>
      <div className="page-header">
        <h1>⚖️ Balances</h1>
        <p>Track what everyone owes and is owed</p>
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
          <div className={`stat-icon ${personalBalance > 0 ? 'red' : personalBalance < 0 ? 'green' : 'purple'}`}>
            {personalBalance > 0 ? '📤' : personalBalance < 0 ? '📥' : '✅'}
          </div>
          <div>
            <div className="stat-label">Your Balance</div>
            <div className="stat-value" style={{ color: personalBalance > 0 ? 'var(--danger)' : personalBalance < 0 ? 'var(--success)' : 'var(--text-muted)', fontSize: '1.2rem' }}>
              {personalBalance > 0
                ? `Owe $${personalBalance.toFixed(2)}`
                : personalBalance < 0
                  ? `Owed $${Math.abs(personalBalance).toFixed(2)}`
                  : 'Settled ✅'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⭐</div>
          <div>
            <div className="stat-label">Points</div>
            <div className="stat-value">{state.gamification.points}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Member Balances */}
        <div className="card">
          <div className="card-title">👥 Member Balances</div>
          <div className="balance-grid" style={{ gridTemplateColumns: '1fr' }}>
            {state.group.members.map(member => {
              const balance = state.balances[member] || 0;
              const statusClass = balance > 0 ? 'owes' : balance < 0 ? 'owed' : 'settled';
              const pct = Math.round((Math.abs(balance) / maxAbs) * 100);
              return (
                <div key={member} className="balance-member-card" style={{ padding: '14px' }}>
                  <div className="balance-member-header">
                    <div className="member-avatar" style={{ background: getColor(member) }}>
                      {getInitials(member)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="member-name">{member}</div>
                        {member === state.group.currentUser && (
                          <span className="member-you-badge">You</span>
                        )}
                      </div>
                      <span className={`balance-status ${statusClass}`}>
                        {statusClass === 'owes' ? 'Owes' : statusClass === 'owed' ? 'Owed' : 'Settled'}
                      </span>
                    </div>
                    <div className={`balance-amount-large ${statusClass}`} style={{ fontSize: '1.1rem' }}>
                      {balance === 0 ? '—' : `$${Math.abs(balance).toFixed(2)}`}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${statusClass}`} style={{ width: `${pct}%` }} />
                  </div>
                  {balance > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn-success" onClick={() => openSettle(member)}>
                        ✅ Settle Up
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Budget + Gamification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Budget Tracker */}
          <div className="card">
            <div className="card-title">📊 Monthly Budget</div>
            <div style={{ marginBottom: 12 }}>
              <div className="budget-header">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ${totalSpent.toFixed(2)} of ${(state.budget?.monthly || 500).toFixed(2)}
                </span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: budgetPercent > 90 ? 'var(--danger)' : budgetPercent > 70 ? 'var(--warning)' : 'var(--success)'
                }}>
                  {budgetPercent.toFixed(0)}%
                </span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${budgetPercent}%`,
                    background: budgetPercent > 90
                      ? 'var(--danger)'
                      : budgetPercent > 70
                        ? 'var(--warning)'
                        : 'var(--success)'
                  }}
                />
              </div>
              <div className="budget-labels">
                <span>$0</span>
                <span>${(state.budget?.monthly || 500).toFixed(0)}</span>
              </div>
            </div>
            <div className="budget-input-row">
              <input
                className="form-input"
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                placeholder="Set monthly budget"
                min="1"
              />
              <button className="btn-primary" onClick={saveBudget}>Set</button>
            </div>
          </div>

          {/* Gamification */}
          <div className="card">
            <div className="card-title">🏆 Achievements</div>
            <div className="gamification-grid">
              <div className="points-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="30" fill="none"
                    stroke="url(#grad)" strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pointsPercent / 100)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="points-ring-center">
                  <div className="points-number">{state.gamification.points}</div>
                  <div className="points-label">pts</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Badges</div>
                <div className="badges-row">
                  {state.gamification.badges.map(badge => (
                    <span key={badge} className="badge-chip">🏅 {badge}</span>
                  ))}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 12, marginBottom: 6 }}>Streaks 🔥</div>
                <div className="streaks-row">
                  <div className="streak-item">📝 <span className="streak-num">{state.gamification.streaks.logging}</span> logging</div>
                  <div className="streak-item">⚖️ <span className="streak-num">{state.gamification.streaks.settling}</span> settling</div>
                  <div className="streak-item">🚫 <span className="streak-num">{state.gamification.streaks.noSpend}</span> no-spend</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {settleModal && (
        <SettleModal
          debtor={settleModal.debtor}
          creditor={settleModal.creditor}
          amount={settleModal.amount}
          onConfirm={confirmSettle}
          onClose={() => setSettleModal(null)}
        />
      )}
    </div>
  );
};

export default Balances;
