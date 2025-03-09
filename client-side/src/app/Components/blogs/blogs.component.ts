import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';
import { BlogService } from '../../Services/blog.service';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { BlogPost } from '../../Models/blog.model';

@Component({
  selector: 'app-blogs',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderBannerComponent,
    FeatureBannerComponent,
    DropdownComponent,
    PaginationComponent,
  ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css',
})
export class BlogsComponent implements OnInit {
  @ViewChild('blogsContainer') blogsContainer!: ElementRef;
  categories: string[] = [
    'All',
    'Furniture & Decor',
    'office',
    'smart home',
    'Home Decor',
    'Dining Furniture',
    'Bedroom Furniture',
    'Vintage',
    'Small Spaces',
    'Outdoor Living',
    'Wooden',
  ];
  selectedCategory: string = 'All';
  isMenuOpen: boolean = false;
  searchQuery: string = '';
  post?: BlogPost;
  posts: BlogPost[] = [];
  currentPage: number = 1;
  postsPerPage: number = 3;

  constructor(
    private readonly route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.posts = this.blogService.getBlogs();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.postsPerPage);
  }

  get currentPosts(): BlogPost[] {
    const start = (this.currentPage - 1) * this.postsPerPage;
    const end = start + this.postsPerPage;

    return this.filteredPosts.slice(start, end);
  }

  get filteredPosts(): BlogPost[] {
    return this.posts.filter(
      (post) =>
        (this.selectedCategory === 'All' ||
          post.category === this.selectedCategory) &&
        (this.searchQuery === '' ||
          post.title.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;

    if (this.blogsContainer) {
      const offset = 100;
      const topPosition =
        this.blogsContainer.nativeElement.getBoundingClientRect().top +
        window.scrollY -
        offset;

      window.scrollTo({
        top: topPosition,
        behavior: 'smooth',
      });
    }
  }

  filterByCategory(selectedItem: { id: number; value: string } | string) {
    if (typeof selectedItem == 'string') this.selectedCategory = selectedItem;
    else this.selectedCategory = selectedItem.value;
    this.currentPage = 1;
    this.toggleDropdown(false);
  }

  toggleDropdown(open: boolean) {
    this.isMenuOpen = open;
  }
}
