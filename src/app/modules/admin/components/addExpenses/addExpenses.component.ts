import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { Observable } from 'rxjs';
import { async } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-addExpenses',
  standalone:true,
  imports:[ReactiveFormsModule,MaterialModule,AsyncPipe,CommonModule],
  templateUrl: './addExpenses.component.html',
  styleUrls: ['./addExpenses.component.css']
})
export class AddExpensesComponent implements OnInit {

  expenseForm: FormGroup;
  myControl = new FormControl('');
options: string[] = ['One', 'Two', 'Three'];
filteredOptions: Observable<string[]>;

constructor(private fb: FormBuilder) {
  this.expenseForm = this.fb.group({
    date: [''],
    account: [''],
    expenses: this.fb.array([]),
    totalAmount: [{value: 0, disabled: true}]
  });
  this.myControl = this.expenseForm.get('account') as FormControl;
}


expenses():FormArray{
  return this.expenseForm.get('expenses') as FormArray;
}

newExpense():FormGroup{
  return this.fb.group({
    category:['',Validators.required],
    amount:['',Validators.required]
  });
}
addExpense(){
  this.expenses().push(this.newExpense())
}

removeExpense(i: number) {
    this.expenses().removeAt(i);
   }
   

ngOnInit() {
 
  this.addExpense();
  this.expenseForm.get("expenses").valueChanges.subscribe(()=>{
    this.updateTotalAmount();
  })
 
}

onSubmit() {
  const formattedData = {
    date: new Date(this.expenseForm.get('date').value).toISOString(),
    account: this.expenseForm.get('account').value,
    expenses: this.expenseForm.get('expenses').value.map((expense: any) => ({
      category: expense.category,
      amount: Number(expense.amount)
    }))
  };

   }
updateTotalAmount() {
  const expensesArray = this.expenseForm.get('expenses') as FormArray;
  console.log(expensesArray.controls)
  const total = expensesArray.controls.reduce((acc, control) => acc + control.get('amount').value, 0);
  this.expenseForm.get('totalAmount').setValue(total);
}
}
