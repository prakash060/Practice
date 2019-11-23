using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApiUnityContainer.Interfaces;

namespace WebApiUnityContainer.Controllers
{
    //http://localhost:51788/api/unity/get-products

    [RoutePrefix("api/unity")]
    public class ExController : ApiController
    {
        private readonly IProductBl _productBl;
        public ExController(IProductBl productBl)
        {
            _productBl = productBl;
        }

        [HttpGet]
        [Route("get-products")]
        public IHttpActionResult GetAllProducts()
        {
            var products = _productBl.GetAllProducts();
            return Ok(products);
        }

        [HttpGet]
        [Route("get-product/{id}")]
        public IHttpActionResult GetAllProduct(int id)
        {
            var product = _productBl.GetProduct(id);
            return Ok(product);
        }
    }
}
