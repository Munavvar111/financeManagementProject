import { Component, ElementRef, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Category, Expense, PaymentType } from '../../../../common/models/expenses.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GenericDailogComponent } from '../../../../common/dailog/generic-dailog/generic-dailog.component';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { Subscription } from 'rxjs';
import { IncomesComponent } from '../incomes/incomes.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-addExpenses',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, AsyncPipe, CommonModule, FormsModule,IncomesComponent,NgxSkeletonLoaderModule],
  templateUrl: './addExpenses.component.html',
  styleUrls: ['./addExpenses.component.css']
})
export class AddExpensesComponent implements OnInit {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild('inputCategory') inputCategory: ElementRef<HTMLInputElement>;
  dataIsLoad:boolean=false;
  expenseForm: FormGroup;
  myControl = new FormControl('');
  options: string[];
  accounts: PaymentType[];
  filteredOptions: string[];
  filterCategoryOption: string[];
  categories:string[];

  constructor(private fb: FormBuilder,public dialog: MatDialog, private apiService: ApiServiceService, private snackBar: MatSnackBar,private router:Router,private commonService:CommonServiceService) {
    this.expenseForm = this.fb.group({
      date: ['',Validators.required],
      account: ['',Validators.required],
      expenses: this.fb.array([]),
      totalAmount: [{ value: 0, disabled: true }]
    });
    this.myControl = this.expenseForm.get('account') as FormControl;
  }
  //Filter For AutoComplete
  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter(o => o.toLowerCase().includes(filterValue));
  }
  filterCategory(inputElement: HTMLInputElement): void {
    const filterCategoryValue = inputElement.value.toLowerCase();
    console.log(filterCategoryValue);
    this.filterCategoryOption = this.categories.filter(o => o.toLowerCase().includes(filterCategoryValue));
  }

  //formArray For Category and amount to add multiple expenses
  expenses(): FormArray {
    return this.expenseForm.get('expenses') as FormArray;
  }
  //new expense add in form group
      newExpense(): FormGroup {
        return this.fb.group({
          category:['', Validators.required],
          amount: ['', Validators.required]
        });
      }
  //add formarray in the formarray 
  addExpense() {
    this.expenses().push(this.newExpense())
  }
  //remove the formarray
  removeExpense(i: number) {
    this.expenses().removeAt(i);
  }


  ngOnInit() {
    console.log("its again come")
    //add first category and amount when page is render
    this.addExpense();

    this.apiService.getCategories().subscribe({
      next:(response:Category[])=>{
        this.categories= response[1].subcategories.map(item=>item.name)
        console.log(this.categories)

      }
    })

    this.apiService.getAccount().subscribe({
      next: (data: PaymentType[]) => {
        console.log(data)
        this.accounts = data
        this.options = data.map(paymentType => paymentType.name);
      },
      error: err => {
        console.log(err)
      }
    })
    //update total amount 
    this.expenseForm.get("expenses").valueChanges.subscribe(() => {
      this.updateTotalAmount();
    })
    setTimeout(() => {
      this.dataIsLoad = true
    }, 3000);
  }

  //when form array convert in the list of expenses interface 
  transformExpenseData(formData: any): Expense[] {
    const formattedDate = this.commonService.formatedDate(formData.date);

    return formData.expenses.map((expense: any, index: number) => ({
      type: "expense",
      date: formattedDate,
      account : formData.account,
      category: expense.category,
      amount: expense.amount,
    }));
  }
  

  validateBalance(): boolean {
    const accountName = this.expenseForm.get('account').value;
    const account = this.accounts.find(acc => acc.name == accountName);
    if (!account) {
      this.snackBar.open("Invalid account selected", 'Close', { duration: 3000 })
      return false;
    }
    const totalAmount = this.expenseForm.get('totalAmount').value;
    if (totalAmount > account.balnce) {
      this.snackBar.open("Insufficient balance", "Close", { duration: 3000 })
      return false;
    } 
    return true;
  }
  onSubmit(): void {
    if (this.expenseForm.valid && this.validateBalance()) {
      const transformedData: Expense[] = this.transformExpenseData(this.expenseForm.value);
      const accountName = this.expenseForm.get('account').value;
      const totalAmount = this.expenseForm.get('totalAmount').value;

      this.commonService.handleExpenses(accountName, totalAmount, this.accounts, transformedData);
      this.expenseForm.setControl('expenses', this.fb.array([]));
      this.addExpense();
      this.expenseForm.get('expenses').valueChanges.subscribe(() => {
        this.updateTotalAmount();
      });
      this.expenseForm.reset();
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.get(key);
        control?.setErrors(null);
        control?.markAsPristine();
        control?.markAsUntouched();
      });
    } else {
      this.expenseForm.markAllAsTouched();
      this.snackBar.open('Please fill out the form correctly', 'Close', { duration: 3000 });
    }
  }
  onCancel(){
    this.expenseForm.reset()
  }
  //update the total
  updateTotalAmount() {
    const expensesArray = this.expenseForm.get('expenses') as FormArray;
    console.log(expensesArray.controls)
    const total = expensesArray.controls.reduce((acc, control) => acc + control.get('amount').value, 0);
    this.expenseForm.get('totalAmount').setValue(total);
  }
  isControlInvalid(controlName: string): boolean {
    const control = this.expenseForm.get(controlName);
    return control ? control.invalid && control.dirty : false;
  }
}
