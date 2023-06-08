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
            LinqBasics.DisplayAllDepartments();
            Console.WriteLine("=====================================================");
            LinqBasics.DisplayAllEmplyees();


            Console.WriteLine("=====================================================");
            LinqBasics.RightOuterJoinUsingExtensionMethod();
            Console.ReadLine();
        }
    }
}
