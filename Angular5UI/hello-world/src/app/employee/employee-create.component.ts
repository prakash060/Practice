// import { Component, OnInit } from '@angular/core';
// import {FormGroup, FormControl} from '@angular/forms'

// @Component({
//   selector: 'app-employee-create',
//   templateUrl: './employee-create.component.html',
//   styleUrls: ['./employee-create.component.sass']
// })
// export class EmployeeCreateComponent implements OnInit {
//   employeeForm : FormGroup;
//   constructor() { }

//   ngOnInit() {
//     this.employeeForm = new FormGroup({
//       fullName : new FormControl(),
//       email : new FormControl(),
//       skills: new FormGroup({
//         skillName: new FormControl(),
//         experienceInYear: new FormControl(),
//         proficiency: new FormControl()
//       })
//     });
//   }

//   onSubmit() : void{
//     console.log(this.employeeForm.value);
//     console.log(this.employeeForm.dirty);
//     console.log(this.employeeForm.controls.fullName.value);
//     console.log(this.employeeForm.controls.fullName.touched);
//   }

//   onLoadDataClick() : void {
//     this.employeeForm.setValue({
//       fullName : 'Prakash Betageri',
//       email : 'prakash.betageri@gmail.com',
//       skills : {
//         skillName : 'C#',
//         experienceInYear : 6,
//         proficiency : 'intermediate'
//       }
//     });
//   }

//   onLoadPartialDataClick() : void {
//     this.employeeForm.patchValue({
//       fullName : 'Prakash Betageri',
//       email : 'prakash.betageri@gmail.com',
//       skills : {
//         skillName : 'C#'        
//       }
//     });
//   }
// }

//if you want to use FormBuilder to create form use below code

import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms'

@Component({
  selector: 'app-employee-create',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.sass']
})
export class EmployeeCreateComponent implements OnInit {
  employeeForm : FormGroup;
  fullNameLength = 0;
  //FormBuilder is an service provided by angular. So inject it in the constructor
  constructor(private fb : FormBuilder) { }

  ngOnInit() {
    this.employeeForm = this.fb.group({
      fullName : ['',[Validators.required,Validators.minLength(2),Validators.maxLength(10)]],
      email : [''],
      skills: this.fb.group({
        skillName: [''],
        experienceInYear: [''],
        proficiency: ['beginner']
      })
    });

    this.employeeForm.get('fullName').valueChanges.subscribe((value : string) => {
      this.fullNameLength = value.length;
    });
  }

  onSubmit() : void{
    console.log(this.employeeForm.value);
    console.log(this.employeeForm.dirty);
    console.log(this.employeeForm.controls.fullName.value);
    console.log(this.employeeForm.controls.fullName.touched);
  }

  onLoadDataClick() : void {
    this.employeeForm.setValue({
      fullName : 'Prakash Betageri',
      email : 'prakash.betageri@gmail.com',
      skills : {
        skillName : 'C#',
        experienceInYear : 6,
        proficiency : 'intermediate'
      }
    });
  }

  onLoadPartialDataClick() : void {
    this.employeeForm.patchValue({
      fullName : 'Prakash Betageri',
      email : 'prakash.betageri@gmail.com',
      skills : {
        skillName : 'C#'        
      }
    });
  }

  logAllControls(group : FormGroup) : void {    
    Object.keys(group.controls).forEach((key : string) => {
      const abstractControl = group.get(key);
      if(abstractControl instanceof FormGroup)
      {
        this.logAllControls(abstractControl);
      }
      else
      {
        console.log('key = ' + key + 'value = ' + abstractControl.value);
      }
    });
  }

  disableAllControls(group : FormGroup) : void {    
    Object.keys(group.controls).forEach((key : string) => {
      const abstractControl = group.get(key);
      if(abstractControl instanceof FormGroup)
      {
        this.disableAllControls(abstractControl);
      }
      else
      {
         abstractControl.disable();
        
      }
    });
  }

  onLogAllControls() : void {
    this.logAllControls(this.employeeForm);
  }
  onDisableAllControls() : void {
    this.disableAllControls(this.employeeForm);
  }
}