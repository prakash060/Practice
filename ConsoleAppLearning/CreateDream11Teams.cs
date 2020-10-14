
using ConsoleAppLearning.Models;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace ConsoleAppLearning
{
    public class CreateDream11Teams
    {
        private string _inputFilePath = @"D:\Teams\TeamsInput\";
        private string _outputFilePath = @"D:\Teams\TeamsOutput\";
        private int _combinationId = 1;
        private static int _playerId = 1;
        private int _teamSize = 11;

        public void CreateTeams()
        {
           
             var filters = ReadInputFilters();
            _outputFilePath += Constants.TeamName + ".xlsx";
            _inputFilePath += Constants.TeamName + ".xlsx";
            var keepers = GetPlayers(_inputFilePath, "WK");
            var allRounders = GetPlayers(_inputFilePath, "ALL");
            var batsmans = GetPlayers(_inputFilePath, "BAT");
            var bowlers = GetPlayers(_inputFilePath, "BOWL");
            var allPlayers = keepers.ToList();
            allPlayers.AddRange(allRounders.ToList());
            allPlayers.AddRange(batsmans.ToList());
            allPlayers.AddRange(bowlers.ToList());

            var validCombinations = GetPlayerCombinations(allPlayers.ToArray(), _teamSize, filters);
            WriteTeams(validCombinations);
        }

        private Filters ReadInputFilters(string message = null)
        {
            //Invalid inputs not handled  
            var msg = !string.IsNullOrEmpty(message) ? message : "Enter Team Name";
            Console.WriteLine(msg);
            Constants.TeamName = Console.ReadLine();
            if (string.IsNullOrEmpty(Constants.TeamName))
                ReadInputFilters("Team Name Is Mandatory.Please Enter Team Name.!");

            Console.WriteLine("Do you want to apply filters ? Enter 0/1");
            var applyFilter = Convert.ToInt32(Console.ReadLine());
            Filters filters = null;
            if (applyFilter == 0)
                return filters;
            
            filters = new Filters();
                                            
            Console.WriteLine("Do you want to apply players type filter ? Enter 0/1");
            filters.ApplyPlayersTypeCountFilter = Convert.ToInt32(Console.ReadLine());
            if (filters.ApplyPlayersTypeCountFilter == 1)
            {
                Console.WriteLine("Enter number of wicket keepers between 1 and 4");
                filters.WkCount = Convert.ToInt32(Console.ReadLine());
                Console.WriteLine("Enter number of Batsmans between 3 and 6");
                filters.BatCount = Convert.ToInt32(Console.ReadLine());
                Console.WriteLine("Enter number of All rounders between 1 and 4");
                filters.AllCount = Convert.ToInt32(Console.ReadLine());
                Console.WriteLine("Enter number of Bowlers between 1 and 6");
                filters.BowlCount = Convert.ToInt32(Console.ReadLine());
            }

            Console.WriteLine("Do you want to apply points range filter ? Enter 0/1");
            filters.ApplyPointsRangeFilter = Convert.ToInt32(Console.ReadLine());
            if (filters.ApplyPointsRangeFilter == 1)
            {
                Console.WriteLine("Enter min points value");
                filters.MinPoints = Convert.ToInt32(Console.ReadLine());
                Console.WriteLine("Enter max points value");
                filters.MaxPoints = Convert.ToInt32(Console.ReadLine());
            }
            
            return filters;
        }

        private List<Combination> GetPlayerCombinations(Player[] players, int size, Filters filters = null)
        {
            var combinations = new List<Combination>();
            var data = new Player[size];
            CalculatePlayerCombinations(players, data, 0, players.Length - 1, 0, size, combinations, filters);

            return combinations;
        }

        private void CalculatePlayerCombinations(Player[] input, Player[] data, int start, int end, int index, int size, List<Combination> result, Filters filters = null)
        {
            if (index == size)
            {
                var players = new Player[size];
                Array.Copy(data, players, size);


                if (IsValidCombination(players, filters))
                {
                    var combination = new Combination { Players = players, Id = _combinationId++, TotalPoints = players.Sum(x => Convert.ToDecimal(x.Points)) };
                    result.Add(combination);
                }
                return;
            }

            for (int i = start; i <= end && end - i + 1 >= size - index; i++)
            {
                data[index] = input[i];
                CalculatePlayerCombinations(input, data, i + 1, end, index + 1, size, result, filters);
            }
        }

        private static bool IsValidCombination(Player[] players, Filters filters = null)
        {
            var wkCount = players.Where(q => q.Type == "WK").Count();
            var arCount = players.Where(q => q.Type == "ALL").Count();
            var batCount = players.Where(q => q.Type == "BAT").Count();
            var bowlCount = players.Where(q => q.Type == "BOWL").Count();
            var totalPoints = players.Select(a => a.Points).Sum(b => Convert.ToDecimal(b));
          
            var isValidTotalCount = totalPoints <= 100 && wkCount >= 1 && wkCount <= 4 && arCount >= 1 && arCount <= 4 && batCount >= 3 && batCount <= 6 && bowlCount >= 3 && bowlCount <= 6;
            if (filters == null) return isValidTotalCount;

            if (isValidTotalCount)
            {
                var isValidPointsRange = totalPoints >= filters.MinPoints && totalPoints <= filters.MaxPoints;
                var isValidPlayerTypeCount = filters.WkCount == wkCount && filters.AllCount == arCount && filters.BatCount == batCount && filters.BowlCount == bowlCount;

                if (filters.ApplyPlayersTypeCountFilter == 1 && filters.ApplyPointsRangeFilter == 1)
                    return isValidPlayerTypeCount && isValidPointsRange;

                if (filters.ApplyPlayersTypeCountFilter == 1)
                    return isValidPlayerTypeCount;

                if (filters.ApplyPointsRangeFilter == 1)
                    return isValidPointsRange;
            }

            return false;
        }

        private List<Player> GetPlayers(string path, string sheetName)
        {
            var fileInfo = FileOperations.ReadExcelFile(path, sheetName);
            var playersInfo = GetPlayersInformation(fileInfo);
            playersInfo.All(p =>
            {
                p.Type = sheetName;
                p.Id = _playerId++;
                return true;
            });
            return playersInfo;
        }
        private List<Player> GetPlayersInformation(ExcelWorksheet worksheet)
        {
            var playersInfo = new List<Player>();

            int rows = worksheet.Dimension.Rows;

            for (int i = 2; i <= rows; i++)
            {
                var name = worksheet.Cells[i, 1].Value.ToString();
                var points = worksheet.Cells[i, 2].Value.ToString();
                playersInfo.Add(new Player { Name = name, Points = points });
            }

            return playersInfo;
        }

        private void WriteTeams(List<Combination> combinations, bool filtersApplied = false)
        {
            var excel = new ExcelPackage();
            var sheetName = filtersApplied != false ? "TeamsWithFilters" : "TeamsWithoutFilters";
            var workSheet = excel.Workbook.Worksheets.Add(sheetName);
            CreateExcelSheet(workSheet, combinations);

            FileOperations.WriteExcelFile(_outputFilePath, excel);
        }

        private void CreateExcelSheet(ExcelWorksheet workSheet, List<Combination> combinations)
        {
            var teamNumber = 1;
            var rowIndex = 1;
            var colIndex = 1;

            foreach (var comb in combinations)
            {
                if (teamNumber == 20000 || teamNumber % 20000 == 0)
                {
                    rowIndex = 1;
                    colIndex += 5;
                }

                CreateHeaderRow(workSheet, rowIndex, colIndex, teamNumber++);
                rowIndex++;
                foreach (var player in comb.Players)
                {
                    workSheet.Cells[rowIndex, colIndex + 1].Value = player.Name;
                    workSheet.Cells[rowIndex, colIndex + 2].Value = player.Points;
                    workSheet.Cells[rowIndex, colIndex + 3].Value = player.Type;
                    rowIndex++;
                }

                //Add footer
                CreateFooterRow(workSheet, rowIndex++, colIndex, comb.TotalPoints);

                //Create a empty row after every team
                rowIndex++;
            }

            SetColumnStyles(workSheet, colIndex);
        }

        private void SetColumnStyles(ExcelWorksheet workSheet, int col)
        {
            for (int i = 1; i <= col; i += 10)
            {
                var c = i;
                SetColumnColor(workSheet, c);
                SetColumnColor(workSheet, c + 1);
                SetColumnColor(workSheet, c + 2);
                SetColumnColor(workSheet, c + 3);
            }

            workSheet.Cells.AutoFitColumns();
        }

        private void SetColumnColor(ExcelWorksheet workSheet, int col)
        {
            workSheet.Column(col).Style.Fill.PatternType = ExcelFillStyle.Solid;
            workSheet.Column(col).Style.Fill.BackgroundColor.SetColor(Color.Azure);
        }

        private static void CreateFooterRow(ExcelWorksheet workSheet, int row,int col, decimal totalPoints)
        {
            workSheet.TabColor = Color.Green;
            workSheet.DefaultRowHeight = 12;

            workSheet.Row(row).Height = 20;
            workSheet.Row(row).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Row(row).Style.Font.Bold = true;

            workSheet.Cells[row, col+1].Value = "Total Points";
            workSheet.Cells[row, col+2].Value = totalPoints;
        }

        private static void CreateHeaderRow(ExcelWorksheet workSheet, int row, int col, int number)
        {
            workSheet.TabColor = Color.Black;
            workSheet.DefaultRowHeight = 12;

            workSheet.Row(row).Height = 20;
            workSheet.Row(row).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Row(row).Style.Font.Bold = true;

            workSheet.Cells[row, col].Value = "Team" + number;
            workSheet.Cells[row, col + 1].Value = "Name";
            workSheet.Cells[row, col + 2].Value = "Points";
        }


        #region Obsolete code
        private List<Player[]> GetValidPlayersCombination(List<int[]> combinations, List<Player> players)
        {
            var validCombinations = new List<Player[]>();
            var inValidCombinations = new List<Player[]>();
            foreach (var comb in combinations)
            {
                var pls = comb.Select(p => players.FirstOrDefault(t => t.Id == p)).ToArray();
                var wkCount = pls.Where(q => q.Type == "WK").Count();
                var arCount = pls.Where(q => q.Type == "ALL").Count();
                var batCount = pls.Where(q => q.Type == "BAT").Count();
                var bowlCount = pls.Where(q => q.Type == "BOWL").Count();
                var pointsSum = pls.Select(a => a.Points).Sum(b => Convert.ToDecimal(b));
                if (pointsSum > 100)
                {
                    inValidCombinations.Add(pls);
                    continue;
                }

                if (wkCount >= 1 && wkCount <= 4 && arCount >= 1 && arCount <= 4 && batCount >= 3 && batCount <= 6 && bowlCount >= 3 && bowlCount <= 6)
                    validCombinations.Add(pls);
            }

            return validCombinations;
        }

        private List<int[]> CalculateNumberCombinations(int[] numbers, int size)
        {
            var combinations = new List<int[]>();
            var data = new int[size];
            CalculateNumberCombinations(numbers, data, 0, numbers.Length - 1, 0, size, combinations);

            return combinations;
        }

        private void CalculateNumberCombinations(int[] input, int[] data, int start, int end, int index, int size, List<int[]> result)
        {
            if (index == size)
            {
                var ids = new int[size];
                Array.Copy(data, ids, size);
                result.Add(ids);
                return;
            }

            for (int i = start; i <= end && end - i + 1 >= size - index; i++)
            {
                data[index] = input[i];
                CalculateNumberCombinations(input, data, i + 1, end, index + 1, size, result);
            }
        }
        #endregion
    }
}
