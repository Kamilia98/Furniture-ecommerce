import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/button/button.component';
import { CartService } from '../../../../Services/cart.service';

@Component({
  selector: 'app-cart-totals',
  templateUrl: './cart-totals.component.html',
  styleUrls: ['./cart-totals.component.css'],
  standalone: true,
  imports: [CommonModule, ButtonComponent, CurrencyPipe],
})
export class CartTotalsComponent {
  constructor(private router: Router, private cartService: CartService) {
    // console.log('CartService>>>>>>', this.cartService);
  }

  @Input() subtotal: number = 0;

  goToCheckout() {
    this.cartService.setCheckoutData();
    this.router.navigate(['/checkout']);
  }
}
