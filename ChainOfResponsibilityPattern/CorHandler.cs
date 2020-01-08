using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern
{
    public abstract class CorHandler<T> : ICorHandler<T> where T : class
    {
        public ICorHandler<T> Next { get; set; }
        public virtual void Handle(T request)
        {
            Next?.Handle(request);
        }

        public ICorHandler<T> SetNext(ICorHandler<T> next)
        {
            Next = next;
            return Next;
        }
    }
}
