import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IEmployee } from '../employee/employee';
import { Observable } from 'rxjs';

@Injectable()
export class EmployeeService {

  private url = '/assets/data/employees.json';
  constructor(private http: HttpClient) { }

  getEmployees(): Observable<IEmployee[]> {
   return this.http.get<IEmployee[]>(this.url);
  }
}
