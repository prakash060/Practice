using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern.UserValidationHandlers
{
    public class PinCodeValidationHandler : CorHandler<User>
    {
        public override void Handle(User request)
        {
            if (request.PinCode <= 0)
            {
                throw new UserValidationException("Pincode is invalid.");
            }
            base.Handle(request);
        }
    }
}
