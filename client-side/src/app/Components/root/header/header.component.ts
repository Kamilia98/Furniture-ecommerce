import {
  Component,
  HostListener,
  ElementRef,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../shop/search/search.component';
import { UserActionsComponent } from './user-actions/user-actions.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    UserActionsComponent,
    NavigationComponent,
    SearchComponent
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Output() openFavorites = new EventEmitter<void>();
  @Output() openCart = new EventEmitter<void>();
  isActive = false;

  constructor(private router: Router, private elementRef: ElementRef) {}

  toggleMenu() {
    this.isActive = !this.isActive;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isActive &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isActive = false;
    }
  }
}
