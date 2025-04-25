import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications: Notification[] = [];
  private subject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.subject.asObservable();
  private counter = 0;

  show(message: string, type: Notification['type'] = 'info', duration = 3000) {
    const note: Notification = {
      id: ++this.counter,
      type,
      message,
    };
    this.notifications.push(note);
    this.subject.next(this.notifications);
    setTimeout(() => this.remove(note.id), duration);
  }

  remove(id: number) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.subject.next(this.notifications);
  }

  success(msg: string, dur?: number) {
    this.show(msg, 'success', dur);
  }
  error(msg: string, dur?: number) {
    this.show(msg, 'error', dur);
  }
  info(msg: string, dur?: number) {
    this.show(msg, 'info', dur);
  }
}
