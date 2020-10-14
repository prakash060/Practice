using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    public static class FileOperations
    {
        public static ExcelWorksheet ReadExcelFile(string path, string sheetName)
        {
            if (!File.Exists(path)) return null;

            FileInfo fileInfo = new FileInfo(path);
            ExcelPackage package = new ExcelPackage(fileInfo);
            ExcelPackage.LicenseContext = LicenseContext.Commercial;
            ExcelWorksheet worksheet = package.Workbook.Worksheets[sheetName];

            return worksheet;
        }

        public static void WriteExcelFile(string path, ExcelPackage excel)
        {
            var fileName = Path.GetFileNameWithoutExtension(path);
            if (File.Exists(path))
            {
                File.Move(path, $@"D:\Teams\OldTeams\{fileName}_{Guid.NewGuid()}.xlsx");
            }

            FileStream fileStream = File.Create(path);
            fileStream.Close();

            File.WriteAllBytes(path, excel.GetAsByteArray());
            excel.Dispose();
        }
    }
}
