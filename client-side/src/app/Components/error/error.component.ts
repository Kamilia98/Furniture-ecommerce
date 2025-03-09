import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../shared/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [ButtonComponent, RouterModule],
  template: `
    <div class="flex flex-col p-10 justify-center items-center gap-10">
      <img src="./images/{{ errorCode }}.jpg" alt="" class="w-[500px]" />
      <h1 class="text-4xl text-center max-w-md">
        {{ errorMessage }}
      </h1>
      <app-button btnWidth="200px" [routerLink]="['/home']"
        >Back to Home Page</app-button
      >
    </div>
  `,
})
export class ErrorComponent {
  @Input() errorCode: number = 404;
  @Input() errorMessage: string = 'We can’t find the page you’re looking for';
}
