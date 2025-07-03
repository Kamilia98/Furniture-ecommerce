import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-thumbnail',
  imports: [],
  templateUrl: './thumbnail.component.html',
})
export class ThumbnailComponent {
  @Input() image!: string;
  @Input() isSelected: boolean = false;
}
