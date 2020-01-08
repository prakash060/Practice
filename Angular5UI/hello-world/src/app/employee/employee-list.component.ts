import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.sass']
})
export class EmployeeListComponent implements OnInit {

  public empList = [];
  constructor(private empService: EmployeeService) { }

  ngOnInit() {
    this.empService.getEmployees().subscribe(data => this.empList = data);
  }

}
