import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense, PaymentType } from '../models/expenses.model';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  private url = `http://localhost:3000`;
constructor(private http:HttpClient) {}

 getExpenses():Observable<Expense[]>{
  return this.http.get<Expense[]>(`${this.url}/expenses`)
 }
 postExpenses(expenses:Expense):Observable<Expense>{
  const headers=new HttpHeaders({
    'Content-Type':'application/json'
  });

  return this.http.post<Expense>(`${this.url}/expenses`,expenses,{headers})
 }
 getAccount():Observable<PaymentType[]>{
  return this.http.get<PaymentType[]>(`${this.url}/PaymentType`)
 }
}
