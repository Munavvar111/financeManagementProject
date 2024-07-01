import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { PaymentType } from '../../../../common/models/expenses.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddAccountsComponent } from './add-accounts/add-accounts.component';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [MaterialModule, CommonModule, AsyncPipe,NgxSkeletonLoaderModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent implements OnInit {
  accounts: PaymentType[] = [];
  accountForm: FormGroup;
  editForm: FormGroup;
  dataIsLoad:boolean=false;
  editIndex: number | null = null;
  userId:string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.accountForm = this.fb.group({
      accountName: ['', Validators.required],
      accountBalance: ['', Validators.required],
    });
    this.editForm = this.fb.group({
      accountName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.id;
    }
    this.loadAccounts();
    setTimeout(() => {
      this.dataIsLoad = true
    }, 3000);
  }

  loadAccounts(): void {
    this.apiService.getAccount(this.userId).subscribe((accounts) => {
      this.accounts = accounts;
    });
  }

  openDialog(): void {
    this.dialog
      .open(AddAccountsComponent, {
        width: '300px',
        data: {
          form: this.accountForm,
          isEdit: false,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.onSubmit();
        }
      });
  }

  openEditDialog(index: number): void {
    this.editIndex = index;
    this.editForm.setValue({
      accountName: this.accounts[index].name,
    });
    this.dialog
      .open(AddAccountsComponent, {
        width: '300px',
        data: {
          form: this.editForm,
          isEdit: true,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.onEditSubmit();
        }
      });
  }

  isControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const newAccount: PaymentType = {
        name: this.accountForm.value.accountName,
        balnce: parseFloat(this.accountForm.value.accountBalance),
        userId:this.userId
      };

      if (this.accounts.some((account) => account.name === newAccount.name)) {
        this.snackBar.open('Account name already exists', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.apiService.postAccount(newAccount).subscribe({
        next: (response: PaymentType) => {
          console.log('Account added successfully', response);
          this.accounts.push(response);
          this.snackBar.open('Account added successfully', 'Close', {
            duration: 3000,
          });
          this.accountForm.reset();
        },
        error: (err) => {
          console.error('Error adding account', err);
          this.snackBar.open('Error adding account', 'Close', {
            duration: 3000,
          });
        },
      });
    } else {
      this.accountForm.markAllAsTouched();
    }
  }

  onEditSubmit(): void {
    if (this.editForm.valid && this.editIndex !== null) {
      const updatedName = this.editForm.value.accountName;

      if (
        this.accounts.some(
          (account, i) => account.name === updatedName && i !== this.editIndex
        )
      ) {
        this.snackBar.open('Account name already exists', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.accounts[this.editIndex].name = updatedName;
      this.apiService.updateAccount(this.accounts[this.editIndex]).subscribe({
        next: (response: PaymentType) => {
          console.log('Account updated successfully', response);
          this.snackBar.open('Account updated successfully', 'Close', {
            duration: 3000,
          });
          this.editForm.reset();
          this.editIndex = null;
        },
        error: (err) => {
          console.error('Error updating account', err);
          this.snackBar.open('Error updating account', 'Close', {
            duration: 3000,
          });
        },
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }
}
