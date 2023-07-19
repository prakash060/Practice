using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Singleton
{
    public sealed class SampleSingleton
    {
        SampleSingleton() { }
        private static readonly object _lock = new();
        private static SampleSingleton _instance;

        public static SampleSingleton Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                        {
                            _instance = new SampleSingleton();
                        }
                    }
                }
                return _instance;
            }
        }
    }
}
