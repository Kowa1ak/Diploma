import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestFilterService {
  // Источники данных (BehaviorSubject) для разных фильтров
  private generationRunFilterSource = new BehaviorSubject<string>('');

  // Наблюдаемые потоки для компонентов
  generationRunFilter$ = this.generationRunFilterSource.asObservable();

  constructor() {}

  // Методы для установки фильтров
  setGenerationRunFilter(runId: string): void {
    this.generationRunFilterSource.next(runId);
  }

  // Метод для сброса всех фильтров
  resetFilters(): void {
    this.generationRunFilterSource.next('');
  }
}
