using PracticeData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CommonApi.Controllers
{
    [RoutePrefix("api/users")]
    public class UserController : ApiController
    {
        // GET: api/User
        public IEnumerable<User> Get()
        {
            return new User[] 
            { 
                new User { Id = 1, Name = "Prakash1", Email = "Test1@email.com", Dob = "11/12/2020"},
                new User { Id = 2, Name = "Prakash2", Email = "Test2@email.com", Dob = "11/12/2020"},
                new User { Id = 3, Name = "Prakash3", Email = "Test3@email.com", Dob = "11/12/2020"},
                new User { Id = 4, Name = "Prakash4", Email = "Test4@email.com", Dob = "11/12/2020"},
                new User { Id = 5, Name = "Prakash5", Email = "Test5@email.com", Dob = "11/12/2020"},
                new User { Id = 6, Name = "Prakash6", Email = "Test6@email.com", Dob = "11/12/2020"}
            };
        }

        // GET: api/User/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/User
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/User/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/User/5
        public void Delete(int id)
        {
        }
    }
}
