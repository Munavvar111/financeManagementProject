import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldConfig } from '../../models/expenses.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../matrial/matrial.module';
import { MatDatepicker, MatDatepickerControl, MatDatepickerPanel } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-generic-dailog',
  standalone: true,
  imports: [CommonModule,MaterialModule,ReactiveFormsModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './generic-dailog.component.html',
  styleUrl: './generic-dailog.component.css'
})
export class GenericDailogComponent {
  title: string;
  fields: FieldConfig[] = [];
  form: FormGroup;
  filteredOptions: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GenericDailogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.title = this.data.title;
    this.fields = this.data.fields;
    console.log(this.fields)
    const formControls = this.fields.reduce((acc, field) => {
      acc[field.name] = [
        this.data.element ? this.data.element[field.name] : '',
        field.type !== 'autocomplete' ? Validators.required : null
      ];
      return acc;
    }, {});
    console.log(formControls)
    this.form = this.fb.group(formControls);

    this.fields.forEach(field => {
      if (field.type === 'autocomplete') {
        this.filteredOptions[field.name] = [];
        this.form.get(field.name).valueChanges.subscribe(value => {
          this.filteredOptions[field.name] = this._filter(value, field.options);
        });
      }
    });
  }

  private _filter(value: string, options: { value: string, label: string }[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.label.toLowerCase().includes(filterValue)).map(option => option.label);
  }

  filterOptions(field: FieldConfig): void {
    const value = this.form.get(field.name).value || '';
    this.filteredOptions[field.name] = this._filter(value, field.options);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

}
