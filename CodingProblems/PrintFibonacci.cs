using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodingProblems
{
    internal class PrintFibonacci
    {
        public int Fib(int n)
        {
            if (n <= 1)
            {
                return n;
            }

            return Fib(n - 1) + Fib(n -2);
        }

        public void Fib1(int len)
        {
            int a = 0, b = 1, c;
            Console.Write("{0} {1}", a, b);
            for (int i = 2; i < len; i++)
            {
                c = a + b;
                Console.WriteLine(" {0}", c);
                a = b;
                b = c;
            }

        }

        public void Execute()
        {
            //int n = 100;
            //for (int i = 0; i < n; i++)
            //{
            //    var res = Fib(i);
            //    Console.WriteLine(res);

            //}

            Fib1(100);
            
            Console.WriteLine("Completed.!");
        }
    }
}
