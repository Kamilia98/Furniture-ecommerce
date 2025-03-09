import { Component } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../shared/input/input.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  token = '';
  message = '';
  resetForm: FormGroup;
  get passwordControl(): FormControl {
    return this.resetForm.get('password') as FormControl;
  }
  get confirmPasswordControl(): FormControl {
    return this.resetForm.get('confirmPassword') as FormControl;
  }

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.token = this.route.snapshot.queryParams['token'];
    this.resetForm = this.fb.group(
      {
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatch }
    );
  }
  passwordMatch(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password === confirmPassword) {
      return null;
    } else {
      return { passwordMatch: true };
    }
  }
  resetPassword() {
    this.resetForm.controls['password'].markAsTouched();
    this.resetForm.controls['confirmPassword'].markAsTouched();

    if (this.resetForm.valid) {
      this.authService
        .resetPassword(this.resetForm.controls['password'].value!, this.token)
        .subscribe({
          next: (res) => {
            this.message = 'Password reset successfully';
            this.resetForm.reset();
            this.router.navigate(['/register/login']);
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
