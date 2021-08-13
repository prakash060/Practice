using LinqPractice.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LinqPractice
{
    class Program
    {
        static void Main(string[] args)
        {
            
            Console.WriteLine("=====================================================");
            LinqBasics.DisplayAllEmplyees();
            Console.WriteLine("=====================================================");
            var emps = SampleData.GetEmployees().Distinct();
            foreach (var e in emps)
            {
                Console.WriteLine($"{e.Id}\t{e.Name}\t{e.DepartmentId}");
            }

            Console.ReadLine();
        }
    }
}
