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

const Group = () => {
  const { state, dispatch } = useContext(ExpenseContext);
  const { addToast } = useToast();
  const [newMember, setNewMember] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(state.group.name);

  const addMember = () => {
    const name = newMember.trim();
    if (!name) return;
    if (state.group.members.includes(name)) {
      addToast(`"${name}" is already in the group`, 'warning');
      return;
    }
    dispatch({ type: 'ADD_MEMBER', payload: name });
    addToast(`${name} added to the group! 🎉`, 'success');
    setNewMember('');
  };

  const removeMember = (member) => {
    if (state.group.members.length <= 1) {
      addToast('At least one member is required', 'warning');
      return;
    }
    if (member === state.group.currentUser) {
      addToast('You cannot remove yourself', 'warning');
      return;
    }
    dispatch({ type: 'REMOVE_MEMBER', payload: member });
    addToast(`${member} removed from group`, 'danger');
  };

  const setCurrentUser = (member) => {
    if (member === state.group.currentUser) return;
    dispatch({ type: 'SET_CURRENT_USER', payload: member });
    addToast(`Switched to ${member}`, 'info');
  };

  const saveGroupName = () => {
    const name = groupNameInput.trim();
    if (!name) return;
    dispatch({ type: 'SET_GROUP_NAME', payload: name });
    setEditingName(false);
    addToast('Group name updated', 'success');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addMember();
  };

  return (
    <div>
      <div className="page-header">
        <h1>👥 Group Management</h1>
        <p>Manage your group members and settings</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div>
            <div className="stat-label">Members</div>
            <div className="stat-value">{state.group.members.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💸</div>
          <div>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value">{state.expenses.filter(e => !e.isSettlement).length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">💰</div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">
              ${state.expenses.filter(e => !e.isSettlement).reduce((s, e) => s + e.amount, 0).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Group Info */}
        <div className="card">
          <div className="card-title">🏠 Group Info</div>
          {editingName ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                value={groupNameInput}
                onChange={e => setGroupNameInput(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && saveGroupName()}
              />
              <button className="btn-primary" onClick={saveGroupName}>Save</button>
              <button className="btn-secondary" onClick={() => setEditingName(false)}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{state.group.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  You are signed in as <strong>{state.group.currentUser}</strong>
                </div>
              </div>
              <button className="btn-secondary" onClick={() => { setGroupNameInput(state.group.name); setEditingName(true); }}>
                ✏️ Edit
              </button>
            </div>
          )}
        </div>

        {/* Add Member */}
        <div className="card">
          <div className="card-title">➕ Add Member</div>
          <div className="add-member-row">
            <input
              className="form-input"
              type="text"
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter member name..."
            />
            <button className="btn-primary" onClick={addMember}>Add</button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Press Enter or click Add to invite a member
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-title">Members ({state.group.members.length})</div>
        {state.group.members.map(member => (
          <div key={member} className="member-list-item">
            <div
              className="member-avatar"
              style={{ background: getColor(member) }}
            >
              {getInitials(member)}
            </div>
            <div className="member-list-name">{member}</div>
            {member === state.group.currentUser && (
              <span className="member-you-badge">You</span>
            )}
            {member !== state.group.currentUser && (
              <button
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                onClick={() => setCurrentUser(member)}
              >
                Switch to
              </button>
            )}
            {member !== state.group.currentUser && (
              <button className="btn-icon" onClick={() => removeMember(member)} title="Remove member">
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Group;
