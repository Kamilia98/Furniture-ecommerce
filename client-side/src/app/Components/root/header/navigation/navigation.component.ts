import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [RouterModule],
  template: `
    <ul
      class="flex flex-col justify-center md:flex-row lg:gap-[30px] lg:gap-[40px]"
    >
      <li
        class="cursor-pointer border-b border-gray md:border-transparent px-[10px] leading-[40px] font-medium duration-300 ease hover:bg-secondary md:hover:border-primary md:hover:bg-transparent"
        routerLink="/"
      >
        Home
      </li>

      <li
        class="cursor-pointer border-b border-gray md:border-transparent px-[10px] leading-[40px] font-medium duration-300 ease hover:bg-secondary md:hover:border-primary md:hover:bg-transparent"
        routerLink="/shop"
      >
        Shop
      </li>
      <li
        class="cursor-pointer border-b border-gray md:border-transparent px-[10px] leading-[40px] font-medium duration-300 ease hover:bg-secondary md:hover:border-primary md:hover:bg-transparent"
        routerLink="/blogs"
      >
        Blogs
      </li>
      <li
        class="cursor-pointer border-b border-gray md:border-transparent px-[10px] leading-[40px] font-medium duration-300 ease hover:bg-secondary md:hover:border-primary md:hover:bg-transparent"
        routerLink="/contact"
      >
        Contact
      </li>
    </ul>
  `,
})
export class NavigationComponent {}
