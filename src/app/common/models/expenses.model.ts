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