import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeList } from './components/employee-list/employee-list';

@Component({
  selector: 'app-root',
  imports: [EmployeeList],
  standalone: true,
  template: '<app-employee-list />'
})
export class App {
  protected readonly title = signal('app-employee-list');
}
