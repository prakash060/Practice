using PracticeData.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace PracticeData.Controllers
{
    [RoutePrefix("api/course")]
    public class CourseController : ApiController
    {
        [Route("GetCourses")]
        [HttpGet]
        public IHttpActionResult GetCourses()
        {
            var courses = new List<Course>
            {
                new Course{Id = 1, CourseName = "C#"},
                new Course{Id = 1, CourseName = "Angular"},
                new Course{Id = 1, CourseName = "WebApi"},
                new Course{Id = 1, CourseName = "NodeJS"},
                new Course{Id = 1, CourseName = "Bootstrap"}
            };
            return Ok(courses);
        }
    }
}
