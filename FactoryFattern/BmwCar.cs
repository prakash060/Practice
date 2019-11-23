using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FactoryFattern
{
    public class BmwCar : ICar
    {
        public string Color
        {
            get { return "Red"; }
        }

        public string GetCarModel()
        {
            return "Mbw model1";
        }
    }
}
