using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace ASPNetCore.CustomMiddlewares
{
    public static class MyCustomMiddlewareExtensions
    {
        public static IApplicationBuilder UseMyCustomMiddleware(this IApplicationBuilder builder )
        {
            return builder.UseMiddleware<MyCustomMiddleware>();
        }
    }
}
