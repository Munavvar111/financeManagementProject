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
}

export interface Subcategory {
    id: number; 
    name: string;
}
// subcategory.model.ts

