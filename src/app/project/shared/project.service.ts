import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, TestCase } from './project.models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  getProject(id: string): Observable<Project> {
    return this.http.get<any>(`/api/projects/${id}`);
  }

  getTestCases(projectId: string): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`/api/projects/${projectId}/testcases`);
  }

  // Создать новый тест-кейс в проекте
  createTestCase(
    projectId: string,
    tc: Partial<TestCase>
  ): Observable<TestCase> {
    return this.http.post<TestCase>(`/api/projects/${projectId}/testcases`, tc);
  }
}
