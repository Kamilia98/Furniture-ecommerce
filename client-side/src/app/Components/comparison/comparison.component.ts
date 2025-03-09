import { Component } from '@angular/core';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';

@Component({
  selector: 'app-comparison',
  imports: [FeatureBannerComponent, HeaderBannerComponent],
  templateUrl: './comparison.component.html',
})
export class ComparisonComponent {}
