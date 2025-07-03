import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/button/button.component';
import { CartService } from '../../../../Services/cart.service';
import { Observable } from 'rxjs';
import { ProductCart } from '../../../../Models/productCart.model';

@Component({
  selector: 'app-cart-totals',
  templateUrl: './cart-totals.component.html',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
})
export class CartTotalsComponent {
  subtotal$!: Observable<number>;
  @Input() cartItems: ProductCart[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subtotal$ = this.cartService.cartSubtotal$;
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
