using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdapterDesignPattern
{
    public interface ILogger
    {
        void LogError(string message, Exception ex);
        void LogInformation(Dictionary<string,string> info);
    }
}
