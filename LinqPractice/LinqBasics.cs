using LinqPractice.Data;
using System;
using System.Linq;

namespace LinqPractice
{
    public static class LinqBasics
    {
        public static void DisplayAllEmplyees()
        {
            var employees = SampleData.GetEmployees();
            foreach (var emp in employees)
            {
                Console.WriteLine($"{emp.Id}\t{emp.Name}\t\t{emp.City}\t\t{emp.DepartmentId}");
            }
        }

        public static void DisplayAllDepartments()
        {
            var departments = SampleData.GetDepartments();
            foreach (var dept in departments)
            {
                Console.WriteLine($"{dept.Id}\t{dept.Name}");
            }
        }

        public static void DisplayGroupJoinUsingExtensionMethod()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var groups = departments.GroupJoin(employees,
                                            d => d.Id,
                                            e => e.DepartmentId,
                                            (department, employee) => new
                                            {
                                                Employees = employee,
                                                Department = department
                                            });
            foreach (var group in groups)
            {
                Console.WriteLine($"{group.Department.Id}\t{group.Department.Name}");
                foreach (var emp in group.Employees)
                {
                    Console.WriteLine($"\t{emp.Id}\t{emp.Name}\t\t{emp.City}\t\t{emp.DepartmentId}");
                }
            }
        }

        public static void DisplayGroupJoinUsingSqlLikeSyntax()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var groups = from d in departments
                         join e in employees
                         on d.Id equals e.DepartmentId into eGroup
                         select new
                         {
                             Department = d,
                             Employees = eGroup
                         };

            foreach (var group in groups)
            {
                Console.WriteLine($"{group.Department.Id}\t{group.Department.Name}");
                foreach (var emp in group.Employees)
                {
                    Console.WriteLine($"\t{emp.Id}\t{emp.Name}\t\t{emp.City}\t\t{emp.DepartmentId}");
                }
            }
        }

        public static void DisplayJoinUsingExtensionMethod()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var groups = employees.Join(departments,
                                        e => e.DepartmentId,
                                        d => d.Id,
                                        (emp, dept) => new
                                        {
                                            Employee = emp,
                                            Department = dept
                                        });

            foreach (var group in groups)
            {
                Console.WriteLine($"{group.Employee.Name}\t {group.Department.Name}");
            }
        }

        public static void DisplayJoinUsingSqlLikeSyntax()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var groups = from e in employees
                         join d in departments
                         on e.DepartmentId equals d.Id
                         select new
                         {
                             Employee = e,
                             Department = d
                         };

            foreach (var group in groups)
            {
                Console.WriteLine($"{group.Employee.Name}\t {group.Department.Name}");
            }
        }

        public static void DisplayGroupByUsingExtensionMethod()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var groups = employees.Join(departments,
                                        e => e.DepartmentId,
                                        d => d.Id,
                                        (e,d) => new 
                                        { 
                                            employee = e,
                                            department = d
                                        }).GroupBy(x => x.department.Name);


            foreach (var group in groups)
            {
                Console.WriteLine($"{group.Key}\t\t {group.Count()}");
            }
        }

        public static void DisplayGroupByUsingSqlLikeSyntax()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var groups = from e in employees
                         join d in departments
                         on e.DepartmentId equals d.Id
                         select new
                         {
                             Department = d,
                             Employee = e
                         };
            var result = from g in groups
                         group g by g.Department;
                         

            foreach (var group in result)
            {
                Console.WriteLine($"{group.Key.Name}\t\t {group.Count()}");
            }
        }

        public static void LeftOuterJoinUsingExtensionMethod()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var result = employees.GroupJoin(departments,
                                             e => e.DepartmentId,
                                             d => d.Id,
                                             (emp, depts) => new
                                             {
                                                 emp,
                                                 depts
                                             })
                                             .SelectMany(z => z.depts.DefaultIfEmpty(),
                                                        (a,b) => new 
                                                        {
                                                           employee = a,
                                                           department = b ?? new Department { Name = "No Department" },
                                                        });

            foreach (var res in result)
            {
                Console.WriteLine($"{res.employee.emp.Name}\t\t {res.department.Name}");
            }
        }

        public static void LeftOuterJoinUsingSqlLikeSystax()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var result = from e in employees
                         join d in departments
                         on e.DepartmentId equals d.Id into eGroup
                         from g in eGroup.DefaultIfEmpty()
                         select new
                         {
                             Employee = e,
                             Department = g ?? new Department { Name = "No Department"}
                         };

            foreach (var res in result)
            {
                Console.WriteLine($"{res.Employee.Name}\t\t {res.Department.Name}");
            }
        }


        public static void RightOuterJoinUsingExtensionMethod()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var result = departments.GroupJoin(employees,
                                             d => d.Id,
                                             e => e.DepartmentId,
                                             (depts, emp) => new
                                             {
                                                 emp,
                                                 depts
                                             })
                                             .SelectMany(z => z.emp.DefaultIfEmpty(),
                                             (a, b) => new
                                             {
                                                 Department = a.depts ?? new Department { Name = "No Department" },
                                                 Employee = b ?? new Employee { Name = "No Employee" }
                                             });
            foreach (var res in result)
            {
                Console.WriteLine($"{res.Employee.Name}\t\t {res.Department.Name}");
            }
        }

        public static void RightOuterJoinUsingSqlLikeSyntax()
        {
            var employees = SampleData.GetEmployees();
            var departments = SampleData.GetDepartments();
            var result = from d in departments
                         join e in employees
                         on d.Id equals e.DepartmentId into eGroup
                         from g in eGroup.DefaultIfEmpty()
                         select new
                         {
                             depts = d,
                             emp = g ?? new Employee { Name = "No Employee" }
                         };
            foreach (var res in result)
            {
                Console.WriteLine($"{res.emp.Name}\t\t {res.depts.Name}");
            }
        }
    }
}
