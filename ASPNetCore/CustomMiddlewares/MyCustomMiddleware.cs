using System.Globalization;

namespace ASPNetCore.CustomMiddlewares
{
    public class MyCustomMiddleware
    {
        private readonly RequestDelegate _next;
        public MyCustomMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IMessageWriter svc)
        {
            svc.Write(DateTime.Now.Ticks.ToString());

            await _next(context);
        }
    }
}
