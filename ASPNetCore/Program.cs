var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMvc(options => options.EnableEndpointRouting = false);
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    DeveloperExceptionPageOptions pageOptions = new()
    {
        SourceCodeLineCount = 2
    };
    app.UseDeveloperExceptionPage(pageOptions);
}

app.UseStaticFiles();
app.UseMvcWithDefaultRoute();
app.Run();

//DefaultFilesOptions options = new();
//options.DefaultFileNames.Clear();
//options.DefaultFileNames.Add("default.html");
//app.UseDefaultFiles();
//app.MapGet("/", () => "Hello world from middleware.!");

