using Ecolab.AuditChallenge.Api;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Services;
using Ecolab.AuditChallenge.Database.AuditChallenge;
using Ecolab.AuditChallenge.Database.EmsCloud;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.ApplicationInsights;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMvc();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();
builder.Services.AddAutoMapper(typeof(ModelMapper));


builder.Services.AddDbContext<EmsCloudContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("EmsCloudDb")
));

builder.Services.AddDbContext<AuditChallengeContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("AuditChallengeDb"));
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
});

//Register contracts
builder.Services.AddTransient<ICdmService, CdmService>();
builder.Services.AddTransient<IBlobService, BlobService>();
builder.Services.AddTransient<IEmsCloudService, EmsCloudService>();
builder.Services.AddTransient<IChallengeService, ChallengeService>();
builder.Services.AddTransient<IConfigurationService, ConfigurationService>();
builder.Services.AddTransient<IAuditService, AuditService>();
builder.Services.AddTransient<IConfigReader, ConfigReader>();
builder.Services.AddTransient<IUnitOfWork, UnitOfWork>();
builder.Services.AddTransient<IChallengedAuditRepository, ChallengedAuditRepository>();
builder.Services.AddTransient<IChallengedQuestionRepository, ChallengedQuestionRepository>();
builder.Services.AddTransient<IChallengedQuestionStatusDetailRepository, ChallengedQuestionStatusDetailRepository>();
builder.Services.AddTransient<IAccountConfigurationRepository, AccountConfigurationRepository>();
builder.Services.AddTransient<IRoleConfigurationRepository, RoleConfigurationRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AuditChallengeCors",
        policy =>
        {
            policy.WithOrigins(builder.Configuration["AllowedOrigins"].Split(','))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithMethods("GET", "PUT", "DELETE", "POST");
        });
});

builder.Logging.AddApplicationInsights(
        configureTelemetryConfiguration: (config) =>
            config.ConnectionString = builder.Configuration.GetConnectionString("ApplicationInsights"),
            configureApplicationInsightsLoggerOptions: (options) => { }
    );

builder.Logging.AddFilter<ApplicationInsightsLoggerProvider>("Audit-Challenge", LogLevel.Trace);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.Authority= builder.Configuration["Jwt:ValidIssuer"];
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidIssuer = builder.Configuration["Jwt:ValidIssuer"],
        ValidAudience = builder.Configuration["Jwt:ValidAudience"],
    };
});

var app = builder.Build();


app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AuditChallengeCors");
app.MapControllers().RequireCors("AuditChallengeCors");
app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.Run();
