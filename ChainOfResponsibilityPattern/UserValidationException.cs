using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern
{
    public class UserValidationException :Exception
    {
        public UserValidationException()
        {           
        }

        public UserValidationException(string message) : base(message)
        {
        }

        public UserValidationException(string message, Exception innerException) : base(message,innerException)
        {
        }
    }
}
