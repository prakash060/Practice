using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EF6Bl
{
    public interface IPersonRepository : IDisposable
    {
        IEnumerable<Person> GetAllPerson();
        Person GerPersonById(int id);
        void InserPerson(Person person);
        void DeletePerson(int id);
        void UpdatePerson(Person person);
    }
}
