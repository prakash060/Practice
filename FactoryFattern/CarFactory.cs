using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FactoryFattern
{
    public static class CarFactory
    {
        public static ICar GetCarInstance(int id)
        {
            switch (id)
            {
                case 1:
                    return new BmwCar();
                case 2:
                    return new TataCar();
                default:
                    return null;
            }
        }
    }
}
