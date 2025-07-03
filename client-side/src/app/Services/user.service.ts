import { Injectable } from '@angular/core';
import { User } from '../Models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users/profile`;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getUser(): Observable<User> {
    return this.http
      .get<{ status: string; data: { user: any } }>(this.apiUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(({ data: { user } }) => {
          const { email, username, _id, thumbnail } = user;
          return {
            email,
            name: username,
            id: _id,
            thumbnail,
          } as User;
        }),
        tap((u) => this.userSubject.next(u)),
      );
  }
  changePassword(password: string) {
    return this.http
      .put<{
        status: string;
        message: string;
      }>(`${this.apiUrl}/change-password`, { password }, { headers: this.getAuthHeaders() })
      .pipe(
        tap((response) => {
          if (response.status === 'success') {
            console.log('Password changed successfully');
          }
        }),
      );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  updateUserImageLocally(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    const folderPath = 'profileIMGs';
    formData.append('folder', folderPath);
    return this.http
      .post('https://api.cloudinary.com/v1_1/dddhappm3/image/upload', formData)
      .pipe(
        tap((res: any) => {
          const imageUrl = res.secure_url;
          this.updateUserImage(imageUrl).subscribe(() => {
            console.log('User image updated!');
            this.getUser().subscribe((updatedUser) => {
              this.userSubject.next(updatedUser);
            });
          });
        }),
      );
  }

  updateUserImage(imageUrl: string) {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/change-img`,
      { thumbnail: imageUrl },
      { headers: this.getAuthHeaders() },
    );
  }
}
