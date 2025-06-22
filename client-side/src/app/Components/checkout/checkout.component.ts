import { Component, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { ModalService } from '../../Services/modal.service';
import { LoginPromptModalComponent } from '../modals/login-prompt-modal/login-prompt-modal.component';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { PaymentComponent } from '../payment/payment.component';
import { ButtonComponent } from '../shared/button/button.component';
import { StepperComponent } from '../shared/stepper/stepper.component';
import { InputComponent } from '../shared/input/input.component';
import { NgToastService } from 'ng-angular-popup';
import { CartService } from '../../Services/cart.service';
import { CheckoutService } from '../../Services/checkout.service';
import { first, Subject, takeUntil } from 'rxjs';
import {
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ReactiveFormsModule,
  FormsModule,
  FormControl,
} from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  CheckoutData,
  OrderItem,
  ShippingAddress,
} from '../../Models/checkout.model';

// Custom Validator: No Numbers
export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    return /\d/.test(control.value)
      ? { hasNumber: { value: control.value } }
      : null;
  };
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderBannerComponent,
    FeatureBannerComponent,
    PaymentComponent,
    ButtonComponent,
    StepperComponent,
    InputComponent,
  ],
  templateUrl: './checkout.component.html',
  animations: [
    trigger('slideUpDown', [
      state('in', style({ height: '*', opacity: 1 })),
      state('out', style({ height: '0', opacity: 0 })),
      transition('in <=> out', animate('400ms ease-in-out')),
    ]),
  ],
})
export class CheckoutComponent implements OnDestroy {
  checkoutForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, noNumbersValidator()]),
    lastName: new FormControl('', [Validators.required, noNumbersValidator()]),
    companyName: new FormControl(''),
    country: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    city: new FormControl('', [Validators.required, noNumbersValidator()]),
    zip: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+$/),
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    additionalInfo: new FormControl(''),
    paymentMethod: new FormControl('', Validators.required),
  });

  selectedPayment: string = '';
  cartItems: any[] = [];
  subtotal!: number;
  isLoading = false;
  @ViewChild(PaymentComponent) paymentComponent!: PaymentComponent;
  private destroy$ = new Subject<void>();

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private authService: AuthService,
    private modalService: ModalService,
    private toast: NgToastService,
    private router: Router,
  ) {
    this.loadCartData();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load cart data on component initialization */
  private loadCartData(): void {
    this.cartService.cart$.subscribe((cartItems) => {
      this.cartItems = cartItems;
    });
    this.cartService.cartSubtotal$.subscribe((subtotal) => {
      this.subtotal = subtotal;
    });
  }

  /** Handle form submission */
  onSubmit(): void {
    this.authService.isLoggedIn$.pipe(first()).subscribe((isLoggedIn) => {
      if (!isLoggedIn) {
        this.modalService.show(LoginPromptModalComponent);
        return;
      }
      if (this.checkoutForm.invalid) {
        this.checkoutForm.markAllAsTouched();
        return;
      }

      const billingValues = this.checkoutForm.value;

      const billingValidation =
        this.checkoutService.validateCheckoutForm(billingValues);
      const errors: string[] = [...billingValidation.errors];
      if (errors.length > 0) {
        console.error('Validation failed:', errors);
        this.checkoutForm.markAllAsTouched();
        return;
      }

      if (billingValues.paymentMethod === 'bank') {
        try {
          const paymentSuccess = this.paymentComponent.validatePaymentForm();
          if (!paymentSuccess) {
            this.toast.danger(
              'Payment failed. Please check your card details.',
            );
            return;
          }
          this.processOrder(billingValues);
        } catch (error) {
          console.error('Payment error:', error);
          this.toast.danger('Payment processing failed. Please try again.');
          return;
        }
      } else {
        // For non-bank payments, proceed directly
        this.processOrder(billingValues);
      }
    });
  }

  /** Process the order after successful validation */
  private processOrder(billingValues: any): void {
    this.isLoading = true;
    this.selectedPayment = billingValues.paymentMethod;

    const shippingAddress: ShippingAddress = {
      firstName: billingValues.firstName,
      lastName: billingValues.lastName,
      companyName: billingValues.companyName,
      country: billingValues.country,
      address: billingValues.address,
      city: billingValues.city,
      zipCode: billingValues.zip,
      phone: billingValues.phone,
      email: billingValues.email,
      additionalInfo: billingValues.additionalInfo,
      // province: billingValues.city,
    };

    console.log('cartItems>>>>>>>>>>', this.cartItems);

    const orderItems: OrderItem[] = this.cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));
    const checkoutData: CheckoutData = {
      shippingAddress,
      paymentMethod: billingValues.paymentMethod,
      orderItems,
    };
    console.log('checkoutData>>>>>>>>>', checkoutData);
    if (billingValues.paymentMethod === 'bank') {
      this.cartService.cartSubtotal$.pipe(first()).subscribe((totalAmount) => {
        this.checkoutService
          .createPaymentIntent(totalAmount)
          .subscribe((paymentIntentResponse) => {
            // console.log('paymentIntentResponse>>>>>>>:', paymentIntentResponse);
            this.checkoutService.clientSecret =
              paymentIntentResponse.data.clientSecret;
            console.log(
              'Client Secret in checkout:',
              this.checkoutService.clientSecret,
            );

            this.checkoutService.paymentCompleted
              .pipe(takeUntil(this.destroy$))
              .subscribe((paymentSuccess) => {
                if (paymentSuccess) {
                  checkoutData.transactionId =
                    this.checkoutService.paymentIntentId;
                  this.sendOrder(checkoutData);
                } else {
                  this.isLoading = false;
                  this.toast.danger('Payment failed. Please try again.');
                }
              });
            this.paymentComponent.validatePaymentForm();
          });
      });
    } else {
      this.sendOrder(checkoutData);
    }
  }
  private sendOrder(checkoutData: CheckoutData) {
    this.checkoutService.placeOrder(checkoutData).subscribe({
      next: () => {
        this.toast.success('Order placed successfully!');
        this.checkoutForm.reset();
        this.selectedPayment = '';
        this.cartItems = [];
        this.cartService.clearCart();
        // this.checkoutService.checkoutSubject.next([]);
        this.isLoading = false;
        this.paymentComponent?.resetCardElement();
        this.router.navigate(['/order-success']);
      },
      error: (error) => {
        console.error('Order placement failed:', error);
        this.isLoading = false;
      },
    });
  }
}
