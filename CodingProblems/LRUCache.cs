using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodingProblems
{
    public class LRUCache
    {
        private readonly int _capacity;
        private readonly LinkedList<int> _cache;
        private readonly Dictionary<int, LinkedListNode<int>> _map;
        public LRUCache(int capacity) 
        {
            _capacity = capacity;
            _cache = new LinkedList<int>();
            _map = new Dictionary<int, LinkedListNode<int>>(_capacity);
        }

        public int ReadFromCache(int key) 
        {
            if (!_map.ContainsKey(key))
                return -1;

            var node = _map[key];

            _cache.Remove(node);
            _cache.AddFirst(node);
            return node.Value;
        }

        public void AddToCache(int key, int value)
        {
            if (_map.ContainsKey(key))
            {
                var node = _map[key];
                node.Value = value;

                _cache.Remove(node);
                _cache.AddFirst(node);

                _map[key] = node;

            }
            else
            {
                if (_map.Count >= _capacity)
                {
                    int lastNodeKey = _cache.Last.Value;
                    _map.Remove(lastNodeKey);
                    _cache.RemoveLast();
                }

                var addedNode = _cache.AddFirst(value);
                _map.Add(key, addedNode);
            }
        }

        public void PrintCache()
        {
            foreach (var node in _cache)
            {
                Console.WriteLine(node);
            }
        }

    }
}
