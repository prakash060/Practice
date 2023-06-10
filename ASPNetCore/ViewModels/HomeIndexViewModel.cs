using ASPNetCore.Models;

namespace ASPNetCore.ViewModels
{
    public class HomeIndexViewModel
    {
        public IEnumerable<Employee> Employees { get; set; }
        public string Title { get; set; }
    }
}
