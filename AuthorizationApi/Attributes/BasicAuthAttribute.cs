using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace AuthorizationApi.Attributes
{
    public class BasicAuthAttribute : AuthorizationFilterAttribute
    {
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            if (actionContext.Request.Headers.Authorization == null || string.IsNullOrEmpty(actionContext.Request.Headers.Authorization.Parameter))
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }
            else
            {
                var token = actionContext.Request.Headers.Authorization.Parameter;
                var decodedToken = Encoding.UTF8.GetString(Convert.FromBase64String(token));
                var credentials = decodedToken.Split(':');
                var userName = credentials[0];
                var password = credentials[1];
                if (userName == "username" && password == "password")
                {
                    // Thread.CurrentPrincipal = new GenericPrincipal(new GenericIdentity(userName), null);
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Accepted);
                }
                else
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.NoContent);
                }
            }
        }
    }
}