import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from 'swiper/modules';

import { CommonModule, UpperCasePipe } from '@angular/common';

import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { ButtonComponent } from '../shared/button/button.component';
import { ProductItemComponent } from '../shared/product-item/product-item.component';
import { product } from '../../Models/product.model';
@Component({
  selector: 'app-home',
  imports: [
    ButtonComponent,
    UpperCasePipe,
    ProductItemComponent,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  constructor(private router: Router, private productService: ProductService) {
    this.products = this.productService.getProducts().slice(0, 10);
  }
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  @ViewChild('imageSwiper', { static: false }) imageSwiper!: ElementRef;
  @ViewChild('imageSwiper2', { static: false }) imageSwiper2!: ElementRef;

  products: product[] = [];
  ngAfterViewInit() {
    new Swiper(this.swiperRef.nativeElement, {
      modules: [Navigation, EffectCoverflow, Pagination],
      effect: 'coverflow',
      centeredSlides: true,
      slidesPerView: 2,
      spaceBetween: 100,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      loop: true,
      coverflowEffect: {
        rotate: 40,
        stretch: 50,
        depth: 240,
        modifier: 1,
        slideShadows: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
    new Swiper(this.imageSwiper.nativeElement, {
      modules: [Pagination, Autoplay],
      slidesPerView: 5,
      spaceBetween: 20,
      grid: {
        rows: 1,
        fill: 'row',
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      loop: true,
    });
    new Swiper(this.imageSwiper2.nativeElement, {
      modules: [Pagination, Autoplay],
      slidesPerView: 5,
      spaceBetween: 20,
      effect: 'slide',
      grid: {
        rows: 1,
        fill: 'row',
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        reverseDirection: true,
      },
      loop: true,
    });
  }
}
