using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    public abstract class Example1
    {
        public Example1()
        {

        }
        public abstract void Method1();
        public void Method2()
        {
            int x = 10;
        }

        public void Method3()
        {
            int y = 10;
        }

        public virtual void Method4()
        {
            int y = 10;
        }
    }

    public abstract class Example2 : Example1
    {
        //public override void Method1();
        public new void Method2()
        {
            int x = 10;
        }

        public override void Method4()
        {
            int y = 20;
        }
    }

    public class Example3 : Example1
    {
        public override void Method1()
        {
            throw new NotImplementedException();
        }         

        public new void Method2()
        {
            int x = 10;
        }

        public override void Method4()
        {
            int y = 20;           
        }
    }
}
