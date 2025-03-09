import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogPost } from '../../Models/blog.model';
import { BlogService } from '../../Services/blog.service';
import { CommonModule } from '@angular/common';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderBannerComponent,
    FeatureBannerComponent,
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit {
  blogs: BlogPost[] = [];
  selectedCategory: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.blogs = this.blogService.getBlogs();

    if (this.blog) {
      this.selectedCategory = this.blog.category;
    }
  }

  get blogID(): number | null {
    const idParam = this.route.snapshot.paramMap.get('id');
    return idParam ? Number(idParam) : null;
  }

  get blog(): BlogPost | undefined {
    return this.blogID ? this.blogService.getBlog(this.blogID) : undefined;
  }

  get relatedBlogs(): BlogPost[] {
    return this.blogs.filter(
      (blog) =>
        blog.category === this.selectedCategory && blog.id !== this.blogID
    );
  }
}
