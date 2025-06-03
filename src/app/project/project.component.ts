import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectDashboardComponent } from './dashboard/project-dashboard.component';
import { ProjectGenerateComponent } from './generate/project-generate.component';
import { ProjectTestCasesComponent } from './test-cases/project-test-cases.component';
import { ProjectSettingsComponent } from './settings/project-settings.component';
import { Project, ProjectStatus } from './shared/project.models';
import { TestFilterService } from './shared/test-filter.service';
import { ProjectService } from './shared/project.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ProjectDashboardComponent,
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
  project: Project | null = null;
  isLoaded = false;

  // UI states
  activeTab: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filterService: TestFilterService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.projectService.getProject(id).subscribe((p: any) => {
      this.project = {
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        primaryLanguage: p.programmingLanguage || '',
        creationDate: new Date(p.createdAt),
        lastModifiedDate: new Date(p.createdAt),
        status: (p.status.charAt(0).toUpperCase() +
          p.status.slice(1)) as ProjectStatus,
      };
      this.isLoaded = true;
      // trigger change detection if needed
    });

    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        switch (params['tab']) {
          case 'dashboard':
            this.activeTab = 0;
            break;
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

      if (params['generationRun']) {
        this.filterService.setGenerationRunFilter(params['generationRun']);
      }
    });
  }

  // Tab navigation
  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;

    if (tabIndex === 2) {
      // Обновлено с 3 на 2, т.к. Inputs вкладка удалена
    }
  }

  // Обработка изменений вкладки
  onTabChange(index: number): void {
    // просто меняем активную вкладку без перехода
    this.activeTab = index;
  }
}
