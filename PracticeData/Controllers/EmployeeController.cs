using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace PracticeData.Controllers
{
    [RoutePrefix("api/employee")]
    public class EmployeeController : ApiController
    {
        [Route("GetEmployees")]
        [HttpGet]        
        public IHttpActionResult GetEmployees()
        {
            var employees = new List<Employee>
            {
                new Employee{Id=1, Name="Prakash",City="Naganur"},
                new Employee{Id=1, Name="Shweta",City="Naganur"},
                new Employee{Id=1, Name="Manu",City="Naganur"},
                new Employee{Id=1, Name="Ramesh",City="Naganur"},
                new Employee{Id=1, Name="Ratnavva",City="Naganur"}
            };
            return Ok(employees);
        }
    }
}
