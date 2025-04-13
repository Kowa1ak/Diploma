import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectDashboardComponent } from './dashboard/project-dashboard.component';
// Удален неиспользуемый импорт ProjectInputsComponent
import { ProjectGenerateComponent } from './generate/project-generate.component';
import { ProjectTestCasesComponent } from './test-cases/project-test-cases.component';
import { ProjectSettingsComponent } from './settings/project-settings.component';
import { Project, ProjectStatus } from './shared/project.models';
import { TestFilterService } from './shared/test-filter.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ProjectDashboardComponent,
    // Удален неиспользуемый импорт ProjectInputsComponent
    ProjectGenerateComponent,
    ProjectTestCasesComponent,
    ProjectSettingsComponent,
  ],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent implements OnInit {
  // Project data
  project: Project = {
    id: '1',
    name: 'Sample AI Test Project',
    description: 'This is a demo project for testing AI-generated test cases.',
    primaryLanguage: 'TypeScript',
    creationDate: new Date('2023-01-15'),
    lastModifiedDate: new Date('2023-05-20'),
    status: ProjectStatus.Active,
  };

  // UI states
  activeTab: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filterService: TestFilterService
  ) {}

  ngOnInit(): void {
    // Проверяем параметры URL для установки активной вкладки
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        switch (params['tab']) {
          case 'dashboard':
            this.activeTab = 0;
            break;
          // Inputs вкладка больше не существует
          case 'generate':
            this.activeTab = 1;
            break;
          case 'test-cases':
            this.activeTab = 2;
            break;
          case 'settings':
            this.activeTab = 3;
            break;
        }
      }

      // Если в URL есть параметр generationRun, обновляем его в сервисе
      if (params['generationRun']) {
        this.filterService.setGenerationRunFilter(params['generationRun']);
      }
    });
  }

  // Tab navigation
  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;

    // Если пользователь переходит на вкладку test-cases, убеждаемся что фильтры учтены
    if (tabIndex === 2) {
      // Обновлено с 3 на 2, т.к. Inputs вкладка удалена
      // Здесь можно добавить дополнительную логику при необходимости
    }
  }

  // Обработка изменений вкладки (устранена дублирующаяся реализация)
  onTabChange(index: number): void {
    // Если переходим на дашборд (index 0), очищаем путь к URL от параметров
    if (index === 0) {
      this.router.navigate(['/project'], {
        replaceUrl: true,
      });
    }
  }
}
