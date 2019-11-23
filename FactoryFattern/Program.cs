using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FactoryFattern
{
    class Program
    {
        static void Main(string[] args)
        {
            ICar car = CarFactory.GetCarInstance(1);
            var model = car.GetCarModel();
            var color = car.Color;

            Console.WriteLine(model + " ==" + color);
            Console.ReadLine();
        }
    }
}
