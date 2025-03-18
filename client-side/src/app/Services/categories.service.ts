import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, take, map, reduce } from 'rxjs/operators';
import { category } from '../Models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private categoriesSubject = new BehaviorSubject<category[]>([]);
  categories$ = this.categoriesSubject.asObservable();
  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http
      .get<{ data: { categories: any[] } }>('http://localhost:5000/categories')
      .pipe(
        tap((response) => {
          const apiCategories = response.data.categories.map((p) => ({
            id: p._id,
            name: p.catName,
          }));
          this.categoriesSubject.next(apiCategories);
        }),
        catchError((error) => {
          console.error('Error fetching categories:', error);
          return of([]);
        })
      );
  }
}
