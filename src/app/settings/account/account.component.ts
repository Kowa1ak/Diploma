import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../shared/notification/notification.service';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  username: string = 'JohnDoe'; // пример значения
  email: string = 'john@example.com'; // пример значения
  showChangePassword: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';

  editUsername: boolean = false;
  editEmail: boolean = false;

  showLogoutDialog = false;
  logoutMessage = 'Are you sure you want to log out?';
  logoutConfirm!: () => void;

  constructor(private notification: NotificationService) {}

  openChangeEmail(): void {
    this.editEmail = true;
  }

  toggleChangePassword(): void {
    if (!this.showChangePassword) {
      this.showChangePassword = true;
    } else {
      // подтверждаем смену пароля
      this.savePassword();
    }
  }

  private savePassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      this.notification.error('New passwords do not match');
      return;
    }
    // Добавьте здесь логику проверки текущего пароля и смены пароля
    this.notification.success('Password changed successfully');
    this.showChangePassword = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  cancelChangePassword(): void {
    this.showChangePassword = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  saveUsername(): void {
    // Здесь можно добавить логику сохранения изменений
    this.notification.success('Username updated');
    this.editUsername = false;
  }

  saveEmail(): void {
    // Здесь можно добавить логику сохранения изменений
    this.notification.success('Email updated');
    this.editEmail = false;
  }

  logout(): void {
    this.logoutConfirm = () => {
      // ...existing logout logic (e.g. clear session)...
      this.showLogoutDialog = false;
      this.notification.info('Logged out successfully');
    };
    this.showLogoutDialog = true;
  }
}
