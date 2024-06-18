export interface Expense {
    id?: string;
    date: Date | string;
    category: string;
    type: string;
    amount: number ;
    comments?: string;
  }

  export interface PaymentType{
    id?:string,
    name:string,
    balnce:number
  }
  export interface Incomes{
    id?:string,
    date:Date | string,
    accountType:string,
    amount:number
  }
export  interface Category {
    id: number;
    name: string;
    type: string;
    subcategories: Subcategory[];
    isOpen: boolean
}

export interface Subcategory {
    id: number; 
    name: string;
}
// subcategory.model.ts

export interface Transection{
  name: string;
  date: string;
  amount: number;
  icon: string;
  type: string; // 'income' or 'expense'
}