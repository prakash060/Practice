using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    public abstract class AbstractClass
    {
        public void Print()
        {
            Console.WriteLine("Base");
        }

        public abstract void Hello();
    }

    public abstract class Child 
    {
        public abstract void Hello();        
    }

    public interface IABC
    {

    }

    public class Child1 : Child, IABC
    {
        public override void Hello()
        {
            throw new NotImplementedException();
        }       
    }
}
