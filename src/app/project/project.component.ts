import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ProjectDashboardComponent } from './dashboard/project-dashboard.component';
import { ProjectInputsComponent } from './inputs/project-inputs.component';
import { ProjectGenerateComponent } from './generate/project-generate.component';
import { ProjectTestCasesComponent } from './test-cases/project-test-cases.component';
import { ProjectSettingsComponent } from './settings/project-settings.component';
import { Project, ProjectStatus } from './shared/project.models';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    ProjectDashboardComponent,
    ProjectInputsComponent,
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

  constructor() {}

  ngOnInit(): void {}

  // Tab navigation
  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }
}
