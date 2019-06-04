using AuthorizationApi.Attributes;
using System.Web.Http;

namespace AuthorizationApi.Controllers
{
    [RoutePrefix("api/authentication")]
    public class AuthenticationController : ApiController
    {
        [Route("basic")]
        [BasicAuth]
        [HttpGet]
        public IHttpActionResult BasicAuthentication(string userName, string password)
        {
            return Ok();
        }
        
        [HttpGet]
        [Authorize]
        public IHttpActionResult GetEmployee()
        {
            return Ok("Hello P");
        }

        [Route("bearer/validatetoken")]
        [HttpGet]
        public IHttpActionResult OAuthValidateToken(string token)
        {
            return Ok();
        }
    }
}
