import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../root/header/header.component';
import { ProductNavigationComponent } from '../products-components/product-navigation/product-navigation.component';
import { ThumbnailComponent } from '../products-components/thumbnail/thumbnail.component';
import { ProductDescriptionComponent } from '../products-components/product-description/product-description.component';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../shared/button/button.component';
import { ProductItemComponent } from '../shared/product-item/product-item.component';
import { product } from '../../Models/product.model';

@Component({
  selector: 'app-product',
  imports: [
    ButtonComponent,
    ProductNavigationComponent,
    ThumbnailComponent,
    ProductDescriptionComponent,
    ProductItemComponent,
  ],
  templateUrl: './product.component.html',
})
export class ProductComponent {
  productId: number | null = null;
  @Input() product: any;

  count: number = 1;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? Number(idParam) : null;
  }
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  increase() {
    this.count++;
  }
  decrease() {
    this.count--;
  }
}
