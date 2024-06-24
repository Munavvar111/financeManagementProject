import { Component, OnInit } from '@angular/core';
import { Expense, Incomes, Transection } from '../../../../common/models/expenses.model';
import { ApiServiceService } from '../../../../common/services/apiService.service';

@Component({
  selector: 'app-show-transaction',
  standalone: true,
  imports: [],
  templateUrl: './show-transaction.component.html',
  styleUrl: './show-transaction.component.css'
})
export class ShowTransactionComponent implements OnInit {

  transactionData:any[];
  constructor(private apiService:ApiServiceService){

  }

  ngOnInit(): void {
    this.fetchData()
    console.log(this.transactionData)
  }
  fetchData(){
    this.apiService.getExpenses().subscribe({
      next: (expenses: Expense[]) => {
        this.apiService.getIncomeDetails().subscribe({
          next: (income: Incomes[]) => {
            const combinedData = [
              ...expenses.map(expense => ({ ...expense, type: 'Expense' })),
              ...income.map(incomeItem => ({
                id: incomeItem.id,
                date: incomeItem.date,
                account: incomeItem.account,
                type: 'Income',
                category: incomeItem.category,
                amount: incomeItem.amount,
              }))
            ];
            this.transactionData = combinedData;
          },
          error: err => {
            console.error(err);
          }
        });
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
