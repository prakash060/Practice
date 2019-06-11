using AuthorizationApi.Attributes;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;

namespace AuthorizationApi.Controllers
{
    [RoutePrefix("api/authentication")]
    public class AuthenticationController : ApiController
    {
        [BasicAuth]
        [HttpPost]
        [Route("BasicAuthentication")]        
        public IHttpActionResult BasicAuthentication()
        {
            return Ok();
        }

        [Route("bearer/validatetoken")]
        [HttpGet]
        public IHttpActionResult OAuthValidateToken(string token)
        {
            return Ok();
        }       
    }
}
