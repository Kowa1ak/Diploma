import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  currentRoute: string = '';
  menuOpen: boolean = false;

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {
    this.currentRoute = this.router.url;
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.menuOpen = false;
        this.cdr.markForCheck(); // trigger change detection on route change
      }
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  get isHomePage(): boolean {
    // Use the updated currentRoute to determine if the current page is home
    return this.currentRoute === '/home';
  }

  goToAccount(): void {
    this.router.navigate(['/settings'], { queryParams: { tab: 'account' } });
  }
}
