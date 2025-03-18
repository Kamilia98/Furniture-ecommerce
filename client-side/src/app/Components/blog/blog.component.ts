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
  styleUrls: ['./blog.component.css'], // ✅ تم تعديل `styleUrl` إلى `styleUrls`
})
export class BlogComponent implements OnInit {
  blogs: BlogPost[] = [];
  blog: BlogPost | undefined;
  selectedCategory: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blogService: BlogService
  ) {}

  ngOnInit(): void {
    const blogID = this.route.snapshot.paramMap.get('id');

    if (blogID) {
      this.blogService.getPostById(blogID).subscribe((data) => {
        // ✅ استخدام `getPostById` بشكل صحيح
        this.blog = data;
        this.selectedCategory = data.category;
      });
    }

    this.blogService.getAllPosts().subscribe((data) => {
      this.blogs = data.posts;
    });
  }

  get blogID(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  get relatedBlogs(): BlogPost[] {
    return this.blogs.filter(
      (blog) =>
        blog.category === this.selectedCategory && blog.id !== this.blogID
    );
  }
}
