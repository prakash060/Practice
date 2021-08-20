using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommandPattern
{
    public interface IProductRepository
    {
        Product FindProductById(string productId);
        int GetStockFor(string productId);
        void DecreaseStockBy(string productId, int amount);
        void IncreaseStockBy(string productId, int amount);
        Dictionary<string, (Product product, int stock)> GetProducts();
    }
}
