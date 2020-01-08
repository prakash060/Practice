using ChainOfResponsibilityPattern.UserValidationHandlers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChainOfResponsibilityPattern
{
    class Program
    {
        static void Main(string[] args)
        {
            var user1 = new User { Id = -1, Name = "", PinCode = 1234 };
            var user2 = new User { Id = 10, Name = "Prakash", PinCode = 1234 };

            Register(user2);

            Console.ReadLine();
        }

        private static void Register(User user)
        {
            var valid = Validate(user);

            if(valid)
                Console.WriteLine("Registered.!");
            else
                Console.WriteLine("Registraion failed.!");
        }

        private static bool Validate(User user)
        {
            //if (user.Id <= 0)
            //{
            //    return false;
            //}
            //else if(string.IsNullOrEmpty(user.Name))
            //{
            //    return false;
            //}
            //else if(user.PinCode <= 0)
            //{
            //    return false;
            //}
            //else
            //{
            //    return true;
            //}

            try
            {
                var handler = new IdValidationHandler();
                handler.SetNext(new NameValidationHandler())
                       .SetNext(new PinCodeValidationHandler());

                handler.Handle(user);
            }
            catch (Exception)
            {
                return false;
            }

            return true;
        }
    }   
}
