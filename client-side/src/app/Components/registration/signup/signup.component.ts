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
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, RouterModule],
  templateUrl: './signup.component.html',
  animations: [
    trigger('slideUpDown', [
      state('in', style({ height: '*', opacity: 1 })),
      state('out', style({ height: '0', opacity: 0 })),
      transition('in <=> out', animate('200ms ease-in-out')),
    ]),
  ],
})
export class SignupComponent {
  errorMessage: string = '';
  form = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    username: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z]*$'),
    ]),
    phone: new FormControl(null, [
      Validators.required,
      Validators.minLength(11),
      Validators.pattern('^[0-9]*$'),
    ]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
    ]),
    agree: new FormControl(false, [Validators.requiredTrue]),
  });
  constructor(private authService: AuthService, private router: Router) {}
  onSubmit() {
    this.form.controls.email.markAsTouched();
    this.form.controls.username.markAsTouched();
    this.form.controls.password.markAsTouched();
    this.form.controls.agree.markAsTouched();

    if (this.form.valid) {
      this.authService.signup(this.form.value).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/register/login']);
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
