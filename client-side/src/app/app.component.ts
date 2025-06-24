import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}
  previousUrl: string | null = null;

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url.split('?')[0];

        if (this.previousUrl !== null && this.previousUrl !== currentUrl) {
          window.scrollTo(0, 0);
        }

        this.previousUrl = currentUrl;
      }
    });
  }
}
