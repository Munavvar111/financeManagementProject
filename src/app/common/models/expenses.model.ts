export interface Expense {
    id?: string;
    date: Date | string;
    category: string;
    account:string;
    type: string;
    amount: number ;
  }

  export interface PaymentType{
    id?:string,
    name:string,
    balnce:number
  }
  export interface Incomes{
    id?:string,
    date:Date | string,
    account:string,
    category:string,
    amount:number,
  }
export  interface Category {
    id: number;
    name: string;
    type: string;
    subcategories: Subcategory[];
    isOpen: boolean
}

export interface Subcategory {
    id: string; 
    name: string;
    categoryId:number;
}

export interface Transection{
  id:string;
  name: string;
  date: Date;
  amount: number;
  account:string;
  icon: string;
  type: string; 
}
export interface FieldConfig {
  type: string;
  label: string;
  name: string;
  options?: { value: string, label: string }[];
}
