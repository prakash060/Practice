using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SolidPriciples
{
    public enum Relationship
    {
        Parent,
        Child,
        Sibling
    }

    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public string? Title { get; set; }
    }

    //Low-level-module
    public class RelationShips : IRelationShipsBrowser
    {
        private readonly List<(Person, Relationship, Person)> _list = new();

        public void AddParentChild(Person parent, Person child)
        {
            _list.Add((parent, Relationship.Parent, child));
            _list.Add((child, Relationship.Child, parent));
        }

        public List<string> GetAllChildsByParentName(string parentName)
        {
            return _list.Where(x => x.Item2 == Relationship.Parent && x.Item1.Name.Equals(parentName))
                                .Select(x => x.Item3.Name).ToList();
        }

        //public List<(Person, Relationship, Person)> Relations => _list;
    }

    //High level module

    public class Reserch
    {
        //public Reserch(RelationShips relationShips)
        //{
        //    foreach (var item in relationShips.Relations.Where(x => x.Item2 == Relationship.Parent
        //                                                            && x.Item1.Name == "Prakash"))
        //    {
        //        Console.WriteLine($"{item.Item1.Name} has a child called - {item.Item3.Name}");
        //    }
        //}

        public Reserch(IRelationShipsBrowser browser)
        {
            foreach (var item in browser.GetAllChildsByParentName("Prakash"))
            {
                Console.WriteLine($"Prakash: has a child called - {item}");
            }
        }

        public static void Execute()
        {
            RelationShips relationShips = new();
            relationShips.AddParentChild(new Person { Name = "Prakash" }, new Person { Name = "Manasvi" });
            relationShips.AddParentChild(new Person { Name = "Prakash" }, new Person { Name = "Yashasvi" });
            relationShips.AddParentChild(new Person { Name = "Prakash" }, new Person { Name = "Shreyasvi" });

            new Reserch(relationShips);
        }
    }


    public interface IRelationShipsBrowser
    {
        public List<string> GetAllChildsByParentName(string parentName);
    }

}
