import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Incomes, PaymentType } from '../../../../common/models/expenses.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,MaterialModule,AsyncPipe],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css'
})
export class IncomesComponent implements OnInit {
  incomeForm: FormGroup;
  accountTypes: string[] = [];
  paymentTypes: PaymentType[] = [];
  filteredOptions: string[] = [];
  @ViewChild('input') input: ElementRef<HTMLInputElement>;


  constructor(private fb: FormBuilder, private apiService: ApiServiceService,private snackbar:MatSnackBar) {
    this.incomeForm = this.fb.group({
      date: ['', Validators.required],
      accountType: ["", Validators.required],
      amount: ["", [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.apiService.getAccount().subscribe({
      next: (response: PaymentType[]) => {
        this.paymentTypes=response;
        this.accountTypes = response.map(data => data.name);
        this.filteredOptions = this.accountTypes; // Initialize with all options
      },
      error: err => {
        console.log(err);
      }
    });
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.accountTypes.filter(option => option.toLowerCase().includes(filterValue));
  }
 
  onSubmit(): void {
    if (this.incomeForm.valid) {
      const formValue = this.incomeForm.value;


      // Format the date before submitting
      const date = new Date(formValue.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      formValue.date = formattedDate;
  
      const selectedAccountType = formValue.accountType;
      const incomeAmount = formValue.amount;

      const paymentType=this.paymentTypes.find(pt=>pt.name==selectedAccountType);

      if(paymentType){
        paymentType.balnce += incomeAmount;
      }

      this.apiService.updateAccount(paymentType).subscribe({
        next:()=>{
          this.apiService.postIncomeDetails(this.incomeForm.value).subscribe({
            next:(response:Incomes)=>{  
              this.incomeForm.reset();
              this.snackbar.open("Income Details Are Update Succefully!","Close",{duration:3000})
            },
            error:err=>{
              this.snackbar.open("Error While The Updateing Incomes!","Close",{duration:3000})
              console.error('Error adding income:', err);
            }
          })
          
        },
        error:err=>{
          this.snackbar.open("Error While The Updateing The Income Data","Close",{duration:3000})
          console.log(err)
        }
      })
      console.log(this.incomeForm.value);
      
    }
  }
  isControlInvalid(controlName: string): boolean {
    const control = this.incomeForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}
