namespace ASPNetCore.CustomMiddlewares
{
    public interface IMessageWriter
    {
        void Write(string time);
    }
}