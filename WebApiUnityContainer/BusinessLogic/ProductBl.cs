using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApiUnityContainer.Interfaces;
using WebApiUnityContainer.Models;

namespace WebApiUnityContainer.BusinessLogic
{
    public class ProductBl : IProductBl
    {
        private readonly IProductDl _productDl;
        public ProductBl(IProductDl productDl)
        {
            _productDl = productDl;
        }
        public List<Product> GetAllProducts()
        {
            return _productDl.GetAllProducts();
        }

        public Product GetProduct(int id)
        {
           return _productDl.GetAllProducts().FirstOrDefault(x => x.Id == id);
        }
    }
}