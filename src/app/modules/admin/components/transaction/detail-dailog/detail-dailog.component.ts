import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiServiceService } from '../../../../../common/services/apiService.service';
import { Category, PaymentType } from '../../../../../common/models/expenses.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-dailog',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,CommonModule],
  templateUrl: './detail-dailog.component.html',
  styleUrl: './detail-dailog.component.css'
})
export class DetailDailogComponent {
  @ViewChild('accountInput') accountInput: ElementRef<HTMLInputElement>;
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;

  form: FormGroup;
  title: string;
  accountOptions: string[] = [];
  incomeCategories: string[] = [];
  expenseCategories: string[] = [];
  filteredAccounts: string[] = [];
  filteredCategories: string[] = [];
  userId:string;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DetailDailogComponent>,
    private apiService: ApiServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.form = this.fb.group({
      type: [{ value: data.type, disabled: true }, Validators.required],
      date: [data.date, Validators.required],
      account: [data.account, Validators.required],
      category: [data.category, Validators.required],
      amount: [data.amount, [Validators.required, Validators.min(0.01)]]
    });

    this.filteredAccounts = this.accountOptions;
    this.filteredCategories = data.type === 'Income' ? this.incomeCategories : this.expenseCategories;
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.id;
    }
    this.apiService.getAccount(this.userId).subscribe({
      next: (response: PaymentType[]) => {
        this.accountOptions = response.map(item => item.name);
        this.filteredAccounts = this.accountOptions;
      }
    });

    this.apiService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.incomeCategories = response.filter(item => item.type === 'income')
          .flatMap(item => item.subcategories.map(sub => sub.name));
        this.expenseCategories = response.filter(item => item.type === 'expense')
          .flatMap(item => item.subcategories.map(sub => sub.name));
        
        // Set filtered categories based on initial type
        this.filteredCategories = this.data.type === 'Income' ? this.incomeCategories : this.expenseCategories;
      }
    });
  }

  filterAccounts(): void {
    const filterValue = this.accountInput.nativeElement.value.toLowerCase();
    this.filteredAccounts = this.accountOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  filterCategories(): void {
    const filterValue = this.categoryInput.nativeElement.value.toLowerCase();
    const type = this.form.get('type').value;
    this.filteredCategories = (type === 'Income' ? this.incomeCategories : this.expenseCategories)
      .filter(option => option.toLowerCase().includes(filterValue));
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.form.get('type').enable();
      console.log(this.form.value)
      this.dialogRef.close(this.form.value);
      this.form.get('type').disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
