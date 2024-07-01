import { Component } from '@angular/core';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Registration, User } from '../../../../common/models/expenses.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading=false;
  showLinebar=false;
  constructor(private fb: FormBuilder,private apiService:ApiServiceService,private snackBar:MatSnackBar,private router:Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.isLoading=true

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.apiService.loginUser(email, password).subscribe({
        next: (register: Registration[]) => {
          const user = register.find(user => user.email === email && user.password === password);
          if (user) {
            const loggedInUser = new User(email,user.id,user.firstName,user.Lastname); 
            localStorage.setItem("user", JSON.stringify(loggedInUser));
            this.snackBar.open('Login Successful', 'Close', { duration: 3000 });
            this.isLoading=false;
            this.router.navigate(['/admin']); 
          } else {
            this.isLoading=false;
            this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.isLoading=false;
          console.error('Error during login', err);
          this.snackBar.open('Login failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
}
