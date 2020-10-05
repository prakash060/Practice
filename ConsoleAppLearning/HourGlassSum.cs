using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    public class HourGlassSum
    {
        private void CalculateHourglassSum()
        {
            var d2 = new int[,]
          {
                {1,2,3},{2,1,5},{3,4,9},{7,1,4}
          };

            int[][] d1 = new int[][]
                {
                    new int[]{1, 1, 1, 0, 0, 0,},
                    new int[]{0, 1, 0, 0, 0, 0,},
                    new int[]{1, 1, 1, 0, 0, 0,},
                    new int[]{0, 0, 2, 4, 4, 0,},
                    new int[]{0, 0, 0, 2, 0, 0,},
                    new int[]{ 0, 0, 1, 2, 4, 0}
                };

            //var res = GetMax(d2);
            var res = HourglassSum(d1);
            Console.WriteLine(res);
        }

        static int HourglassSum(int[][] arr)
        {
            var max = 0;
            var n = arr.Length;
            var m = arr.Length;
            if (n == 0 || m > 5)
            {
                return 0;
            }
            for (var i = 0; i <= n - 3; i++)
            {
                for (var j = 0; j <= m - 3; j++)
                {
                    var sum = 0;
                    int mid = 1;
                    for (var a = i; a <= i + 2; a++)
                    {
                        var row = new StringBuilder();
                        for (var b = j; b <= j + 2; b++)
                        {
                            row.Append(arr[a][b]).Append(",");
                            if (a == i || a == i + 2 || mid == 5)
                                sum += arr[a][b];
                            mid++;
                        }
                        //Console.WriteLine(row);
                    }
                    //Console.WriteLine("Sum is : " + sum);
                    //Console.WriteLine("====================");

                    if (sum > max)
                        max = sum;
                }
            }
            return max;
        }

        private static int GetMax(int[,] A)
        {
            var n = A.GetLength(0);
            var m = A.GetLength(1);
            var list = new List<Rook>();
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < m; j++)
                {
                    for (int a = i + 1; a < n; a++)
                    {
                        for (int b = 0; b < m; b++)
                        {
                            if (a == i || b == j) continue;

                            var cell = new Rook
                            {
                                FirstRook = A[i, j],
                                SecondRook = A[a, b]
                            };
                            list.Add(cell);
                        }
                    }
                }
            }

            var res = list.Select(x => x.FirstRook + x.SecondRook).Max();
            return res;
        }
    }

    public class Rook
    {
        public int FirstRook { get; set; }
        public int SecondRook { get; set; }
    }
}
