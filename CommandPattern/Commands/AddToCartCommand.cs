using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CommandPattern.Commands
{
    public class AddToCartCommand : ICommand
    {
        private readonly IShoppingCartRepository _shoppingCartRepository;
        private readonly IProductRepository _productRepository;
        private readonly Product _product;

        public AddToCartCommand(IShoppingCartRepository shoppingCartRepository, IProductRepository productRepository, Product product)
        {
            _shoppingCartRepository = shoppingCartRepository;
            _productRepository = productRepository;
            _product = product;
        }
        public bool CanExecute()
        {
            if (_product == null) return false;
            return _productRepository.GetStockFor(_product.ProductId) > 0;
        }

        public void Execute()
        {
            if (_product == null) return;
            _productRepository.DecreaseStockBy(_product.ProductId, 1);
            _shoppingCartRepository.Add(_product, 1);
        }

        public void Undo()
        {
            if (_product == null) return;

            var item = _shoppingCartRepository.Get(_product.ProductId);
            _productRepository.IncreaseStockBy(_product.ProductId, item.quantity);
            _shoppingCartRepository.RemoveAll(_product);
        }
    }
}