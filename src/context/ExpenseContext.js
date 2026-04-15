import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { dummyExpenses, dummyGamification, categories } from '../data/dummyData';

export const ExpenseContext = createContext();

const calculateBalances = (expenses, members) => {
  const balances = {};
  members.forEach(member => balances[member] = 0);

  expenses.forEach(expense => {
    const isSettlement = expense.isSettlement || expense.category === 'Settlement';

    if (isSettlement) {
      const payer = expense.paidBy;
      const receiver = expense.participants?.find(p => p !== payer);

      if (payer && receiver) {
        balances[payer] = (balances[payer] || 0) + expense.amount;
        balances[receiver] = (balances[receiver] || 0) - expense.amount;
      }
    } else {
      // 2. Normal Shared Expense
      const splitAmount = expense.amount / expense.participants.length;
      expense.participants.forEach(participant => {
        if (participant !== expense.paidBy) {
          balances[participant] = (balances[participant] || 0) - splitAmount;
          balances[expense.paidBy] = (balances[expense.paidBy] || 0) + splitAmount;
        }
      });
    }
  });
  return balances;
};

const initialMembers = ['Alice', 'Bob', 'Charlie'];

const initialState = {
  group: { name: 'Flat 3B', members: initialMembers, currentUser: 'Alice' },
  expenses: dummyExpenses,
  balances: calculateBalances(dummyExpenses, initialMembers),
  gamification: dummyGamification,
  categories,
  budget: { monthly: 500, currency: 'USD' }
};

const expenseReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const updatedExpenses = [...state.expenses, action.payload];
      return {
        ...state,
        expenses: updatedExpenses,
        balances: calculateBalances(updatedExpenses, state.group.members)
      };
    }

    case 'SETTLE_BALANCE': {
      // Logic for determining exactly who pays what
      const personA = action.payload?.from || action.payload?.payer;
      const personB = action.payload?.to || action.payload?.receiver;

      if (!personA || !personB) return state;

      const balA = state.balances[personA] || 0;
      const balB = state.balances[personB] || 0;

      // Identify the Debtor (negative balance) and Creditor (positive balance)
      let debtor, creditor;
      if (balA < 0) { debtor = personA; creditor = personB; }
      else if (balB < 0) { debtor = personB; creditor = personA; }
      else return state; // Nobody owes anything

      const amountToSettle = Math.min(Math.abs(state.balances[debtor]), Math.abs(state.balances[creditor]));

      if (amountToSettle <= 0) return state;

      const settleExpense = {
        id: Date.now(),
        amount: amountToSettle,
        category: 'Settlement',
        description: `${debtor} settled part of the tab with ${creditor}`,
        paidBy: debtor,
        date: new Date().toISOString().split('T')[0],
        participants: [debtor, creditor],
        isSettlement: true
      };

      const updatedExpenses = [...state.expenses, settleExpense];

      return {
        ...state,
        expenses: updatedExpenses,
        balances: calculateBalances(updatedExpenses, state.group.members)
      };
    }

    case 'DELETE_EXPENSE': {
      const updatedExpenses = state.expenses.filter(e => e.id !== action.payload);
      return {
        ...state,
        expenses: updatedExpenses,
        balances: calculateBalances(updatedExpenses, state.group.members)
      };
    }

    default:
      return state;
  }
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  return (
    <ExpenseContext.Provider value={{ state, dispatch }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);