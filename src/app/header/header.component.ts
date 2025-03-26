import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  currentRoute: string = '';
  menuOpen: boolean = false; // новое свойство для управления меню

  constructor(public router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        // Закрываем меню при навигации
        this.menuOpen = false;
      }
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  isHomePage(): boolean {
    return this.currentRoute === '/home' || this.currentRoute === '/';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
