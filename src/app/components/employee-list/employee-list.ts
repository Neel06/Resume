import { Component, OnInit, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateEmployee } from '../../models/create-employee';
import { EmployeeService } from '../../services/employee';
import { EmployeeForm } from '../employee-form/employee-form';
import { Observable, filter, finalize } from 'rxjs';
import { Employee } from '../../models/Employee';
import { ApiErrorService } from '../../services/api-error';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [EmployeeForm],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EmployeeList implements OnInit {

  private employeeService = inject(EmployeeService);
  private readonly apiError = inject(ApiErrorService);

  // Employee data and request state.
  employees = signal<Employee[]>([]);
  loading = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);

  // Selected employee for editing.
  editingEmployee = signal<Employee | null>(null);

  // Increment to request a form reset.
  formVersion = signal(0);

  // UI messages.
  error = signal('');
  formError = signal('');
  deleteError = signal('');
  success = signal('');

  // Derived state shared with the child component.
  busy = computed(
    () => this.saving() || this.deletingId() !== null
  );

  ngOnInit(): void {
    this.loadEmployees();
  }

  // GET: Load all employees.
  loadEmployees(): void {
    this.loading.set(true);
    this.error.set('');

    this.employeeService.getEmployees()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (data: Employee[]) => {
          this.employees.set(data);
        },
        error: () => {
          this.error.set('Unable to load employees.');
        }
      });
  }

  // SELECT: Enter Edit mode.
  startEdit(employee: Employee): void {
    if (this.busy()) {
      return;
    }

    this.editingEmployee.set(employee);
    this.formVersion.update(version => version + 1);

    this.formError.set('');
    this.success.set('');
  }

  // CANCEL: Return to Create mode.
  cancelEdit(): void {
    if (this.busy()) {
      return;
    }

    this.editingEmployee.set(null);
    this.formVersion.update(version => version + 1);

    this.formError.set('');
    this.success.set('');
  }

  // POST / PUT: Save employee.
  saveEmployee(employee: CreateEmployee): void {
    if (this.busy()) {
      return;
    }

    this.formError.set('');
    this.success.set('');

    const id = this.editingEmployee()?.emp_Id ?? null;

    this.saving.set(true);

    const request$: Observable<unknown> = id === null
      ? this.employeeService.createEmployee(employee)
      : this.employeeService.updateEmployee(id, employee);

    request$
      .pipe(
        finalize(() => {
          this.saving.set(false);
        })
      )
      .subscribe({
        next: () => {
          const message = id === null ? 'Employee added successfully!' : 'Employee updated successfully!';

          this.editingEmployee.set(null);
          this.formVersion.update(version => version + 1);

          this.success.set(message);
          this.loadEmployees();
        },

        error: (err: HttpErrorResponse) => {
          if (err.status === 400) {
            const errors = err.error?.errors as Record<string, string[]> | undefined;

            const firstMessage = errors
              ? Object.values(errors).flat().find(message => typeof message === 'string') : undefined;

            this.formError.set(firstMessage ?? 'Please check the employee details.');

          } else if (err.status === 409) {
            this.formError.set('This email is already registered.');

          } else if (err.status === 404) {
            this.formError.set('Employee not found. Refresh the list.');

          } else {
            this.formError.set('Failed to save employee.');
          }
        }
      });
  }

  // DELETE: Remove employee.
  deleteEmployee(employee: Employee): void {
    if (this.busy()) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${employee.name}?`);

    if (!confirmed) {
      return;
    }

    this.deleteError.set('');
    this.success.set('');
    this.deletingId.set(employee.emp_Id);

    this.employeeService.deleteEmployee(employee.emp_Id)
    .pipe(finalize(()=>{
      this.deletingId.set(null);
    }))
      .subscribe({
        next: () => {
          
          // Reset form if we deleted the employee being edited.
          if (this.editingEmployee()?.emp_Id === employee.emp_Id) {
            this.editingEmployee.set(null);
            this.formVersion.update(version => version + 1);
            this.formError.set('');
          }

          this.success.set(`${employee.name} deleted successfully!`);

          this.loadEmployees();
        },

        error: (err: HttpErrorResponse) => {

          if (err.status === 404) {
            this.deleteError.set('Employee not found. Refresh the list.');
          } else {
            this.deleteError.set('Failed to delete employee.');
          }
        }
      });
  }
}
