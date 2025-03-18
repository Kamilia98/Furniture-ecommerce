import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { ButtonComponent } from '../shared/button/button.component';
import { ContactService } from '../../Services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderBannerComponent,
    FeatureBannerComponent,
    ButtonComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  contactForm: FormGroup;
  message: string = '';
  isSuccess: boolean = false;

  constructor(private readonly fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
      message: ['', Validators.required],
    });

    this.contactService.message$.subscribe((response) => {
      if (response) {
        this.message = response.message;
        this.isSuccess = response.isSuccess;
      }
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.contactService.sendMessage(this.contactForm.value).subscribe();
      this.contactForm.reset();
    } else {
      this.message = 'Please fill all fields correctly.';
      this.isSuccess = false;
    }
  }
}
