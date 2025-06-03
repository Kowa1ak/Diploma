import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { NotificationService } from '../shared/notification/notification.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  confirmationEmail = '';
  showConfirmationModal = false;
  resendCountdown = 0;
  private resendTimer!: any;

  constructor(
    private auth: AuthService,
    private notification: NotificationService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  register(form: NgForm): void {
    if (form.invalid || this.password !== this.confirmPassword) {
      form.control.markAllAsTouched();
      if (this.password !== this.confirmPassword) {
        this.notification.error('Passwords do not match');
      }
      return;
    }
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        // Сразу открываем модальное окно подтверждения
        this.confirmationEmail = this.email;
        this.openConfirmationModal();
      },
      error: (err) => {
        const serverMsg =
          err.error?.error || err.error?.message || 'Registration failed';
        console.error('Registration error', serverMsg);
        this.notification.error(serverMsg);
      },
    });
  }

  openConfirmationModal(): void {
    this.showConfirmationModal = true;
    this.cdr.markForCheck(); // запускаем повторную отрисовку
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    clearInterval(this.resendTimer);
    this.resendCountdown = 0;
    // После закрытия модалки переходим на страницу логина
    this.router.navigate(['/login']);
  }

  resendConfirmation(): void {
    if (this.resendCountdown > 0) return;
    this.resendCountdown = 60;
    this.resendTimer = setInterval(() => {
      this.zone.run(() => {
        this.resendCountdown--;
        if (this.resendCountdown === 0) {
          clearInterval(this.resendTimer);
        }
        this.cdr.markForCheck();
      });
    }, 1000);
  }
}
