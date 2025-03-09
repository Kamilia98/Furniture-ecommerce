import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../shared/input/input.component';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button.component';
import { AuthService } from '../../../Services/auth.service';
import { jwtDecode } from 'jwt-decode';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputComponent, RouterModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    trigger('slideUpDown', [
      state('in', style({ height: '*', opacity: 1 })),
      state('out', style({ height: '0', opacity: 0 })),
      transition('in <=> out', animate('200ms ease-in-out')),
    ]),
  ],
})
export class LoginComponent {
  errorMessage: string = '';
  form = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
    ]),
    agree: new FormControl(false, [Validators.requiredTrue]),
  });
  constructor(private authService: AuthService, private router: Router) {}
  onSubmit() {
    this.form.controls.email.markAsTouched();
    this.form.controls.password.markAsTouched();
    this.form.controls.agree.markAsTouched();
    if (this.form.valid) {
      this.authService.login(this.form.value).subscribe({
        next: (res) => {
          this.form.reset();
          localStorage.setItem('token', res.data.token);
          const decoded: any = jwtDecode(res.data.token);
          localStorage.setItem('role', decoded.role);
          if (decoded.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.errorMessage = err.error.error;
        },
      });
    } else {
      console.error('Form invalid');
    }
  }
}
