using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdapterDesignPattern
{
    public interface IFileService
    {
        void SaveFile(string path, byte[] content);
    }
}
