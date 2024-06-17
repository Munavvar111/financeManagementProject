import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category, Expense, Incomes, PaymentType, Subcategory } from '../models/expenses.model';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  private url = `http://localhost:3000`;
  constructor(private http: HttpClient) { }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.url}/expenses`)
  }
  postExpenses(expenses: Expense): Observable<Expense> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Expense>(`${this.url}/expenses`, expenses, { headers })
  }
  getAccount(): Observable<PaymentType[]> {
    return this.http.get<PaymentType[]>(`${this.url}/PaymentType`)
  }

  postAccount(paymentType: PaymentType): Observable<PaymentType> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<PaymentType>(`${this.url}/PaymentType`, paymentType, { headers });
  }
  updateAccount(account:PaymentType):Observable<PaymentType>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<PaymentType>(`${this.url}/PaymentType/${account.id}`,account,{headers})
  }
  getIncomeDetails():Observable<Incomes[]>{
    return this.http.get<Incomes[]>(`${this.url}/income`)
  }
  postIncomeDetails(income:Incomes):Observable<Incomes>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Incomes>(`${this.url}/income`,income,{headers});
  }

  getCategories():Observable<Category[]>{
    return this.http.get<Category[]>(`${this.url}/categories`);
  }
  addCategory(category): Observable<any> {
    return this.http.post<any>(`${this.url}/categories`,category);
  }

  getIncomeAndExpense(): Observable<{ income: Incomes[], expense: Expense[] }> {
    return this.http.get<{ income: Incomes[], expense: Expense[] }>(`${this.url}/income-and-expense`);
  }
  updateCategory(id, category): Observable<any> {
    return this.http.put<any>(`${this.url}/categories`,category);
  }
  getSubcategories(categoryId: string): Observable<Subcategory[]> {
    const url = `${this.url}/categories/${categoryId}`;
    return this.http.get<any>(url).pipe(
      map((category: any) => category.subcategories as Subcategory[])
    );
  }

  deleteCategory(id): Observable<any> {
    return this.http.delete<any>(`${this.url}/categories/${id}`);
  }
  deleteSubCategory(categoryId: number, subcategoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/categories/${categoryId}/subcategories/${subcategoryId}`);
  }
}
