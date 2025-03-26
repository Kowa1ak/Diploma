import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  fullText: string = 'CASE BUILDER AI'; // изменено для печати "CASE BUILDER AI"
  typingSpeedMs: number = 50; // Скорость печати
  cursorBlinkSpeedCss: string = '0.7s'; // Скорость мигания курсора

  typedText: string = '';
  showCursor: boolean = false; // Начинаем без курсора, пока не начнется печать
  private typingTimeoutId: any = null;

  ngOnInit(): void {
    // Устанавливаем CSS переменную для скорости мигания
    document.documentElement.style.setProperty(
      '--cursor-blink-speed',
      this.cursorBlinkSpeedCss
    );
    this.startTyping();
  }

  startTyping(): void {
    let currentIndex = 0;
    this.typedText = '';
    this.showCursor = true; // Показываем курсор в начале печати

    clearTimeout(this.typingTimeoutId); // Очищаем предыдущий таймер печати, если есть

    // Задержка перед началом печати
    this.typingTimeoutId = setTimeout(() => {
      const typeLetter = () => {
        if (currentIndex < this.fullText.length) {
          this.typedText = this.fullText.slice(0, currentIndex + 1);
          currentIndex++;
          this.typingTimeoutId = setTimeout(typeLetter, this.typingSpeedMs);
        } else {
          // Печать завершена
          this.typingTimeoutId = null;
          this.showCursor = false;
        }
      };
      typeLetter(); // Начинаем печатать после задержки
    }, 1000); // Задержка в 1 секунду
  }

  onJoinClick(): void {
    console.log('Join clicked!');
    // Можно добавить логику сюда
  }
}
