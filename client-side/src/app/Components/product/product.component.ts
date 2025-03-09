import { Component } from '@angular/core';
import { HeaderComponent } from '../root/header/header.component';
import { ProductNavigationComponent } from '../products-components/product-navigation/product-navigation.component';
import { ThumbnailComponent } from '../products-components/thumbnail/thumbnail.component';
import { ProductDescriptionComponent } from '../products-components/product-description/product-description.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [
    ProductNavigationComponent,
    ThumbnailComponent,
    ProductDescriptionComponent,
  ],
  templateUrl: './product.component.html',
})
export class ProductComponent {
  productId: number | null = null;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? Number(idParam) : null;
  }
}
