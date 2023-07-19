namespace ASPNetCore.CustomMiddlewares
{
    public class MessageWriter : IMessageWriter
    {
        public void Write(string time)
        {
            try
            {
                string path = @"C:\Users\Tnluser\Desktop\log.txt";
                File.AppendAllTextAsync(path, $"This message is logged from custom middleware.! @ {time} \n");
            }
            catch
            {

            }
        }
    }
}