using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp1
{
    internal class EmployeeRepository : Repository<Employee>, IEmployeeRepository
    {
        public Employee GetById(int id)
        {
            throw new NotImplementedException();
        }
    }
}
