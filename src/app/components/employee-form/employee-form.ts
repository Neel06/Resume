import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../models/Employee';
import { CreateEmployee } from '../../models/create-employee';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeForm {
  private fb = inject(FormBuilder);

  //Data Received from the Parent
  employee = input<Employee | null>(null);
  busy = input(false);
  error = input('');
  formVersion = input(0);

  //Events sent to the parent
  saveRequested = output<CreateEmployee>();
  cancelRequested = output<void>();

  //The Reactive form own by this component;
  employeeForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    department: ['', [Validators.required, Validators.maxLength(50)]],
    salary: [0, [Validators.required, Validators.min(0), Validators.max(9999999999.99),
    Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]]
  });

  constructor() {
    //Synchronize parent input with the this Reactive form (Child's form)

    effect(() => {
      const selected = this.employee();

      this.formVersion(); //Re-run when the parent requests for the form reset;

      if (selected === null) {
        this.employeeForm.reset();
        return;
      }
      this.employeeForm.reset({
        name: selected.name,
        email: selected.email,
        department: selected.department,
        salary: selected.salary
      });
    });
  }

  submitForm(): void {
    if (this.busy()) {
      return;
    }
    //Normalize input before validating it. [Trim the values]
    const raw = this.employeeForm.getRawValue();
    this.employeeForm.patchValue({
      name: raw.name.trim(),
      department: raw.department.trim(),
      email: raw.email.trim()
    });

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const value = this.employeeForm.getRawValue();
    const employee: CreateEmployee = {
      name: value.name,
      email: value.email,
      department: value.department,
      salary: value.salary
    };

    this.saveRequested.emit(employee); //Notifies the parent.[Push the employee object to parent]  
  }

  cancel(): void {
    if (this.busy()) {
      return;
    }
    this.cancelRequested.emit();
  }
  
}
