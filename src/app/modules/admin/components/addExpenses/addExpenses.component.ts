import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Expense, PaymentType } from '../../../../common/models/expenses.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-addExpenses',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, AsyncPipe, CommonModule, FormsModule],
  templateUrl: './addExpenses.component.html',
  styleUrls: ['./addExpenses.component.css']
})
export class AddExpensesComponent implements OnInit {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  expenseForm: FormGroup;
  myControl = new FormControl('');
  options: string[];
  accounts: PaymentType[];
  filteredOptions: string[];

  constructor(private fb: FormBuilder, private apiService: ApiServiceService, private snackBar: MatSnackBar) {
    this.expenseForm = this.fb.group({
      date: [''],
      account: [''],
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

  //formArray For Category and amount to add multiple expenses
  expenses(): FormArray {
    return this.expenseForm.get('expenses') as FormArray;
  }
  //new expense add in form group
  newExpense(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
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
    //add first category and amount when page is render
    this.addExpense();

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

  }

  //when form array convert in the list of expenses interface 
  transformExpenseData(formData: any): Expense[] {
    return formData.expenses.map((expense: any, index: number) => ({
      date: new Date(formData.date).toISOString().split('T')[0],
      type: 'Banking',
      category: expense.category,
      amount: expense.amount.toString(),
      comment: formData.account
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
  onSubmit() {
    if (this.expenseForm.valid && this.validateBalance()) {
      const transformedData: Expense[] = this.transformExpenseData(this.expenseForm.value);

      const accountName=this.expenseForm.get("account").value;
      const account=this.accounts.find(acc=>acc.name  ==accountName);
      const totalAmount=this.expenseForm.get("totalAmount").value;

      account.balnce -=totalAmount;

      this.apiService.updateAccount(account).subscribe({
        next:(response:PaymentType)=>{
          this.snackBar.open("Balanced Updated SuccessFully","Close",{duration:3000})
       
      //interate the loop to insert the expenses details
      transformedData.forEach((expense) => {
        this.apiService.postExpenses(expense).subscribe({
          next: (response) => {
            console.log('Expense saved successfully:', response);
          },
          error: (err) => {
            console.error('Error saving expense:', err);
          }
        });
      });
      this.expenseForm.reset();
          this.expenseForm.setControl('expenses', this.fb.array([]));
          this.addExpense();
    }
  })
    }
    else {
      this.expenseForm.markAllAsTouched();
    }

  }
  //update the total
  updateTotalAmount() {
    const expensesArray = this.expenseForm.get('expenses') as FormArray;
    console.log(expensesArray.controls)
    const total = expensesArray.controls.reduce((acc, control) => acc + control.get('amount').value, 0);
    this.expenseForm.get('totalAmount').setValue(total);

  }
}
