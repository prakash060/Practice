using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace ConsoleAppLearning
{
    class Program
    {
        static void Main(string[] args)
        {
            var watch = new Stopwatch();
            watch.Start();
            var obj = new CreateDream11Teams();
            obj.CreateTeams();

            Console.WriteLine("Teams created..!");
            watch.Stop();
            Console.WriteLine(watch.Elapsed.TotalSeconds);
            Console.ReadLine();
        }
    }   
}
