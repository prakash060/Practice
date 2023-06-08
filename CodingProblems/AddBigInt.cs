using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodingProblems
{
    internal class AddBigInt
    {
        private readonly List<int> _numbers = new();
        public AddBigInt(string num)
        {
            for (int i = num.Length - 1; i >= 0; i--)
            {
                _numbers.Add(int.Parse(num[i].ToString()));
            }
        }

        public static string Add(AddBigInt a, AddBigInt b)
        {
            var sum = new List<int>();
            int i = 0;
            int carry = 0;

            while (i < a._numbers.Count || i < b._numbers.Count)
            {
                int x = i < a._numbers.Count ? a._numbers[i] : 0;
                int y = i < b._numbers.Count ? b._numbers[i] : 0;
                int z = x + y + carry;
                sum.Add(z % 10);
                carry = z / 10;
                i++;
            }

            if(carry > 0)
            {
                sum.Add(carry);
            }

            var result = new StringBuilder();
            for (int j = sum.Count - 1; j >= 0; j--)
            {
                result.Append(sum[j]);
            }

            return result.ToString();
        }
    }
}
