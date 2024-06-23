// transection.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Expense, Incomes, PaymentType, Transection } from '../../../../common/models/expenses.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { DetailDailogComponent } from './detail-dailog/detail-dailog.component';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transection',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './transection.component.html',
  styleUrls: ['./transection.component.css'],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class TransectionComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'date', 'type', 'category', 'amount', 'account', 'action'];
  accountType:PaymentType[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  selected = 'option2';
  filterForm = new FormGroup({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  });
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: any;

  constructor(private apiService: ApiServiceService, private cdr: ChangeDetectorRef, public dialog: MatDialog,private commonService:CommonServiceService,private snackbar:MatSnackBar) { }

  ngOnInit() {
    this.fetchData();
    this.apiService.getAccount().subscribe({
      next:(response:PaymentType[])=>{
        this.accountType=response;
      },
      error:err=>{
        this.snackbar.open("Something Went Wrong","Close",{duration:3000})
      }
    })
    this.range.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyFilter();
  }

  exportAsExcel(): void {
    const filteredData = this.dataSource.filteredData;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    XLSX.writeFile(wb, 'transactions.xlsx');
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
            this.dataSource.data = combinedData;
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
    const filterValue = this.input ? this.input.nativeElement.value.trim().toLowerCase() : '';
    const { start, end } = this.range.value;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const combinedFilter = filterValue || ' ';
    this.dataSource.filterPredicate = (data, combinedFilter) => {
      const date = new Date(data.date);
      const isAfterStart = !startDate || date >= startDate;
      const isBeforeEnd = !endDate || date <= endDate;

      const matchesDateRange = isAfterStart && isBeforeEnd;
      const matchesFilterValue = Object.keys(data).some(key => data[key].toString().toLowerCase().includes(combinedFilter.trim()));
      return matchesDateRange && matchesFilterValue;
    };

    this.dataSource.filter = combinedFilter;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  editElement(element: Transection): void {
    const title = element.type === 'Income' ? 'Edit Income' : 'Edit Expense';
    const dialogRef = this.dialog.open(DetailDailogComponent, {
      width: '400px',
      data: { ...element, title } // Pass the element data along with the title
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
        result.id=element.id;   const updateFn = result.type === "Expense" ? 
          this.apiService.updateExpense.bind(this.apiService) : 
          this.apiService.updateIncomeDetails.bind(this.apiService);

        const updateAccountFn = result.type === "Expense" ? 
          this.commonService.updateAccountBalance(result.account, 'Expenses', element.amount, result.amount, this.accountType) :
          this.commonService.updateAccountBalance(result.account, 'Income', element.amount, result.amount, this.accountType);

        updateAccountFn.subscribe({
          next: (response: PaymentType | null) => {
            if (response) {
              this.snackbar.open("Account Update Successful", "Close", { duration: 3000 });
              console.log("Account update successful");

              // Update the data table if the account update was successful
              updateFn(result).subscribe({
                next: (updatedEntry) => {
                  const index = this.dataSource.data.findIndex(item => item.id === updatedEntry.id);
                  if (index !== -1) {
                    this.dataSource.data[index] = updatedEntry;
                    this.dataSource.data = [...this.dataSource.data]; // Trigger change detection
                  } else {
                    this.dataSource.data = [...this.dataSource.data, updatedEntry];
                  }
                  this.applyFilter();
                  this.snackbar.open("Entry updated successfully", "Close", { duration: 3000 });
                },
                error: (err) => {
                  console.error('Error updating entry', err);
                  this.snackbar.open("Error updating entry", "Close", { duration: 3000 });
                }
              });
            } else {
              // Handle the case where balance validation failed
              this.snackbar.open("Insufficient balance or account not found", "Close", { duration: 3000 });
            }
          },
          error: err => {
            this.snackbar.open("Something went wrong", "Close", { duration: 3000 });
          }
        });
    }
    });
  }
  





  deleteElement(element: Element): void {
    // Implement your delete logic here
    console.log('Delete', element);
  }
  clearDateRange() {
    this.range.reset()
    this.applyFilter();
  }
}
