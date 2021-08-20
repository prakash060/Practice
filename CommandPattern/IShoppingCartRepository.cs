using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommandPattern
{
    public interface IShoppingCartRepository
    {
        (Product Product, int quantity) Get(string productId);
        void Add(Product product, int quantity);
        void RemoveAll(Product product);
        void ClearCart();
        void DecreaseStockBy(string productId, int amount);
        void IncreaseStockBy(string productId, int amount);
        Dictionary<string, (Product product, int stock)> GetCart();
    }
}
