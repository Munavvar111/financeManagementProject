import { Component, OnInit, ViewChild } from '@angular/core';
import { Expense, Incomes, Transection } from '../../../../common/models/expenses.model';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-show-transaction',
  standalone: true,
  imports: [MaterialModule,CommonModule,ReactiveFormsModule],
  templateUrl: './show-transaction.component.html',
  styleUrl: './show-transaction.component.css'
})
export class ShowTransactionComponent implements OnInit {
  transactionData: any[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];
  filterForm: FormGroup;
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private apiService: ApiServiceService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  fetchData() {
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

            this.transactionData = combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            this.totalItems = this.transactionData.length;
            this.applyFilter();
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

  applyFilter() {
    const { dateRange, searchQuery } = this.filterForm.value;
    const startDate = dateRange.start ? new Date(dateRange.start).getTime() : null;
    const endDate = dateRange.end ? new Date(dateRange.end).getTime() : null;
    const query = searchQuery.toLowerCase();

    this.filteredData = this.transactionData.filter(transaction => {
      const transactionDate = new Date(transaction.date).getTime();
      const dateMatch = (!startDate || transactionDate >= startDate) && (!endDate || transactionDate <= endDate);
      const searchMatch = query
        ? Object.values(transaction).some(value => value.toString().toLowerCase().includes(query))
        : true;

      return dateMatch && searchMatch;
    });

    this.totalItems = this.filteredData.length;
    this.paginateData();
  }

  paginateData() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.paginateData();
  }

  clearDateRange() {
    this.filterForm.get('dateRange').reset();
    this.applyFilter();
  }
}
