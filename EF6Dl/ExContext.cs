using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EF6Bl
{
   public class ExContext : DbContext
   {
        public ExContext() : base(@"Data Source=DESKTOP-RLSA4SS\SQLEXPRESS;Initial Catalog=PracticeDb;Integrated Security=True")
        {            
        }

        public DbSet<Person> Persons { get; set; }
    }
}
