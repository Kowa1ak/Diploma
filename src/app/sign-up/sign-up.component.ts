import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

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
  firstName = '';
  email = '';
  password = '';
  confirmPassword = '';
  confirmationEmail = '';
  showConfirmationModal = false;
  resendCountdown = 0;
  private resendTimer!: any;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {}

  register(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    // ... handle successful registration ...
    this.confirmationEmail = this.email;
    this.openConfirmationModal();
  }

  openConfirmationModal(): void {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    clearInterval(this.resendTimer);
    this.resendCountdown = 0;
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
