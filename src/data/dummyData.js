export const dummyExpenses = [
  {
    id: 1,
    amount: 45.00,
    category: 'Food',
    description: 'Groceries for the week',
    paidBy: 'Alice',
    date: '2024-01-15',
    participants: ['Alice', 'Bob', 'Charlie']
  },
  {
    id: 2,
    amount: 120.00,
    category: 'Rent',
    description: 'Monthly rent',
    paidBy: 'Bob',
    date: '2024-01-01',
    participants: ['Alice', 'Bob', 'Charlie']
  },
  {
    id: 3,
    amount: 25.50,
    category: 'Fun',
    description: 'Movie night snacks',
    paidBy: 'Charlie',
    date: '2024-01-10',
    participants: ['Alice', 'Bob', 'Charlie']
  },
  {
    id: 4,
    amount: 60.00,
    category: 'Internet',
    description: 'Internet bill',
    paidBy: 'Alice',
    date: '2024-01-05',
    participants: ['Alice', 'Bob', 'Charlie']
  }
];

export const dummyBalances = {
  'Alice': -15.00, // Alice is owed money
  'Bob': 25.00,    // Bob owes money
  'Charlie': -10.00 // Charlie is owed money
};

export const dummyGamification = {
  points: 45,
  badges: ['Early Payer', 'Budget Hero'],
  streaks: {
    logging: 5,
    settling: 2,
    noSpend: 3
  }
};

export const categories = [
  'Rent',
  'Food',
  'Internet',
  'Utilities',
  'Fun',
  'Transportation',
  'Other'
];
