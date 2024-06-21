import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
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


  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.url}/categories?_embed=subcategories`);
  }


  addSubCategory(subCategory):Observable<Subcategory>{
    return this.http.post<Subcategory>(`${this.url}/subcategories`,subCategory);
  }


  deleteSubCategory(subcategoryId:number):Observable<Subcategory>{
    return this.http.delete<Subcategory>(`${this.url}/subcategories/${subcategoryId}`)
  }
  updateSubCategory(subcategory:Subcategory):Observable<Subcategory>{
    return this.http.put<Subcategory>(`${this.url}/subcategories/${subcategory.id}`,subcategory)
  }
  
  getIncomeAndExpenses(): Observable<any[]> {
    return forkJoin([this.getIncomeDetails(), this.getExpenses()]);
  }
}
