using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApiUnityContainer.Interfaces;
using WebApiUnityContainer.Models;

namespace WebApiUnityContainer.DatabaseLogic
{
    public class ProductDl : IProductDl
    {
        public List<Product> GetAllProducts()
        {
            return new List<Product>
            {
                new Product{Id = 1, Name = "Product1" },
                new Product{Id = 2, Name = "Product2" },
                new Product{Id = 3, Name = "Product3" },
                new Product{Id = 4, Name = "Product4" },
                new Product{Id = 5, Name = "Product5" },
                new Product{Id = 6, Name = "Product6" }
            };
        }

        public Product GetProduct(int id)
        {
            throw new NotImplementedException();
        }
    }
}