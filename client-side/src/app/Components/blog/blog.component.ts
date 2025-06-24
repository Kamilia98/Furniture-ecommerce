import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Blog } from '../../Models/blog.model';
import { BlogService } from '../../Services/blog.service';
import {
  Observable,
  Subject,
  of,
  filter,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { BlogSkeletonComponent } from './blog-skeleton/blog-skeleton.component';
import { CommonModule } from '@angular/common';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { RelatedBlogSkeletonComponent } from './related-blog-skeleton/related-blog-skeleton.component';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  standalone: true,
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
  blog$: Observable<Blog> = of({} as Blog);
  relatedBlogs$: Observable<Blog[]> = of([]);
  selectedCategory: string = '';
  loading: boolean = true;
  loadingRelatedBlogs: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blogService: BlogService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        filter((params) => !!params.get('id')),
        tap(() => {
          this.loading = true;
          this.loadingRelatedBlogs = true;
        }),
        switchMap((params) => {
          const blogID = params.get('id')!;
          this.blog$ = this.blogService
            .getPostById(blogID)
            .pipe(tap(() => (this.loading = false)));
          this.relatedBlogs$ = this.blogService
            .getRelatedPosts(blogID)
            .pipe(tap(() => (this.loadingRelatedBlogs = false)));
          return of(null);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
