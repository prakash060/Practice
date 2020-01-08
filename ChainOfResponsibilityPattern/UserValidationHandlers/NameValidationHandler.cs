using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern.UserValidationHandlers
{
    public class NameValidationHandler : CorHandler<User>
    {
        public override void Handle(User request)
        {
            if (string.IsNullOrEmpty(request.Name))
            {
                throw new UserValidationException("Name is invalid.");
            }
            base.Handle(request);
        }
    }
}
