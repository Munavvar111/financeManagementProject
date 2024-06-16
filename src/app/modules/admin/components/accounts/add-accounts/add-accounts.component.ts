import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-accounts',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,CommonModule,],
  templateUrl: './add-accounts.component.html',
  styleUrl: './add-accounts.component.css'
})
export class AddAccountsComponent {
  constructor(
    public dialogRef: MatDialogRef<AddAccountsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup, isEdit: boolean }
  ) { } 

  onCancel(): void {
    this.dialogRef.close();
  }
}
