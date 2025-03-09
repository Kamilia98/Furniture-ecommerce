import { Component, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../search/search.component';
import { UserActionsComponent } from '../../user-actions/user-actions.component';
import { NavigationComponent } from '../../navigation/navigation.component';
import { ProductService } from '../../../Services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    SearchComponent,
    UserActionsComponent,
    NavigationComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isActive = false;
  productsNames: { id: number; value: string }[];

  constructor(
    private productService: ProductService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.productsNames = this.productService.getProductNames();
  }

  toggleMenu() {
    this.isActive = !this.isActive;
  }

  goToProduct(id: number) {
    this.router.navigate([`/product/${id}`]);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isActive &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isActive = false;
    }
  }
}
