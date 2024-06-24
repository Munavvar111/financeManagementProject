import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../matrial/matrial.module';
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
 

}
