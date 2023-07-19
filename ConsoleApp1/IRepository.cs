using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp1
{
    internal interface IRepository<T> where T: class
    {
        IQueryable<T> GetAll();
        IQueryable<T> FindByExpression(Expression<Func<T, bool>> expression);
    }
}
