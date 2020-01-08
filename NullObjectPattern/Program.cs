using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NullObjectPattern
{
    class Program
    {
        static void Main(string[] args)
        {
            Print(new Employee());

            Console.ReadLine();
        }

        private static void Print(Employee employee)
        {
            Console.WriteLine(employee.ToString());
        }
    }

    public class Employee
    {
        public int Id { get; set; } = -1;
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; } = -1;

        public override string ToString()
        {
            return $"Id is : {Id}, Name is : {Name.Split(',')}, Age is : {Age}";
        }
    }
}
