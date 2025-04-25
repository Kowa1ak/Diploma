import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from './notification.service';
import { AsyncPipe, NgForOf, NgClass } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NgForOf, NgClass, AsyncPipe],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  notifications$ = this.ns.notifications$;
  constructor(private ns: NotificationService) {}
}
