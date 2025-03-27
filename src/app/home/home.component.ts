import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BenefitCard } from './benefit-card.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  fullText: string = 'CASE BUILDER AI'; // изменено для печати "CASE BUILDER AI"
  typingSpeedMs: number = 50; // Скорость печати
  cursorBlinkSpeedCss: string = '0.7s'; // Скорость мигания курсора

  typedText: string = '';
  showCursor: boolean = false; // Начинаем без курсора, пока не начнется печать
  private typingTimeoutId: any = null;
  @ViewChild('parallaxCanvas', { static: false }) parallaxCanvas!: ElementRef;
  private ctx: any;
  private points: any[] = [];
  private numPoints: number = 100;
  private animationFrameId: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;

  benefitCards: BenefitCard[] = [
    {
      title: 'Automation',
      description: 'Automate repetitive tasks and streamline your workflow.',
      icon: 'assets/icon/automation_icon.png',
    },
    {
      title: 'Flexibility',
      description: 'Adapt to changing requirements with ease.',
      icon: 'assets/icon/flexibility_icon.png',
    },
    {
      title: 'Integrations',
      description: 'Seamlessly integrate with your existing tools and systems.',
      icon: 'assets/icon/ai_icon.png',
    },
    {
      title: 'Time Saving',
      description: 'Reduce manual effort and save valuable time.',
      icon: 'assets/icon/time_icon.png',
    },
  ];

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  ngOnInit(): void {
    // Устанавливаем CSS переменную для скорости мигания
    document.documentElement.style.setProperty(
      '--cursor-blink-speed',
      this.cursorBlinkSpeedCss
    );
    this.startTyping();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called'); // Можно оставить для проверки
    if (this.parallaxCanvas && this.parallaxCanvas.nativeElement) {
      const canvas = this.parallaxCanvas.nativeElement;
      this.ctx = canvas.getContext('2d');
      console.log('Canvas Context:', this.ctx); // Можно оставить

      if (!this.ctx) {
        console.error('НЕ УДАЛОСЬ ПОЛУЧИТЬ 2D КОНТЕКСТ!');
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log(
        `Canvas dimensions set to: ${canvas.width} x ${canvas.height}`
      ); // Можно оставить

      // Возвращаем инициализацию точек
      this.points = []; // Очищаем на всякий случай, если AfterViewInit вызовется повторно
      for (let i = 0; i < this.numPoints; i++) {
        this.points.push({
          x: Math.random() * canvas.width, // Используем canvas.width/height
          y: Math.random() * canvas.height,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
        });
      }
      console.log(`Initialized ${this.points.length} points`); // Лог для проверки

      // Запускаем анимацию
      this.draw();
      console.log('Draw loop started'); // Лог для проверки
    } else {
      console.error('parallaxCanvas НЕ НАЙДЕН в ngAfterViewInit!'); // Эта ошибка больше не должна появляться
    }
  }

  // Пока не вызываем draw из AfterViewInit, закомментируйте или удалите вызов this.draw() оттуда
  // Также можно временно закомментировать ngOnDestroy и requestAnimationFrame в draw

  // draw = () => { ... } // Оставляем саму функцию draw, но не вызываем ее

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
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

  draw = () => {
    // Проверяем, есть ли контекст и элемент canvas перед рисованием
    if (
      !this.ctx ||
      !this.parallaxCanvas ||
      !this.parallaxCanvas.nativeElement
    ) {
      console.error('Canvas context or element not available for drawing.');
      // Можно отменить анимацию, если контекста нет
      cancelAnimationFrame(this.animationFrameId);
      return;
    }

    const canvas = this.parallaxCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = 'black'; // Цвет точек

    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      p.x += p.speedX;
      p.y += p.speedY;

      // Возвращаем точки на экран, если они выходят за границы
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      // Убедимся, что точки остаются в пределах видимости после отражения
      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); // Изменяем радиус на 5
      this.ctx.fill();
    }

    for (let i = 0; i < this.points.length; i++) {
      for (let j = i + 1; j < this.points.length; j++) {
        let dx = this.points[i].x - this.points[j].x;
        let dy = this.points[i].y - this.points[j].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance / 100})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[i].x, this.points[i].y);
          this.ctx.lineTo(this.points[j].x, this.points[j].y);
          this.ctx.stroke();
        }
      }
    }

    // Рисуем линию от курсора к ближайшей точке
    let closestPoint = null;
    let closestDistance = Infinity;
    for (let i = 0; i < this.points.length; i++) {
      let dx = this.mouseX - this.points[i].x;
      let dy = this.mouseY - this.points[i].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = this.points[i];
      }
    }

    if (closestPoint && closestDistance < 150) {
      this.ctx.strokeStyle = `rgba(0, 0, 0, ${1 - closestDistance / 150})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(this.mouseX, this.mouseY);
      this.ctx.lineTo(closestPoint.x, closestPoint.y);
      this.ctx.stroke();
    }

    // Запрашиваем следующий кадр анимации
    this.animationFrameId = requestAnimationFrame(this.draw);
  };

  onJoinClick(): void {
    console.log('Join clicked!');
    // Можно добавить логику сюда
  }
}
