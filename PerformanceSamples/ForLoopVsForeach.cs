using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceSamples
{
    public static class ForLoopVsForeach
    {
        public static void ForLoopVsForeachPerformanceTest()
        {
            int[] limit = new int[100000];
            int[] res1 = new int[100000];
            int[] res2 = new int[100000];
            for (int i = 0; i < 100000; i++)
            {
                limit[i] = i;
            }

            Console.WriteLine($"Linit is :" + limit.Count());
            Stopwatch sw = new Stopwatch();
            sw.Start();
            for (int i = 0; i < limit.Count(); i++)
            {
                res1[i] = i;
            }
            sw.Stop();
            Console.WriteLine($"TimeTaken For 'for' loop is :" + sw.ElapsedTicks);

            sw.Restart();
            foreach (int i in limit)
            {
                res1[i] = i;
            }

            sw.Stop();
            Console.WriteLine($"TimeTaken For 'foreach' loop is :" + sw.ElapsedTicks);

            List<Int32> Count = new List<int>();
            List<Int32> lst1 = new List<Int32>();
            List<Int32> lst2 = new List<Int32>();

            for (int i = 0; i < 100000; i++)
            {
                Count.Add(i);
            }

            Stopwatch sw1 = new Stopwatch();
            sw1.Start();
            for (int i = 0; i < Count.Count; i++)
            {
                lst1.Add(i);
            }
            sw1.Stop();

            Console.WriteLine("For Loop :- " + sw1.ElapsedTicks + "\n");          
            sw1.Start();

            foreach (int a in Count)
            {
                lst2.Add(a);
            }
            sw1.Stop();
            Console.WriteLine("Foreach Loop:- " + sw1.ElapsedTicks);

        }
    }
}
