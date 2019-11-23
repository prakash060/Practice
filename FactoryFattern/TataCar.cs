using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FactoryFattern
{
    public class TataCar : ICar
    {
        public string Color
        {
            get { return "Blue"; }
        }

        public string GetCarModel()
        {
            return "Tata model1";
        }
    }
}
