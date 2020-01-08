using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CommonApi.Controllers
{
    [RoutePrefix("api/queue")]
    public class QueueController : ApiController
    {        
        public IHttpActionResult Post(int id)
        {
            return Ok();
        }
    }
}
