import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalComponent } from './global/global.component';
import { AccountComponent } from './account/account.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    GlobalComponent,
    AccountComponent,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  selectedTab: 'global' | 'account' = 'global';
  @ViewChild('tabsElement') tabsElement!: ElementRef;
  @ViewChild('tabContent') tabContent!: ElementRef;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab === 'account' || tab === 'global') {
        this.selectedTab = tab;
      }
    });
  }

  selectTab(tab: 'global' | 'account'): void {
    this.selectedTab = tab;
  }
}
