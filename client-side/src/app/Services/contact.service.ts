import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private messageSubject = new BehaviorSubject<{ message: string; isSuccess: boolean } | null>(null);
  message$ = this.messageSubject.asObservable();

  private apiUrl = 'http://localhost:5000/contact/send-message';

  constructor(private http: HttpClient) {}

  sendMessage(contactData: { name: string; email: string; subject?: string; message: string }): Observable<any> {
    return this.http.post<{ message: string }>(this.apiUrl, contactData).pipe(
      tap((response) => {
        this.messageSubject.next({ message: response.message, isSuccess: true });
      }),
      catchError((error) => {
        console.error('Error sending message:', error);
        this.messageSubject.next({ message: 'Failed to send message. Please try again later.', isSuccess: false });
        return of(null);
      })
    );
  }
}
