// See https://aka.ms/new-console-template for more information
using System;
using System.Linq;
Console.WriteLine("Hello, World!");
int[] array1 = new int[5] { 1, 1, 2, 4, 5 };
var res = array1.Distinct();
Console.WriteLine(res);