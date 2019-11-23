using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EF6Bl
{
    public class PersonRepository : IPersonRepository,IDisposable
    {
        private readonly ExContext _exContext;
        public PersonRepository(ExContext exContext)
        {
            _exContext = exContext;
        }       

        public void DeletePerson(int id)
        {
            var personToDelete = _exContext.Persons.Where(x => x.Id == id).FirstOrDefault();
            _exContext.Persons.Remove(personToDelete);
            _exContext.SaveChanges();
        }        

        public Person GerPersonById(int id)
        {
            return _exContext.Persons.Where(x => x.Id == id).FirstOrDefault();
        }

        public IEnumerable<Person> GetAllPerson()
        {
            return _exContext.Persons.ToList();
        }

        public void InserPerson(Person person)
        {
            _exContext.Persons.Add(person);
            _exContext.SaveChanges();
        }

        public void UpdatePerson(Person person)
        {            
            _exContext.Entry(person).State = EntityState.Modified;
            _exContext.SaveChanges();
        }

        private bool disposed = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    _exContext.Dispose();
                }

                this.disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
