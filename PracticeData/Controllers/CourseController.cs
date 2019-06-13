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
                new Course{CourseName = "C#"},
                new Course{CourseName = "Angular"},
                new Course{CourseName = "WebApi"},
                new Course{CourseName = "NodeJS"},
                new Course{CourseName = "Bootstrap"}
            };
            return Ok(courses);
        }
    }
}
