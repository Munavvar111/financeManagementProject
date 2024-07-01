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

  constructor(private fb: FormBuilder,private apiService:ApiServiceService,private snackBar:MatSnackBar,private router:Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.apiService.loginUser(email, password).subscribe({
        next: (register: Registration[]) => {
          const user = register.find(user => user.email === email && user.password === password);
          if (user) {
            const loggedInUser = new User(email,user.id); // Assuming User constructor takes email and password
            localStorage.setItem("user", JSON.stringify(loggedInUser));
            this.snackBar.open('Login Successful', 'Close', { duration: 3000 });
            this.router.navigate(['/admin']); // Redirect to a dashboard or home page
          } else {
            this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Error during login', err);
          this.snackBar.open('Login failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
}
