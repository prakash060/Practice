using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodingProblems
{
    public class QueueUsingTwoStacks
    {
        private readonly Stack<int> _stackFirst;
        private readonly Stack<int> _stackSecond;
        public QueueUsingTwoStacks()
        {
            _stackFirst = new Stack<int>();
            _stackSecond = new Stack<int>();
        }

        public void Enqueue(int item)
        {
            _stackFirst.Push(item);
        }

        public int Dequeue()
        {
            while (_stackFirst.Count > 0)
            {
                _stackSecond.Push(_stackFirst.Pop());
            }

            int itemtoReturn = _stackSecond.Pop();

            while (_stackSecond.Count > 0)
            {
                _stackFirst.Push(_stackSecond.Pop());
            }

            return itemtoReturn;
        }
    }
}
