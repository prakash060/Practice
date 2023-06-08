using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CommandPattern
{
    public class ShoppingCartRepository : IShoppingCartRepository
    {
        private Dictionary<string, (Product product, int stock)> _cart { get; }
        public ShoppingCartRepository()
        {
            _cart = new Dictionary<string, (Product product, int stock)>();

        }

        public void Add(Product product, int quantity)
        {
            if (!_cart.ContainsKey(product.ProductId))
                _cart.Add(product.ProductId, (product, quantity));
            else
                _cart[product.ProductId] = (_cart[product.ProductId].product, _cart[product.ProductId].stock + quantity);
        }

        public void RemoveAll(Product product)
        {
            if(!_cart.ContainsKey(product.ProductId))
                return;
            _cart.Remove(product.ProductId);

        }

        public void ClearCart()
        {
            _cart.Clear();
        }

        public (Product Product, int quantity) Get(string productId)
        {
            if (string.IsNullOrEmpty(productId) || _cart.ContainsKey(productId))
                return (null,0);

            return _cart[productId];
        }

        public void DecreaseStockBy(string productId, int amount)
        {
            if (!_cart.ContainsKey(productId)) return;
            _cart[productId] = (_cart[productId].product, _cart[productId].stock - amount);
        }

        public void IncreaseStockBy(string productId, int amount)
        {
            if (!_cart.ContainsKey(productId)) return;
            _cart[productId] = (_cart[productId].product, _cart[productId].stock + amount);
        }

        public Dictionary<string, (Product product, int stock)> GetCart()
        {
            return _cart;
        }
    }
}