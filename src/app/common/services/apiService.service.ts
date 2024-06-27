import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  Category,
  Expense,
  Incomes,
  PaymentType,
  Subcategory,
} from '../models/expenses.model';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  private url = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.url}/expenses`);
  }

  postExpenses(expenses: Expense): Observable<Expense> {
    return this.http.post<Expense>(`${this.url}/expenses`, expenses, {
      headers: this.getHeaders(),
    });
  }

  updateExpense(expenses: Expense): Observable<Expense> {
    return this.http.put<Expense>(
      `${this.url}/expenses/${expenses.id}`,
      expenses,
      { headers: this.getHeaders() }
    );
  }
  getAccount(): Observable<PaymentType[]> {
    return this.http.get<PaymentType[]>(`${this.url}/PaymentType`);
  }

  postAccount(paymentType: PaymentType): Observable<PaymentType> {
    return this.http.post<PaymentType>(`${this.url}/PaymentType`, paymentType, {
      headers: this.getHeaders(),
    });
  }
  updateAccount(account: PaymentType): Observable<PaymentType> {
    console.log(account);
    return this.http.put<PaymentType>(
      `${this.url}/PaymentType/${account.id}`,
      account,
      { headers: this.getHeaders() }
    );
  }
  getIncomeDetails(): Observable<Incomes[]> {
    return this.http.get<Incomes[]>(`${this.url}/income`);
  }
  postIncomeDetails(income: Incomes): Observable<Incomes> {
    return this.http.post<Incomes>(`${this.url}/income`, income, {
      headers: this.getHeaders(),
    });
  }
  updateIncomeDetails(income: Incomes): Observable<Incomes> {
    return this.http.put<Incomes>(`${this.url}/income/${income.id}`, income, {
      headers: this.getHeaders(),
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.url}/categories?_embed=subcategories`
    );
  }
  getSubCategories():Observable<Subcategory[]>{
    return this.http.get<Subcategory[]>(`${this.url}/subcategories`)
  }
  addSubCategory(subCategory): Observable<Subcategory> {
    return this.http.post<Subcategory>(
      `${this.url}/subcategories`,
      subCategory
    );
  }

  deleteSubCategory(subcategoryId: number): Observable<Subcategory> {
    return this.http.delete<Subcategory>(
      `${this.url}/subcategories/${subcategoryId}`
    );
  }
  updateSubCategory(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.put<Subcategory>(
      `${this.url}/subcategories/${subcategory.id}`,
      subcategory
    );
  }

  getIncomeAndExpenses(): Observable<any[]> {
    return forkJoin([this.getIncomeDetails(), this.getExpenses()]);
  }
  deleteExpenses(expenseId: string): Observable<Expense> {
    return this.http.delete<Expense>(`${this.url}/expenses/${expenseId}`);
  }
  deleteIncome(incomeId: string): Observable<Incomes> {
    return this.http.delete<Expense>(`${this.url}/income/${incomeId}`);
  }
}
