export interface Expense {
    id?: string;
    date: Date | string;
    category: string;
    type: string;
    amount: number | string;
    comments?: string;
  }