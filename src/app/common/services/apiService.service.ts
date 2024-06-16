import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense, Incomes, PaymentType } from '../models/expenses.model';

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
}
