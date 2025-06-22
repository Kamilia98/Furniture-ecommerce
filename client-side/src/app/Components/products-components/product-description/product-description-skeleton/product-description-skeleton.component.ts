import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-description-skeleton',
  standalone: true,
  imports: [NgxSkeletonLoaderModule, CommonModule],
  template: `
    <div
      class="flex min-h-screen w-full flex-col items-center bg-white py-8 lg:py-12"
    >
      <!-- Upper Border -->
      <div class="w-full border-t border-gray-medium"></div>

      <!-- Tabs Skeleton -->
      <div class="mt-8 flex w-full max-w-2xl justify-center gap-6 px-4">
        <ngx-skeleton-loader
          [theme]="{
            'width.px': 100,
            'height.px': 32,
            'border-radius': '4px',
          }"
        />
        <ngx-skeleton-loader
          [theme]="{
            'width.px': 140,
            'height.px': 32,
            'border-radius': '4px',
          }"
        />
      </div>

      <!-- Content Section -->
      <div class="mt-8 w-full max-w-3xl px-4 sm:px-6">
        <!-- Main Content -->
        <div class="space-y-6">
          <!-- Dynamic Content Area -->
          <ngx-skeleton-loader
            [theme]="{
              'width.%': 100,
              'height.px': 180,
              'border-radius': '8px',
            }"
          />

          <!-- Accordion Section -->
          <div class="space-y-4">
            <div *ngFor="let _ of [1, 2, 3, 4]" class="rounded-lg border p-4">
              <ngx-skeleton-loader
                [theme]="{
                  'width.px': 160,
                  'height.px': 28,
                  'margin-bottom': '16px',
                }"
              />
              <div class="space-y-3">
                <div
                  *ngFor="let _ of [1, 2, 3]"
                  class="flex items-center justify-between"
                >
                  <ngx-skeleton-loader
                    [theme]="{
                      'width.px': 120,
                      'height.px': 20,
                    }"
                  />
                  <ngx-skeleton-loader
                    [theme]="{
                      'width.px': 80,
                      'height.px': 20,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Grid -->
      <div
        class="mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6"
      >
        <ngx-skeleton-loader
          *ngFor="let _ of [1, 2]"
          [theme]="{
            'width.%': 100,
            'height.px': 300,
            'border-radius': '8px',
          }"
        />
      </div>
    </div>
  `,
  styles: [
    `
      ngx-skeleton-loader {
        --background-color: #f3f4f6;
        --animation-color: #e5e7eb;
      }
    `,
  ],
  host: {
    class: 'block min-h-80vh',
  },
})
export class ProductDescriptionSkeletonComponent {}
