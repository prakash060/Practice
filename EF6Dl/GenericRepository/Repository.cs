using EF6Bl;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace EF6Dl.GenericRepository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ExContext _exContext;
        private readonly DbSet<T> _table = null;
        public Repository(ExContext exContext)
        {
            _exContext = exContext;
            _table = _exContext.Set<T>();
        }       

        public IEnumerable<T> GetAll()
        {
            return _table.ToList();
        }

        public T GetById(object id)
        {
            return _table.Find(id);
        }

        public void Insert(T obj)
        {
            _table.Add(obj);
        }

        public void Update(T obj)
        {
            _table.Attach(obj);
            _exContext.Entry(obj).State = EntityState.Modified;
        }

        public void Delete(object id)
        {
            T obj = _table.Find(id);
            _table.Remove(obj);
        }

        public void Save()
        {
            _exContext.SaveChanges();
        }       
    }
}
