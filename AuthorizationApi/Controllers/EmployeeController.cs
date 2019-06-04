using AuthorizationApi.Attributes;
using System.Collections.Generic;
using System.Web.Http;

namespace AuthorizationApi.Controllers
{
    [RoutePrefix("api/employee")]
    public class EmployeeController : ApiController
    {  
        [BasicAuth]
        public IHttpActionResult GetEmployees()
        {
            var employees = new List<string> {"Prakash","Shweta","Manu" };
            return Ok(employees);
        }
    }
}
