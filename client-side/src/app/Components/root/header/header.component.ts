import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../search/search.component';
import { UserActionsComponent } from './user-actions/user-actions.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    SearchComponent,
    UserActionsComponent,
    NavigationComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isActive = false;

  constructor(private router: Router, private elementRef: ElementRef) {}

  toggleMenu() {
    this.isActive = !this.isActive;
  }

  goToProduct(id: string) {
    this.router.navigate([`/product/${id}`]);
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
