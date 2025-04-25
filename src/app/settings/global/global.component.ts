import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../shared/notification/notification.service';

@Component({
  selector: 'app-global',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    ConfirmDialogComponent,
  ],
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

  constructor(
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: BeforeUnloadEvent) {
    event.returnValue = 'Are you sure you want to leave settings?';
  }

  regenerateDefaultKey(): void {
    this.defaultApiKey =
      'API-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    this.notification.success('Default API Key regenerated');
    this.notification.success('Выбран Default API Key');
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
      this.notification.success('Custom API Key saved');
      this.notification.success('Выбран Custom API Key');
    } else {
      alert('Please enter a valid API key.');
    }
  }

  removeCustomKey(): void {
    this.customApiKey = null;
    this.activeApi = 'default';
    this.notification.success('Custom API Key deleted');
  }

  get maskedCustomKey(): string {
    if (this.customApiKey && this.customApiKey.length > 4) {
      return '****' + this.customApiKey.slice(-4);
    }
    return '****';
  }

  selectActiveApi(api: 'default' | 'custom'): void {
    this.activeApi = api;
    if (api === 'default') {
      this.notification.info('Default API Key selected');
    } else {
      this.notification.info('Custom API Key selected');
    }
  }

  onDefaultKeySelect(): void {
    this.notification.info('Default API Key selected');
  }

  onCustomKeySelect(keyId: string): void {
    this.notification.info('Custom API Key selected');
  }

  deleteCustomKey(keyId: string): void {
    this.notification.success('Custom API Key deleted');
  }
}
