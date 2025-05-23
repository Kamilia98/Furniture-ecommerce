import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';

import { BlogService } from '../../Services/blog.service';
import { Blog } from '../../Models/blog.model';

import { RouterModule } from '@angular/router';
import { BlogSkeletonComponent } from '../blog/blog-skeleton/blog-skeleton.component';

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
    BlogSkeletonComponent,
  ],
  templateUrl: './blogs.component.html',
})
export class BlogsComponent implements OnInit {
  @ViewChild('blogsContainer') blogsContainer!: ElementRef;

  categories: string[] = [];
  selectedCategory: string = 'All';
  isMenuOpen: boolean = false;
  searchQuery: string = '';
  posts!: Blog[];
  loading = true;

  currentPage: number = 1;
  postsPerPage: number = 3;
  totalPosts: number = 0;
  totalPages: number = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private blogService: BlogService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPosts();
  }

  loadCategories() {
    this.blogService.getCategories();
    this.blogService.categories$.subscribe((data) => {
      this.categories = ['All', ...data];
    });
  }

  loadPosts() {
    this.loading = true;

    this.blogService
      .getAllPosts(this.currentPage, this.postsPerPage, this.selectedCategory)
      .subscribe((posts) => {
        this.posts = posts;
        this.loading = false;
      });

    this.blogService.totalPosts$.subscribe((totalPosts) => {
      this.totalPosts = totalPosts;
      this.totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
      console.log('Total Pages:', this.totalPages);
    });
  }

  filterByCategory(selectedItem: { id: string; value: string } | string) {
    this.selectedCategory =
      typeof selectedItem === 'string' ? selectedItem : selectedItem.value;
    this.currentPage = 1; // Reset to the first page when category changes
    this.loadPosts(); // Fetch posts with the selected category
    this.toggleDropdown(false); // Close the dropdown after selection
  }

  toggleDropdown(open: boolean) {
    this.isMenuOpen = open;
  }
}
