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
            LinqBasics.RightOuterJoinUsingExtensionMethod();
            Console.WriteLine("=====================================================");
            LinqBasics.RightOuterJoinUsingSqlLikeSyntax();

            Console.ReadLine();
        }
    }
}
