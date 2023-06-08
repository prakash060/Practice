using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SolidPriciples
{
    public class LiskovSubstitutePriciple
    {
        public static int Area(Rectanle r)
        {
            return r.Width * r.Height;
        }

        public static void Execute()
        {
            Rectanle rectangle = new Rectanle(2, 4);
            Rectanle square = new Square();
            square.Width = 10;
            Console.WriteLine($"{rectangle} has area  - {Area(rectangle)}");
            Console.WriteLine($"{square} has area  - {Area(square)}");
        }
    }

    public class Rectanle
    {
        //public int Height { get; set; }
        //public int Width { get; set; }

        public virtual int Height { get; set; }
        public virtual int Width { get; set; }
        public Rectanle() { }
        public Rectanle(int width, int height)
        {
            Width = width;
            Height = height;
        }

        public override string ToString()
        {
            return $"Width: {Width} and Height: {Height}";
        }
    }

    public class Square : Rectanle
    {
        //public new int Width
        //{
        //    set
        //    {
        //        base.Width = base.Height = value;
        //    }
        //}
        //public new int Height
        //{
        //    set
        //    {
        //        base.Width = base.Height = value;
        //    }
        //}

        public override int Width
        {
            set
            {
                base.Width = base.Height = value;
            }
        }
        public override int Height
        {
            set
            {
                base.Width = base.Height = value;
            }
        }
    }
}
