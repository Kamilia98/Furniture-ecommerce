import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { User } from '../../../Models/user.model';
import { UserService } from '../../../Services/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-setting',
  imports: [ButtonComponent, CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './setting.component.html',
  host: {
    class: 'flex-1',
  },
})
export class SettingComponent {
  user = {
    thumbnail:
      'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png',
  };
  imagePreview: string | ArrayBuffer | null = null;
  user$!: Observable<User | null>;
  isChecked: boolean = false;
  activeComponent: string = 'orders';
  errorMessage: string = '';
  staticMessages: string = 'New password must be different from the old one';
  changePasswordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.minLength(8)]),
    },
    { validators: this.passwordMatchValidator() },
  );

  constructor(private userService: UserService) {}
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  ngOnInit(): void {
    this.user$ = this.userService.getUser();
  }
  toggleCheck() {
    this.isChecked = !this.isChecked;
  }
  update(event: Event) {
    event?.preventDefault();
    console.log(this.changePasswordForm);
    if (
      this.changePasswordForm.touched &&
      this.changePasswordForm.valid &&
      this.changePasswordForm.controls.password.value
    ) {
      console.log('Form is valid and touched');
      this.userService
        .changePassword(this.changePasswordForm.controls.password.value)
        .subscribe({
          next: () => {
            console.log('Password updated successfully');
            this.errorMessage = 'Password updated successfully';
            setTimeout(() => {
              this.errorMessage = '';
            }, 1000);
            this.changePasswordForm.reset();
          },
          error: (err) => {
            if (
              err.error.error ==
              'New password must be different from the old one'
            ) {
              this.errorMessage = err.error.error;
            }
            console.log(err.error.error);
            console.error('Error updating password:', err.error);
          },
        });
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.userService
        .updateUserImageLocally(file)
        .subscribe((imageUrl: string) => {
          this.user.thumbnail = imageUrl;
          this.userService.getUser().subscribe((updatedUser) => {
            this.user = updatedUser;
          });
        });
    }
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/images/user.png';
  }
}
