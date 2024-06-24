import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { ApiServiceService } from '../../../../../common/services/apiService.service';
import { Category, PaymentType } from '../../../../../common/models/expenses.model';

@Component({
  selector: 'app-add-detail-dailog',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-detail-dailog.component.html',
  styleUrl: './add-detail-dailog.component.css'
})
export class AddDetailDailogComponent {
  @ViewChild('accountInput') accountInput: ElementRef<HTMLInputElement>;
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;

  form: FormGroup;
  accountOptions: string[] = [];
  incomeCategories: string[] = [];
  expenseCategories: string[] = [];
  filteredAccounts: string[] = [];
  filteredCategories: string[] = [];
  category: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDetailDailogComponent>,
    private apiService: ApiServiceService,
    @Inject(MAT_DIALOG_DATA) public data: { date: string }
  ) {
    this.form = this.fb.group({
      type: ['', Validators.required],
      date: [data.date, Validators.required],
      account: ['', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.filteredAccounts = this.accountOptions;
    this.filteredCategories = [];
  }

  ngOnInit(): void {
    // Load accounts
    this.apiService.getAccount().subscribe({
      next: (response: PaymentType[]) => {
        this.accountOptions = response.map(item => item.name);
        this.filteredAccounts = this.accountOptions;
      }
    });

    // Load categories
    this.apiService.getCategories().subscribe({
      next: (response: Category[]) => {
        console.log(response)
        this.incomeCategories = response.filter(item => item.type === 'income')
          .flatMap(item => item.subcategories.map(sub => sub.name));
        this.expenseCategories = response.filter(item => item.type === 'expense')
          .flatMap(item => item.subcategories.map(sub => sub.name));
      }
    });

    this.form.get('type').valueChanges.subscribe(type => {
      if (type === 'income') {
        this.form.get('category').reset(); 
        this.category = this.incomeCategories;
      } else if (type === 'expense') {
        this.category = this.expenseCategories;
        this.form.get('category').reset(); 
      }
    });
  }

  filterAccounts(): void {
    const filterValue = this.accountInput.nativeElement.value.toLowerCase();
    this.filteredAccounts = this.accountOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  filterCategories(): void {
    const filterValue = this.categoryInput.nativeElement.value.toLowerCase();
    this.filteredCategories = this.category.filter(option => option.toLowerCase().includes(filterValue));
    console.log(filterValue)
    console.log(this.filteredCategories)
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value)
      this.dialogRef.close(this.form.value);

    }
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }
}
