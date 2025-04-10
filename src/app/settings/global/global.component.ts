import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // для ngModel и *ngIf
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-global',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalComponent {
  // Перенесённая логика из SettingsComponent (global часть)
  selectedTestCaseFormat: string = 'Gherkin';
  notifyOnComplete: boolean = false;
  notifyOnFailed: boolean = false;
  defaultApiKey: string = 'API-DEFAULT-1234';
  customApiKey: string | null = null;
  activeApi: 'default' | 'custom' = 'default';
  showInsertModal: boolean = false;
  insertedApiKey: string = '';

  regenerateDefaultKey(): void {
    this.defaultApiKey =
      'API-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  openInsertModal(): void {
    this.showInsertModal = true;
    this.insertedApiKey = '';
  }

  cancelInsert(): void {
    this.showInsertModal = false;
  }

  saveInsert(): void {
    if (this.insertedApiKey && this.insertedApiKey.trim().length > 0) {
      this.customApiKey = this.insertedApiKey.trim();
      this.activeApi = 'custom';
      this.showInsertModal = false;
    } else {
      alert('Please enter a valid API key.');
    }
  }

  removeCustomKey(): void {
    this.customApiKey = null;
    this.activeApi = 'default';
  }

  get maskedCustomKey(): string {
    if (this.customApiKey && this.customApiKey.length > 4) {
      return '****' + this.customApiKey.slice(-4);
    }
    return '****';
  }

  selectActiveApi(api: 'default' | 'custom'): void {
    this.activeApi = api;
  }
}
