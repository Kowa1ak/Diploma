import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
  changeDetection: ChangeDetectionStrategy.OnPush, // добавлено
})
export class LoginComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialization logic here
  }

  login() {}
}
