import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Blog } from '../Models/blog.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/posts`;

  private postsSubject: BehaviorSubject<Blog[]> = new BehaviorSubject<Blog[]>(
    []
  );
  private totalPostsSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  private categoriesSubject: BehaviorSubject<string[]> = new BehaviorSubject<
    string[]
  >([]);
  private selectedCategorySubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('All');

  posts$ = this.postsSubject.asObservable();
  totalPosts$ = this.totalPostsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('[BlogService] Error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getAllPosts(page: number = 1, limit: number = 10, category: string = '') {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (category && category !== 'All') {
      url += `&category=${category}`;
      console.log(`[BlogService] Fetching posts for category: ${category}`);
    } else {
      console.log('[BlogService] Fetching all posts');
    }

    return this.http
      .get<{ status: string; data: { totalPosts: number; posts: Blog[] } }>(url)
      .pipe(
        tap((data) => {
          console.log('[BlogService] Posts data received:', data);
          this.postsSubject.next(data.data.posts);
          this.totalPostsSubject.next(data.data.totalPosts);
        }),
        map((res) => res.data.posts),
        catchError(this.handleError)
      );
  }

  getPostById(id: string): Observable<Blog> {
    console.log(`[BlogService] Fetching post by ID: ${id}`);
    return this.http.get<{ data: { post: Blog } }>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data.post),
      catchError(this.handleError)
    );
  }

  getRecentPosts(): Observable<Blog[]> {
    console.log('[BlogService] Fetching recent posts');
    return this.http
      .get<{ data: { posts: Blog[] } }>(`${this.apiUrl}/recent`)
      .pipe(
        map((response) => response.data.posts),
        tap((posts) => console.log('[BlogService] Recent posts:', posts)),
        catchError(this.handleError)
      );
  }

  getRelatedPosts(id: string): Observable<Blog[]> {
    console.log(`[BlogService] Fetching related posts for post ID: ${id}`);
    return this.http
      .get<{ data: { relatedPosts: Blog[] } }>(
        `${this.apiUrl}/related?id=${id}`
      )
      .pipe(
        map((response) =>{
          console.log('[BlogService] Related posts response:', response);
          return response.data.relatedPosts;
        }),
        tap((relatedPosts) =>
          console.log('[BlogService] Related posts:', relatedPosts)
        ),
        catchError(this.handleError)
      );
  }

  getCategories() {
    console.log('[BlogService] Fetching categories');
    this.http
      .get<{ data: { categories: string[] } }>(`${this.apiUrl}/categories`)
      .pipe(
        map((response) => response.data.categories),
        tap((categories) => {
          console.log('[BlogService] Categories received:', categories);
          this.categoriesSubject.next(categories);
        }),
        catchError(this.handleError)
      )
      .subscribe();
  }

  setSelectedCategory(category: string) {
    console.log(`[BlogService] Selected category: ${category}`);
    this.selectedCategorySubject.next(category);
  }
}
