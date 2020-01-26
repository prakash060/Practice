
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

        public ActionResult ExView()
        {
            var personList = _personRepository.GetAll();
            return View("GetPersonList", personList);
        }

        public ActionResult GetPersonList()
        {
            var personList = _personRepository.GetAll();
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