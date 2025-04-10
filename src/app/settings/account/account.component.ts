import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
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

  openChangeEmail(): void {
    this.editEmail = true;
  }

  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
  }

  savePassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Добавьте здесь логику проверки текущего пароля и смены пароля
    alert('Password changed successfully!');
    this.cancelChangePassword();
  }

  cancelChangePassword(): void {
    this.showChangePassword = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  saveUsername(): void {
    // Здесь можно добавить логику сохранения изменений
    this.editUsername = false;
  }

  saveEmail(): void {
    // Здесь можно добавить логику сохранения изменений
    this.editEmail = false;
  }

  logout(): void {
    alert('Logging out...');
  }
}
