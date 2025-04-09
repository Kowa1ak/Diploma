import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-about',
  template: '<h1>About</h1>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
