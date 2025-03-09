import { Component, Input, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-banner',
  imports: [RouterModule],
  templateUrl: './header-banner.component.html',
  styleUrl: './header-banner.component.css',
})
export class HeaderBannerComponent {
  @Input() bannerTitle = '';
}
