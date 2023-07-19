using CodingProblems;

#region PrintFibonacci
PrintFibonacci obj = new PrintFibonacci();
obj.Execute();
#endregion

#region AddBigInt
//AddBigInt a = new AddBigInt("7777555511111111");
//AddBigInt b = new AddBigInt("3332222221111");
//Console.WriteLine(AddBigInt.Add(a, b)); 
#endregion

#region QueueUsingTwoStacks
//QueueUsingTwoStacks queueUsingTwoStacks = new QueueUsingTwoStacks();
//queueUsingTwoStacks.Enqueue(50);
//queueUsingTwoStacks.Enqueue(5);
//int result = queueUsingTwoStacks.Dequeue(); 
#endregion

#region LRUCache

//LRUCache cache = new(3);
//cache.AddToCache(10, 10);
//cache.AddToCache(20, 20);

//cache.ReadFromCache(10);

//cache.AddToCache(30, 30);
//cache.AddToCache(40, 40);

//cache.PrintCache(); 

#endregion

#region FindKthSmallestElement
int[] arr = new[] { 9, 10, 3, 4, 5, 6, 1, 2, 7, 8};

Console.WriteLine(KthLargestElement.FindKthLargestElement(arr, 4)); 
#endregion

Console.WriteLine("");

Console.ReadLine();
