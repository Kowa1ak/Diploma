import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { SettingsComponent } from './settings/settings.component';
import { AllProjectComponent } from './all-project/all-project.component';
import { ProjectComponent } from './project/project.component';
import { TestCaseViewComponent } from './project/test-case-view/test-case-view.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'new-project', component: NewProjectComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'about',
    loadChildren: () =>
      import('./about/about.module').then((m) => m.AboutModule),
  },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'all-project', component: AllProjectComponent },
  { path: 'project/:id', component: ProjectComponent },
  { path: 'project/test-case/:id', component: TestCaseViewComponent },
  { path: '**', redirectTo: 'home' },
];
