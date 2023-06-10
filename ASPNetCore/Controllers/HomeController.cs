using ASPNetCore.Models;
using ASPNetCore.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace ASPNetCore.Controllers
{
    
    public class HomeController : Controller
    {
        private readonly List<Employee> _employees;
        public HomeController()
        {
            var employees = new List<Employee>
            {
                new Employee
                {
                    Id = 1,
                    Name = "Test1",
                    Description = "Test1",
                    Department = "Test Desc1"
                },
                new Employee
                {
                    Id = 2,
                    Name = "Test2",
                    Description = "Test2",
                    Department = "Test Desc2"
                },
                new Employee
                {
                    Id = 3,
                    Name = "Test3",
                    Description = "Test3",
                    Department = "Test Desc3"
                }
            };
            _employees = employees;
        }
        public IActionResult Index()
        {
            HomeIndexViewModel homeIndexViewModel = new()
            {
                Title = "All Employee details",
                Employees = _employees
            };
            return View(homeIndexViewModel);
        }
        public IActionResult Details()
        {
            HomeDetailsViewModel homeDetailsViewModel = new()
            {
                Title = "Employee details",
                Employee = _employees[0]
            };
            return View(homeDetailsViewModel);
        }
        
    }
}
