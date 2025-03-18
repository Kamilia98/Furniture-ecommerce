import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BlogPost } from '../Models/blog.model';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getAllPosts(
    page: number = 1,
    limit: number = 10
  ): Observable<{ totalPosts: number; posts: BlogPost[] }> {
    return this.http
      .get<{ totalPosts: number; posts: BlogPost[] }>(
        `${this.apiUrl}/posts?page=${page}&limit=${limit}`
      )
      .pipe(catchError(this.handleError));
  }

  getPostById(id: string): Observable<BlogPost> {
    return this.http
      .get<BlogPost>(`${this.apiUrl}/posts/${id}`)
      .pipe(catchError(this.handleError));
  }

  getRecentPosts(): Observable<BlogPost[]> {
    return this.http
      .get<{ data: { posts: BlogPost[] } }>(`${this.apiUrl}/posts/recent`)
      .pipe(
        map((response) => response.data.posts),
        catchError(this.handleError)
      );
  }

  getRelatedPosts(id: string): Observable<BlogPost[]> {
    return this.http
      .get<{ data: { relatedPosts: BlogPost[] } }>(
        `${this.apiUrl}/posts/${id}/related`
      )
      .pipe(
        map((response) => response.data.relatedPosts),
        catchError(this.handleError)
      );
  }

  getCategories(): Observable<string[]> {
    return this.http
      .get<{ data: { categories: string[] } }>(
        `${this.apiUrl}/posts/categories`
      )
      .pipe(
        map((response) => response.data.categories),
        catchError(this.handleError)
      );
  }
}
