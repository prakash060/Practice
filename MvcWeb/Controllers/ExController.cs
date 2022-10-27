
using EF6Bl;
using EF6Dl.GenericRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MvcWeb.Controllers
{
    public class ExController : Controller
    {
        //private readonly IPersonRepository _personRepository;
        private readonly IRepository<Person> _personRepository;
        
        public ExController()
        {
            //_personRepository = new PersonRepository(new ExContext());
            _personRepository = new Repository<Person>(new ExContext());
        }

        public IEnumerable<Person> GetTempData()
        {
            var list = new List<Person>
            {
                new Person
                {
                     Address = "Address1",
                     CreatedBy = "Admin",
                     CreatedDate = DateTime.Now,
                     Id = 1,
                     Name = "Prakash1"

                },

                new Person
                {
                     Address = "Address2",
                     CreatedBy = "Admin",
                     CreatedDate = DateTime.Now,
                     Id = 1,
                     Name = "Prakash2"

                },
                new Person
                {
                     Address = "Address3",
                     CreatedBy = "Admin",
                     CreatedDate = DateTime.Now,
                     Id = 1,
                     Name = "Prakash3"

                }
            };

            return list;
        }

        public ActionResult ExView()
        {
            //var personList = _personRepository.GetAll();
            var personList = GetTempData();
            return View("GetPersonList", personList);
        }

        public ActionResult GetPersonList()
        {
            //var personList = _personRepository.GetAll();
            var personList = GetTempData();
            return View(personList);
        }

        public ActionResult AddPerson(Person person)
        {
            if(person == null) return View("AddPerson");
            _personRepository.Insert(new Person
            {
                Name = person.Name,
                Address =person.Address,
                CreatedBy = "Praksh-Admin",
                CreatedDate = DateTime.Now
            });
            _personRepository.Save();
            var personList = _personRepository.GetAll();
            return View("AddPerson");
            //RedirectToAction("GetPersonList");

        }

        public ActionResult UpdatePerson(int id)
        {
            _personRepository.Update(new Person
            {
                Id = id,
                Name = "Praksh-updated",
                Address = "Address",
                CreatedBy = "Praksh",
                CreatedDate = DateTime.Now,
                UpdatedBy = "Praksh-updated",
                UpdatedDate = DateTime.Now
            });
            _personRepository.Save();

            var personList = _personRepository.GetAll();
            return View("GetPersonList", personList);
            //RedirectToAction("GetPersonList");
        }

        public ActionResult DeletePerson(int id)
        {
            _personRepository.Delete(id);
            _personRepository.Save();
            var personList = _personRepository.GetAll();
            return View("GetPersonList", personList);
            //RedirectToAction("GetPersonList");
        }

    }
}