import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef, // добавлено
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BenefitCard } from './benefit-card.model';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      title: 'AI Integration',
      description: 'Leverage the power of AI to enhance your workflows.',
      icon: 'assets/icon/ai_icon.png',
    },
    {
      title: 'Time Saving',
      description: 'Reduce manual effort and save valuable time.',
      icon: 'assets/icon/time_icon.png',
    },
  ];

  constructor(
    private router: Router,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {} // изменено

  ngOnInit(): void {
    // Устанавливаем CSS переменную для скорости мигания
    document.documentElement.style.setProperty(
      '--cursor-blink-speed',
      this.cursorBlinkSpeedCss
    );
    this.startTyping();
  }

  ngAfterViewInit(): void {
    if (this.parallaxCanvas && this.parallaxCanvas.nativeElement) {
      const canvas = this.parallaxCanvas.nativeElement;
      this.ctx = canvas.getContext('2d');

      if (!this.ctx) {
        console.error('НЕ УДАЛОСЬ ПОЛУЧИТЬ 2D КОНТЕКСТ!');
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      this.points = [];
      for (let i = 0; i < this.numPoints; i++) {
        this.points.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
        });
      }

      this.draw();
    } else {
      console.error('parallaxCanvas НЕ НАЙДЕН в ngAfterViewInit!');
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  startTyping(): void {
    let currentIndex = 0;
    this.typedText = '';
    this.showCursor = true;

    clearTimeout(this.typingTimeoutId);

    this.typingTimeoutId = setTimeout(() => {
      const typeLetter = () => {
        if (currentIndex < this.fullText.length) {
          this.typedText = this.fullText.slice(0, currentIndex + 1);
          this.cdr.markForCheck(); // добавлено для обновления отображения
          currentIndex++;
          this.typingTimeoutId = setTimeout(typeLetter, this.typingSpeedMs);
        } else {
          this.typingTimeoutId = null;
          this.showCursor = false;
          this.cdr.markForCheck(); // добавлено для финального обновления
        }
      };
      typeLetter();
    }, 1000);
  }

  draw = () => {
    if (
      !this.ctx ||
      !this.parallaxCanvas ||
      !this.parallaxCanvas.nativeElement
    ) {
      console.error('Canvas context or element not available for drawing.');
      cancelAnimationFrame(this.animationFrameId);
      return;
    }

    const canvas = this.parallaxCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = 'black';

    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
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

    this.animationFrameId = requestAnimationFrame(this.draw);
  };

  onJoinClick(): void {
    this.router.navigate(['/sign-up']);
  }

  onNewProjectClick(): void {
    this.router.navigate(['/new-project']);
  }

  onSettingsClick(): void {
    this.router.navigate(['/settings']);
  }
}
