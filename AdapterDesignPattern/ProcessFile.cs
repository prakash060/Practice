using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdapterDesignPattern
{
   public class ProcessFile
    {
        //private readonly ILogger _logger;
        //public ProcessFile(ILogger logger)
        //{
        //    _logger = logger;
        //}

        //public bool SaveFileToDisk(string path, byte[] content)
        //{
        //    try
        //    {
        //        File.WriteAllBytes(path, content);
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError("File not provcessed", ex);
        //        return false;
        //    }
        //}

        private readonly ILogger _logger;
        private readonly IFileService _fileService;
        public ProcessFile(ILogger logger, IFileService fileService)
        {
            _logger = logger;
            _fileService = fileService;
        }

        public bool SaveFileToDisk(string path, byte[] content)
        {
            try
            {
                _fileService.SaveFile(path, content);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError("File not provcessed", ex);
                return false;
            }
        }
    }
}
