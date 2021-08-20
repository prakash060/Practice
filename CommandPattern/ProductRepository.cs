using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CommandPattern
{
    public class ProductRepository : IProductRepository
    {
        private Dictionary<string, (Product product, int stock)> _products { get; }
        public ProductRepository()
        {
            _products = new Dictionary<string, (Product product, int stock)>();
            Add(new Product { ProductId = "DellLaptop", Name = "Dell Laptop", Discription = "Dell laptop with 500GB HD" }, 10);
            Add(new Product { ProductId = "SamsungMob", Name = "Samsung Mobile", Discription = "Samsung mobile 128GB" }, 5);
            Add(new Product { ProductId = "SonyTv", Name = "Sony Tv", Discription = "Sony Tv- 55 inch LED" }, 3);
            Add(new Product { ProductId = "DellPc", Name = "Dell PC", Discription = "Dell PC with 15 inch monotor, Gaming" }, 8);
            Add(new Product { ProductId = "SonataWatch", Name = "Sonata Watch", Discription = "Sonata watch - digital" }, 6);
        }

        private void Add(Product product, int stock)
        {
            if (product == null || stock <= 0)
                return;

            _products[product.ProductId] = (product, stock);
        }

        public Product FindProductById(string productId)
        {
            if (!_products.ContainsKey(productId)) return null;
            return _products[productId].product;
        }

        public int GetStockFor(string productId)
        {
            if (!_products.ContainsKey(productId)) return 0;
            return _products[productId].stock;
        }

        public void DecreaseStockBy(string productId, int amount)
        {
            if (!_products.ContainsKey(productId)) return;
            _products[productId] = (_products[productId].product, _products[productId].stock - amount);
        }

        public void IncreaseStockBy(string productId, int amount)
        {
            if (!_products.ContainsKey(productId)) return;
            _products[productId] = (_products[productId].product, _products[productId].stock + amount);
        }

        public Dictionary<string, (Product product, int stock)> GetProducts()
        {
            return _products;
        }
    }
}