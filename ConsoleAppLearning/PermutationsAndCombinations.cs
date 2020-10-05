
using ConsoleAppLearning.Models;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleAppLearning
{
    public class PermutationsAndCombinations
    {       
        public void CreateWicketKeeperPlayers()
        {
            var players = GetPlayers(@"C:\Users\User\Documents\TeamsInput\Team1.xlsx", "WK");                  
            List<Player[]> combinations = GetCombinations(players.ToArray());           
            WritePlayersInformation(combinations, "WK", @"C:\Users\User\Documents\TeamsResult\Result1.xlsx");
            //foreach (var k in combinations)
            //{
            //    for (int j = 0; j < k.Length; j++)
            //        Console.Write(k[j].Name + "=>" + k[j].Points + "    ");
            //    Console.WriteLine("");
            //}
        }

        public void CreateAllRounderPlayers()
        {
            var players = GetPlayers(@"C:\Users\User\Documents\TeamsInput\Team1.xlsx", "AR");
            List<Player[]> combinations = GetCombinations(players.ToArray());
            WritePlayersInformation(combinations, "WK", @"C:\Users\User\Documents\TeamsResult\Result1.xlsx");           
        }

        private List<Player[]> GetCombinations(Player[] keepers)
        {
            var combinations = new List<Player[]>();
            for (int i = 1; i <= keepers.Length; i++)
            {
                var data = new Player[i];
                GetCombinations(keepers, data, 0, keepers.Length - 1, 0, i, combinations);
            }

            return combinations;
        }

        private void GetCombinations(Player[] input, Player[] data, int start, int end, int index, int size, List<Player[]> result)
        {           
            if (index == size)
            {
                var combination = new Player[size];
                Array.Copy(data, combination, size);
                result.Add(combination);              
                return;
            }
          
            for (int i = start; i <= end && end - i + 1 >= size - index; i++)
            {
                data[index] = input[i];
                GetCombinations(input, data, i + 1, end, index + 1, size,result);
            }
        }

        private static List<Player> GetPlayers(string path, string sheetName)
        {
            var fileInfo = FileOperations.ReadExcelFile(path, sheetName);
            var playersInfo = GetPlayersInformation(fileInfo);

            return playersInfo;
        }
        private static List<Player> GetPlayersInformation(ExcelWorksheet worksheet)
        {
            var playersInfo = new List<Player>();
           
            int rows = worksheet.Dimension.Rows;
           
            for (int i = 2; i <= rows; i++)
            {
                var name = worksheet.Cells[i,1].Value.ToString();
                var points = worksheet.Cells[i,2].Value.ToString();
                playersInfo.Add(new Player { Name = name, Points = points });
            }

            return playersInfo;
        }

        private static void WritePlayersInformation(List<Player[]> players, string sheetName, string path)
        {
            var excel = new ExcelPackage();          
            var workSheet = excel.Workbook.Worksheets.Add(sheetName);
            var rowIndex = 2;

            foreach (var player in players)
            {
                int colIndex = 0;
                for (int j = 0; j < player.Length; j++)
                {                   
                    workSheet.Cells[rowIndex, ++colIndex].Value = player[j].Name;
                    workSheet.Cells[rowIndex, ++colIndex].Value = player[j].Points;                   
                }
                rowIndex++;
            }

            FileOperations.WriteExcelFile(path, excel);
        }
    }
}
