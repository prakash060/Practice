using System.Collections.Generic;

namespace LinqPractice.Data
{
    public static class SampleData
    {
        public static List<Employee> GetEmployees()
        {
            var employees = new List<Employee>
            {
                new Employee{Id=1, Name="Prakash",City="Naganur", DepartmentId = 1},
                new Employee{Id=2, Name="Nic",City="Gokak", DepartmentId = 6},
                new Employee{Id=3, Name="Manu",City="Naganur"},
                new Employee{Id=4, Name="Clerk",City="Gokak", DepartmentId = 16},
                new Employee{Id=5, Name="John",City="Naganur", DepartmentId = 4},
                new Employee{Id=6, Name="Manu",City="Naganur"},
                new Employee{Id=7, Name="Yash",City="Belgaum", DepartmentId = 3},
                new Employee{Id=8, Name="Shweta",City="Naganur", DepartmentId = 14},
                new Employee{Id=9, Name="John",City="Naganur"}
            };

            return employees;
        }

        public static List<Department> GetDepartments()
        {
            var departments = new List<Department>
            {
                new Department{ Id=1, Name="CS"},
                new Department{ Id=2, Name="EC"},
                new Department{ Id=3, Name="Payroll"},
                new Department{ Id=4, Name="Mechanical"},
                new Department{ Id=5, Name="Auto"},
                new Department{ Id=6, Name="HR"},
                new Department{ Id=7, Name="Civil"},
            };

            return departments;
        }
    }
}
