import { Component } from '@angular/core';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';

@Component({
  selector: 'app-returns',
  imports: [HeaderBannerComponent,
    FeatureBannerComponent],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.css'
})
export class ReturnsComponent {

}
