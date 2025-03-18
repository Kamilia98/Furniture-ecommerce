import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { user } from '../../../Models/user.model';
import { UserService } from '../../../Services/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-setting',
  imports: [ButtonComponent, CommonModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css',
})
export class SettingComponent {
  user$!: Observable<user | null>;
  isChecked: boolean = false;
  activeComponent: string = 'orders';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user$ = this.userService.user$;
    this.userService.getUser().subscribe();
  }
  toggleCheck() {
    this.isChecked = !this.isChecked;
  }
}
