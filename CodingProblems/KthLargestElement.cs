using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodingProblems
{
    public class KthLargestElement
    {
        public static int FindKthLargestElement(int[] arr, int k)
        {
            PriorityQueue<int, int> priorityQueue = new();
            foreach (int item in arr)
            {
                priorityQueue.Enqueue(item, item);
                if(priorityQueue.Count > k)
                {
                    priorityQueue.Dequeue();
                }
            }
            return priorityQueue.Dequeue();
        }

        public static int FindKthSmallestElement(int[] arr, int k)
        {
            PriorityQueue<int, int> priorityQueue = new();
            foreach (int item in arr)
            {
                priorityQueue.Enqueue(item, item);
            }
            int count = 1;
            while (count < k)
            {
                priorityQueue.Dequeue();
                count++;
            }
            return priorityQueue.Dequeue();
        }
    }
}
