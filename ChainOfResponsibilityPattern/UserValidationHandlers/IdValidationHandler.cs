using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern.UserValidationHandlers
{
    public class IdValidationHandler : CorHandler<User>
    {
        public override void Handle(User request)
        {
            if (request.Id <= 0)
            {
                throw new UserValidationException("Id is invalid.");
            }
            base.Handle(request);
        }
    }
}
