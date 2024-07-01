import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Expense, Incomes, PaymentType, Subcategory, Transection } from '../../../../common/models/expenses.model';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { MatDialog } from '@angular/material/dialog';
import { DetailDailogComponent } from '../transaction/detail-dailog/detail-dailog.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-show-transaction',
  standalone: true,
  imports: [MaterialModule,CommonModule,ReactiveFormsModule,NgxSkeletonLoaderModule],
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
  subCategory:Subcategory[]
  totalItems = 0;
  dataIsLoad:boolean=false;
  accountType:PaymentType[];
  userId:string;
  private subscriptions: Subscription[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private apiService: ApiServiceService, private fb: FormBuilder,private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private router:Router,
    private commonService: CommonServiceService,
    private snackbar: MatSnackBar) {
    this.filterForm = this.fb.group({
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      }),
      searchQuery: ['']
    });
  }

  
  ngOnInit(): void {
    const userString = localStorage.getItem('user');
if (userString) {
  const user = JSON.parse(userString);
  this.userId = user.id;
}
    this.accountData();
    this.getSubcategory()
    setTimeout(() => {
      
      this.fetchData();
    }, 1000);
    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
   
  }
 
accountData(){
  const accountSub = this.apiService.getAccount(this.userId).subscribe({
    next: (response: PaymentType[]) => {
      this.accountType = response;
    },
    error: (err) => {
      this.snackbar.open('Something Went Wrong', 'Close', { duration: 3000 });
    },
  });

  this.subscriptions.push(accountSub);

}
getSubcategory(){
  this.apiService.getSubCategories().subscribe({
    next: (response: Subcategory[]) => {
      this.subCategory = response;
      console.log(this.subCategory,"good")
      if(this.subCategory==null){
        this.snackbar.open("Please try again after some time due to api load","Close",{duration:3000})
        setTimeout(() => {
          this.router.navigate(['/transactionData'])
        }, 3000);
      }
    },
    error: (err) => {
      this.snackbar.open('Something Went To Wrong!', 'Close', { duration: 3000 });
    }
  });
}
  fetchData() {
   
  
     this.apiService.getExpenses(this.userId).subscribe({
      next: (expenses: Expense[]) => {
        const incomeSub = this.apiService.getIncomeDetails(this.userId).subscribe({
          next: (income: Incomes[]) => {
            const combinedData = [
              ...expenses.map(expense => {
                console.log(expenses)
                console.log(this.subCategory)
                    
                  const subCategoryItem = this.subCategory.find(item => item.id === expense.category);
                  const account = this.accountType.find(item => item.id == expense.account).name;
                  const category = subCategoryItem ? subCategoryItem.name : 'other';
                  return {
                    id: expense.id,
                    date: expense.date,
                    account: account,
                    type: 'Expense',
                    category: category,
                    amount: expense.amount,
                  };
              }),
              ...income.map(incomeItem => {
                const subCategoryItem = this.subCategory.find(item => item.id === incomeItem.category);
                const account = this.accountType.find(item => item.id == incomeItem.account).name;
                const category = subCategoryItem ? subCategoryItem.name : 'other';
                return {
                  id: incomeItem.id,
                  date: incomeItem.date,
                  account: account,
                  type: 'Income',
                  category: category,
                  amount: incomeItem.amount,
                };
              })
              
            ];
            
            setTimeout(() => {
              this.dataIsLoad=true;
            }, 2000);
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
        result.category=this.subCategory.find(item=>item.name==result.category).id;
        result.account=this.accountType.find(item=>item.name==result.account).id;
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
              result.account  ,
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
                  this.fetchData()
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
                  this.accountType.find(item=>item.name==element.account).id,
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
                const index = this.transactionData.findIndex(
                  (item) => item.id === element.id
                );             
                console.log(index)
                if (index > -1) {
                this.transactionData.splice(index, 1);
                this.transactionData = [...this.transactionData];
                this.applyFilter()
              }
            },
          });
        } else {
          this.apiService.deleteExpenses(element.id).subscribe({
            next: (response: Expense) => {
              this.commonService
                .updateAccountBalance(
                  this.accountType.find(item=>item.name==element.account).id,
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
                const index = this.transactionData.findIndex(
                  (item) => item.id === element.id
                );             
                console.log(index)
                if (index > -1) {
                this.transactionData.splice(index, 1);
                this.transactionData = [...this.transactionData];
                this.applyFilter()
              }
            },
          });
        }
      }
    });
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
