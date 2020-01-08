using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    public interface I1
    {
        void Print();
    }

    public interface I2
    {
        void Print();
    }

    public class InheritanceSample : I1, I2
    {
        void I1.Print()
        {
            Console.WriteLine("I1 print called");
        }

        void I2.Print()
        {
            Console.WriteLine("I2 print called");
        }

        public void Print()
        {
            Console.WriteLine("Class print called");
        }
    }
}
