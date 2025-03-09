import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() type:
    | 'primary-fill'
    | 'secondary-fill'
    | 'primary-outline'
    | 'semi-black-outline'
    | 'plainBtn'
    | 'black-outline' = 'primary-fill';
  @Input() btnPadding: string = '10px';
  @Input() btnWidth: string = '150px';
}
