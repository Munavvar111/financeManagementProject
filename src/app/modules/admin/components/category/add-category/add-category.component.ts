import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Category } from '../../../../../common/models/expenses.model';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.css'
})
export class AddCategoryComponent {
  
  constructor(
    public dialogRef: MatDialogRef<AddCategoryComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { form: FormGroup, isEdit: boolean ,categories:Category[]}
  ){}
}
