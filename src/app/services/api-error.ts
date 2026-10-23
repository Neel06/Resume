import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';


export type ApiAction = 'load' | 'save' | 'delete';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  getMessage(error: unknown, action: ApiAction): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Unexpected error occured.'
    }

    //Network, CORS, or connection related failures.
    if (error.status === 0) {
      return 'Unable to connected to the server. Please try again!'
    }

    if (error.status === 400) {
      const validationMessage = this.getFirstValidationError(error.error);

      return validationMessage ?? 'Please check the employee details.'
    }

    //Business Conflict
    if (error.status === 409) {
      return 'This email is already registered.';
    }

    if (error.status === 404) {
      return action == 'load' ? 'Employee data was not found.' : 'Employee not found. Refresh the list.';
    }

    if (error.status >= 500) {
      return 'Server side failure.'
    }

    // Fallback.
    switch (action) {
      case 'load':
        return 'Unable to load employees.';

      case 'save':
        return 'Failed to save employee.';

      case 'delete':
        return 'Failed to delete employee.';
    }
  }

  private getFirstValidationError(body: unknown): string | null {

    if (!body || typeof body !== 'object') {
      return null;
    }

    const response = body as { errors?: Record<string, unknown> };

    const errors = response.errors;

    if (!errors || typeof errors !== 'object') {
      return null;
    }

    for (const value of Object.values(errors)) {
      if (Array.isArray(value)) {
        const message = value.find(
          item => typeof item === 'string'
        );

        if (typeof message === 'string') {
          return message;
        }
      }
    }
    return null;
  }
}
