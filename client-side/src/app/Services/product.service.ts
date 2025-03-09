import { Injectable } from '@angular/core';
import { product } from '../Models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: product[] = [
    {
      id: 1,
      img: '/images/products/1.png',
      title: 'Luna Café Chair',
      description:
        'A sleek and modern chair designed for cozy cafés and contemporary spaces.',
      price: 2500,
      sale: 20,
      date: new Date(2021, 1, 10),
      category: 'chair',
      quantity: 5,
    },
    {
      id: 2,
      img: '/images/products/2.png',
      title: 'Arlo Wooden Chair',
      description:
        'A handcrafted wooden chair that blends durability with timeless style.',
      price: 3000,
      date: new Date(2022, 1, 15),
      category: 'chair',
      quantity: 6,
    },
    {
      id: 3,
      img: '/images/products/3.png',
      title: 'Milo Dining Chair',
      description:
        'A minimalistic yet elegant dining chair with a comfortable padded seat.',
      price: 2300,
      date: new Date(2023, 1, 20),
      category: 'chair',
      quantity: 4,
    },
    {
      id: 4,
      img: '/images/products/4.png',
      title: 'Eleanor Accent Chair',
      description:
        'A luxurious accent chair with a velvet finish, perfect for adding sophistication.',
      price: 7000,
      sale: 35,
      date: new Date(2023, 1, 25),
      category: 'sofa',
      quantity: 1,
    },
    {
      id: 5,
      img: '/images/products/5.png',
      title: 'Nova Lounge Chair',
      description:
        'A stylish lounge chair with a plush cushion, ideal for relaxation.',
      price: 7500,
      date: new Date(2025, 1, 28),
      category: 'sofa',
      quantity: 1,
    },
    {
      id: 6,
      img: '/images/products/6.png',
      title: 'Bennett Armchair',
      description:
        'A cozy armchair with a contemporary design and ergonomic support.',
      price: 1500,
      date: new Date(2025, 0, 20),
      category: 'sofa',
      quantity: 1,
    },
    {
      id: 7,
      img: '/images/products/7.png',
      title: 'Haven Bar Stool',
      description:
        'A modern bar stool with a sturdy frame and cushioned seating for comfort.',
      price: 3000,
      date: new Date(2025, 0, 18),
      category: 'stool',
      quantity: 1,
    },
    {
      id: 8,
      img: '/images/products/8.png',
      title: 'Willow Rattan Chair',
      description:
        'A natural rattan chair that adds warmth and character to any space.',
      price: 2200,
      date: new Date(2024, 10, 22),
      category: 'chair',
      quantity: 1,
    },
    {
      id: 9,
      img: '/images/products/9.png',
      title: 'Aster Scandinavian Chair',
      description:
        'A sleek Scandinavian-inspired chair with a minimalist aesthetic.',
      price: 1700,
      date: new Date(2024, 9, 5),
      category: 'chair',
      quantity: 1,
    },
    {
      id: 10,
      img: '/images/products/10.png',
      title: 'Theodore Wingback Chair',
      description:
        'An elegant wingback chair with a high backrest for ultimate comfort.',
      price: 4500,
      date: new Date(2025, 1, 14),
      category: 'chair',
      quantity: 1,
    },
    {
      id: 11,
      img: '/images/products/11.png',
      title: 'Atlas Rocking Chair',
      description:
        'A contemporary rocking chair with a sturdy wooden base and soft cushioning.',
      price: 7200,
      date: new Date(2024, 10, 9),
      category: 'chair',
      quantity: 1,
    },
    {
      id: 12,
      img: '/images/products/12.png',
      title: 'Vesper Office Desk',
      description:
        'A stylish and ergonomic office desk designed for maximum productivity.',
      price: 5400,
      date: new Date(2024, 11, 27),
      category: 'desk',
      quantity: 1,
    },
    {
      id: 13,
      img: '/images/products/13.png',
      title: 'Orion Leather Sofa',
      description:
        'A sophisticated leather sofa that adds a touch of luxury to any space.',
      price: 12500,
      date: new Date(2023, 11, 15),
      category: 'sofa',
      quantity: 1,
    },
    {
      id: 14,
      img: '/images/products/14.png',
      title: 'Sienna Upholstered Bed',
      description:
        'A comfortable upholstered bed that seamlessly blends style and function.',
      price: 8700,
      date: new Date(2023, 10, 5),
      category: 'bed',
      quantity: 1,
    },
    {
      id: 15,
      img: '/images/products/15.png',
      title: 'Everly Wooden Bench',
      description:
        'A solid wooden bench with a rustic charm, perfect for any home setting.',
      price: 4100,
      date: new Date(2023, 9, 20),
      category: 'bench',
      quantity: 1,
    },
    {
      id: 16,
      img: '/images/products/16.png',
      title: 'Oakwood Dining Table',
      description:
        'A beautifully crafted oakwood dining table perfect for family gatherings.',
      price: 9500,
      date: new Date(2023, 8, 10),
      category: 'table',
      quantity: 1,
    },
    {
      id: 17,
      img: '/images/products/17.png',
      title: 'Modern Bookshelf',
      description:
        'A sleek bookshelf with ample storage for books and decorative pieces.',
      price: 5600,
      date: new Date(2023, 7, 5),
      category: 'shelf',
      quantity: 1,
    },
  ];
  getProductNames(): { id: number; value: string }[] {
    return this.products.map((p) => ({ id: p.id, value: p.title }));
  }

  getProducts(): product[] {
    return this.products;
  }
  getProduct(productId: number): product | undefined {
    return this.products.find((p) => p.id === productId);
  }
}
