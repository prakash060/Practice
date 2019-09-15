using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    class Program
    {
        static void Main(string[] args)
        {
            Class1 obj = new Class2();
        }
    }

    abstract class Class1
    {
        public Class1()
        {

        }
    }

    class Class2 : Class1
    {
        public Class2()
        {

        }
    }
}
