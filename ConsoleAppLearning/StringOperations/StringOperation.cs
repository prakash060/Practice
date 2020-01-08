using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning.StringOperations
{
    public static class StringOperation
    {
        public static void DuplicateCharacters(string str)
        {
            var result = new StringBuilder();
            var duplicate = new StringBuilder();
            foreach (var s in str.AsEnumerable())
            {
                if (result.ToString().IndexOf(s.ToString().ToLower()) == -1)
                    result.Append(s);
                else
                    duplicate.Append(s);
            }

            Console.WriteLine($"Duplicates are - {duplicate}");
        }        

        public static void UniqueCharacters(string str)
        {

            var result = new StringBuilder();
            var duplicate = new StringBuilder();
            foreach (var s in str)
            {
                if (result.ToString().IndexOf(s.ToString()) == -1)
                    result.Append(s);
                else
                    duplicate.Append(s);
            }

            Console.WriteLine($"Unique characters are - {result}");
        }

        public static void NumberOfWords(string str)
        {

            var arr = str.Split(' ');
            var list = new List<string>();

            foreach (var a in arr)
            {
                if (!string.IsNullOrEmpty(a))
                    list.Add(a);
            }

            Console.WriteLine($"Number of words - {list.Count}");
        }

        public static void DuplicateWords(string str)
        {

            var arr = str.Split(' ');
            var list = new List<string>();
            
            foreach (var a in arr)
            {
                if (!string.IsNullOrEmpty(a))
                    list.Add(a);
            }

            var res = list.GroupBy(x => x).Where(t => t.Count() > 1);
            Console.WriteLine($"Duplicate words are");
            foreach (var s in res)
            {
                Console.WriteLine(s.FirstOrDefault());
            }
        }

        public static void ReversAllWords(string str)
        {

            var arr = str.Split(' ');
            var list = new List<string>();

            foreach (var a in arr)
            {
                if (!string.IsNullOrEmpty(a))
                    list.Add(a);
            }

            var res = list.GroupBy(x => x).Where(t => t.Count() > 1);
            Console.WriteLine($"Duplicate words are");
            foreach (var s in res.Distinct())
            {
                Console.WriteLine(s);
            }
        }
    }
}
