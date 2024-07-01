// transection.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import {
  Expense,
  Incomes,
  PaymentType,
  Transection,
} from '../../../../common/models/expenses.model';
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
import Swal from 'sweetalert2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transection',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './transection.component.html',
  styleUrls: ['./transection.component.css'],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransectionComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'date',
    'type',
    'category',
    'amount',
    'account',
    'action',
  ];
  accountType: PaymentType[];
  userId:string;
  dataIsLoad: boolean =false;
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

  constructor(
    private apiService: ApiServiceService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private commonService: CommonServiceService,
    private snackbar: MatSnackBar
  ) {
  }
  
  ngOnInit() {
    this.fetchData();
    const userString = localStorage.getItem('user');
if (userString) {
  const user = JSON.parse(userString);
  this.userId = user.id;
}
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
  
    forkJoin({
      expenses: this.apiService.getExpenses(this.userId),
      incomes: this.apiService.getIncomeDetails(this.userId)
    }).subscribe({
      next: ({ expenses, incomes }) => {
        const combinedData = [
          ...expenses.map(expense => ({ ...expense, type: 'Expense' })),
          ...incomes.map(incomeItem => ({
            id: incomeItem.id,
            date: incomeItem.date,
            account: incomeItem.account,
            type: 'Income',
            category: incomeItem.category,
            amount: incomeItem.amount,
          })),
        ];
        this.dataSource.data = combinedData;
        this.dataIsLoad = true;
    this.cdr.detectChanges()

      },
      error: (err) => {
        console.error(err);
      }
    });
    this.apiService.getAccount(this.userId).subscribe({
      next: (response: PaymentType[]) => {
        this.accountType = response;
        this.dataIsLoad = true;

      },
      error: (err) => {
        this.snackbar.open('Something Went Wrong', 'Close', { duration: 3000 });
      },
    });
  }
  applyFilter() {
    const filterValue = this.input
      ? this.input.nativeElement.value.trim().toLowerCase()
      : '';
    const { start, end } = this.range.value;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const combinedFilter = filterValue || ' ';
    this.dataSource.filterPredicate = (data, combinedFilter) => {
      const date = new Date(data.date);
      const isAfterStart = !startDate || date >= startDate;
      const isBeforeEnd = !endDate || date <= endDate;

      const matchesDateRange = isAfterStart && isBeforeEnd;
      const matchesFilterValue = Object.keys(data).some((key) =>
        data[key].toString().toLowerCase().includes(combinedFilter.trim())
      );
      return matchesDateRange && matchesFilterValue;
    };

    this.dataSource.filter = combinedFilter;
    this.dataIsLoad = true;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  editElement(element: Transection): void {
    const title = element.type === 'Income' ? 'Edit Income' : 'Edit Expense';
    const dialogRef = this.dialog.open(DetailDailogComponent, {
      width: '400px',
      data: { ...element, title },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog result:', result);
        result.id = element.id;
        const updateFn =
          result.type === 'Expense'
            ? this.apiService.updateExpense.bind(this.apiService)
            : this.apiService.updateIncomeDetails.bind(this.apiService);

        const updateAccountFn =
          result.type === 'Expense'
            ? this.commonService.updateAccountBalance(
                result.account,
                'Expenses',
                element.amount,
                result.amount,
                this.accountType
              )
            : this.commonService.updateAccountBalance(
                result.account,
                'Income',
                element.amount,
                result.amount,
                this.accountType
              );

        updateAccountFn.subscribe({
          next: (response: PaymentType | null) => {
            if (response) {
              this.snackbar.open('Account Update Successful', 'Close', {
                duration: 3000,
              });
              console.log('Account update successful');

              updateFn(result).subscribe({
                next: (updatedEntry) => {
                  const index = this.dataSource.data.findIndex(
                    (item) => item.id === updatedEntry.id
                  );
                  this.dataSource.data[index] = updatedEntry;
                  this.dataSource.data = [...this.dataSource.data];
                  this.applyFilter();
                  this.snackbar.open('Entry updated successfully', 'Close', {
                    duration: 3000,
                  });
                },
                error: (err) => {
                  console.error('Error updating entry', err);
                  this.snackbar.open('Error updating entry', 'Close', {
                    duration: 3000,
                  });
                },
              });
            } else {
              this.snackbar.open(
                'Insufficient balance or account not found',
                'Close',
                { duration: 3000 }
              );
            }
          },
          error: (err) => {
            this.snackbar.open('Something went wrong', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  deleteElement(element: Transection): void {
    Swal.fire({
      position: 'top',
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think',
    }).then((result) => {
      if (result.value) {
        Swal.fire('Removed!', 'Transaction removed successfully.', 'success');
        if (element.type === 'Income') {
          this.apiService.deleteIncome(element.id).subscribe({
            next: (response: Incomes) => {
              this.commonService
                .updateAccountBalance(
                  element.account,
                  'Income',
                  element.amount,
                  0,
                  this.accountType
                )
                .subscribe({
                  next: (response: PaymentType) => {
                    console.log(response);
                  },
                });
              const index = this.dataSource.data.indexOf(element);
              if (index > -1) {
                this.dataSource.data.splice(index, 1);
                this.dataSource.data = [...this.dataSource.data];
              }
            },
          });
        } else {
          this.apiService.deleteExpenses(element.id).subscribe({
            next: (response: Incomes) => {
              this.commonService
                .updateAccountBalance(
                  element.account,
                  'Expenses',
                  element.amount,
                  0,
                  this.accountType
                )
                .subscribe({
                  next: (response: PaymentType) => {
                    console.log(response);
                  },
                });
              const index = this.dataSource.data.indexOf(element);
              console.log(index);
              if (index > -1) {
                this.dataSource.data.splice(index, 1);
                this.dataSource.data = [...this.dataSource.data];
              }
            },
          });
        }
      }
    });
  }
  clearDateRange() {
    this.range.reset();
    this.applyFilter();
  }
}
