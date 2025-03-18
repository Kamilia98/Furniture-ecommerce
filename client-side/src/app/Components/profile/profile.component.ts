import { Component, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { user } from '../../Models/user.model';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [RouterOutlet, CommonModule],
})
export class ProfileComponent implements OnInit {
  user$!: Observable<user | null>;
  isChecked: boolean = false;
  activeComponent: string = 'orders';

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user$ = this.userService.user$;
    this.userService.getUser().subscribe();
  }

  toggleCheck() {
    this.isChecked = !this.isChecked;
  }

  route(r: string) {
    this.activeComponent = r;
    this.router.navigate([`/profile/${r}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
