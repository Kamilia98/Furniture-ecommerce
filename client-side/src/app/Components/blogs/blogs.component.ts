import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';

import { BlogService } from '../../Services/blog.service';
import { BlogPost } from '../../Models/blog.model';

import { RouterModule } from '@angular/router';

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
  styleUrls: ['./blogs.component.css'],
})
export class BlogsComponent implements OnInit {
  @ViewChild('blogsContainer') blogsContainer!: ElementRef;
  categories: string[] = [];
  selectedCategory: string = 'All';
  isMenuOpen: boolean = false;
  searchQuery: string = '';
  posts: BlogPost[] = [];
  currentPage: number = 1;
  postsPerPage: number = 3;

  constructor(
    private readonly route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPosts();
  }

  loadCategories() {
    this.blogService.getCategories().subscribe((data) => {
      this.categories = ['All', ...data];
    });
  }

  loadPosts() {
    this.blogService.getAllPosts().subscribe((data) => {
      this.posts = data.posts;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.postsPerPage);
  }

  get currentPosts(): BlogPost[] {
    const start = (this.currentPage - 1) * this.postsPerPage;
    return this.filteredPosts.slice(start, start + this.postsPerPage);
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

    if (this.blogsContainer?.nativeElement) {
      const offset = 100;
      window.scrollTo({
        top:
          this.blogsContainer.nativeElement.getBoundingClientRect().top +
          window.scrollY -
          offset,
        behavior: 'smooth',
      });
    }
  }

  filterByCategory(selectedItem: { id: string; value: string } | string) {
    this.selectedCategory =
      typeof selectedItem === 'string' ? selectedItem : selectedItem.value;
    this.currentPage = 1;
    this.toggleDropdown(false);
  }

  toggleDropdown(open: boolean) {
    this.isMenuOpen = open;
  }
}
