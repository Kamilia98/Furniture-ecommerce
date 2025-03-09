import { Component } from '@angular/core';
import { ButtonComponent } from '../shared/button/button.component';
import { user } from '../../Models/user.model';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-setting',
  imports: [ButtonComponent],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css',
})
export class SettingComponent {
  user!: user;
  isChecked: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
  }
  toggleCheck() {
    this.isChecked = !this.isChecked;
  }
}
