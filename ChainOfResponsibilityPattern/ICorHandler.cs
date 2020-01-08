using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern
{
    public interface ICorHandler<T> where T : class
    {
        void Handle(T request);
        ICorHandler<T> SetNext(ICorHandler<T> next);
    }
}
