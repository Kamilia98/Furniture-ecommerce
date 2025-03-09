import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../shared/button/button.component';
import { CartService } from '../../Services/cart.service';
import { CurrencyPipe } from '@angular/common';

export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const hasNumber = /\d/.test(control.value);
    return hasNumber ? { hasNumber: { value: control.value } } : null;
  };
}

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderBannerComponent,
    FeatureBannerComponent,
    ButtonComponent,
    CurrencyPipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  checkoutForm: FormGroup;
  selectedPayment: string = 'bank';
  cartItems: any[] = [];
  subtotal: number = 0;

  constructor(private fb: FormBuilder, private cartService: CartService) {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, noNumbersValidator()]],
      lastName: ['', [Validators.required]],
      companyName: [''],
      country: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      email: ['', [Validators.required, Validators.email]],
      additionalInfo: [''],
    });

    this.cartItems = this.cartService.getCheckoutData();
    this.subtotal = this.cartService.getSubtotal();
    // console.log('Cart Items>>>>>>>>>>', this.cartItems);
  }

  onSubmit() {
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.valid) {
      console.log('Form Submitted', this.checkoutForm.value);
      console.log('Cart Items:', this.cartItems);
      console.log('Subtotal:', this.subtotal);
      console.log('Payment Method:', this.selectedPayment);
    } else {
      console.log('Form is invalid');
    }
  }
}
