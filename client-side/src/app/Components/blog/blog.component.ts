import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  RouterModule,
} from '@angular/router';
import { Blog } from '../../Models/blog.model';
import { BlogService } from '../../Services/blog.service';
import { Subscription } from 'rxjs';
import { BlogSkeletonComponent } from './blog-skeleton/blog-skeleton.component';
import { CommonModule } from '@angular/common';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { RelatedBlogSkeletonComponent } from './related-blog-skeleton/related-blog-skeleton.component';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  imports: [
    BlogSkeletonComponent,
    RouterModule,
    CommonModule,
    HeaderBannerComponent,
    FeatureBannerComponent,
    RelatedBlogSkeletonComponent,
  ],
})
export class BlogComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  blog: Blog | undefined;
  relatedBlogs: Blog[] = [];
  selectedCategory: string = '';
  private routeSub: Subscription = new Subscription();
  loading: boolean = true;
  loadingRelatedBlogs: boolean = true; 

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blogService: BlogService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const blogID = this.route.snapshot.paramMap.get('id');
        if (blogID) {
          this.fetchBlogData(blogID);
        }
      }
    });

    const blogID = this.route.snapshot.paramMap.get('id');
    if (blogID) {
      this.fetchBlogData(blogID);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  fetchBlogData(blogID: string): void {
    this.loading = true;
    this.loadingRelatedBlogs = true;

    this.blogService.getPostById(blogID).subscribe((data) => {
      this.blog = data;
      this.blogService.getRelatedPosts(blogID).subscribe((relatedData) => {
        this.relatedBlogs = relatedData;
        this.loading = false;
        this.loadingRelatedBlogs = false;
      });
    });
  }

  get blogID(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }
}
