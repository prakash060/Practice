using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApiUnityContainer.Models;

namespace WebApiUnityContainer.Interfaces
{
     public interface IProductBl
    {
        List<Product> GetAllProducts();
        Product GetProduct(int id);
    }
}
