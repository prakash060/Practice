using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MvcWeb
{
    public class MyHub : Hub
    {
        public void Announce(string msg)
        {

        }
    }
}