import { Component } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../shared/input/input.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  message = '';
  forgotForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });
  constructor(private authService: AuthService) {}
  forgotPassword() {
    this.forgotForm.controls.email.markAsTouched();
    console.log(this.forgotForm.controls.email.value);
    if (this.forgotForm.valid) {
      this.authService
        .forgotPassword(this.forgotForm.controls.email.value!)
        .subscribe({
          next: (res) => {
            this.message = 'Check your email for a password reset link';
            this.forgotForm.reset();
          },
          error: (err) => {
            this.message = 'Error: ' + err.error.message;
          },
        });
    } else {
      console.log('Form invalid');
    }
  }
}
