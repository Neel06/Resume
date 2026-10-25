import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../models/Employee';
import { CreateEmployee } from '../models/create-employee';
import { environment } from '../../environments/environment';
import { EmployeeQuery, PageResult } from '../models/employee-pagination';

@Injectable({
  providedIn: 'root',
})

export class EmployeeService {
  private http = inject(HttpClient);

  // private apiUrl = 'https://localhost:7141/api/Employees';
  private apiUrl = environment.apiUrl;

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  createEmployee(employee: CreateEmployee): Observable<CreateEmployee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: CreateEmployee): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPagedEmployees(query: EmployeeQuery): Observable<PageResult<Employee>> {
    return this.http.get<PageResult<Employee>>(`${this.apiUrl}/paged`, {
      params: {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        search: query.search,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection
      }
    });
  }

}
