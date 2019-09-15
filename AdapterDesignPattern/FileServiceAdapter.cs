using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdapterDesignPattern
{
    public class FileServiceAdapter : IFileService
    {
        public void SaveFile(string path, byte[] content)
        {
            File.WriteAllBytes(path, content);
        }
    }
}
