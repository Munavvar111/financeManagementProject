import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Expense, Incomes } from '../../../../common/models/expenses.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../../../common/matrial/matrial.module';

@Component({
  selector: 'app-transection',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './transection.component.html',
  styleUrl: './transection.component.css'
})
export class TransectionComponent implements OnInit  {

  displayedColumns: string[] = ['id', 'date', 'type', 'category',"amount","comment"];
  dataSource: MatTableDataSource<Expense> = new MatTableDataSource();
  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private apiService:ApiServiceService) {
  }
  ngOnInit() {
    this.fetchData()
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  fetchData() {
    this.apiService.getExpenses().subscribe({
      next: (expenses: Expense[]) => {
        this.apiService.getIncomeDetails().subscribe({
          next: (income: any[]) => {
            const combinedData = [
              ...expenses.map(expense => ({ ...expense, type: 'Expense' })),
              ...income.map(incomeItem => ({
                id: incomeItem.id,
                date: incomeItem.date,
                type: 'Income',
                category: incomeItem.accountType,
                amount: incomeItem.amount.toString(),
                comment: 'Add Money'
              }))
            ];
            this.dataSource.data = combinedData;
          },
          error: err => {
            console.log(err);
          }
        });
      },
      error: err => {
        console.log(err);
      }
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
