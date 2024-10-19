using Ecolab.AuditChallenge.Database.AuditChallenge;
using Ecolab.AuditChallenge.Database.EmsCloud;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Ecolab.AuditChallenge.Api.Integration.Tests
{
    internal class AuditChallengeWepApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll(typeof(AuditChallengeContext));
                services.RemoveAll(typeof(EmsCloudContext));

                services.AddSqlServer<AuditChallengeContext>("server = ecokayq.database.windows.net; database = AuditChallenge; User ID = KayCloudAdmin; password =@zure$qlDb0;");
                
                var auditChallengeDbContext = CreateAuditChallengeDbContext(services);
                auditChallengeDbContext.Database.EnsureDeleted();

                //var emsCloudDbContext = CreateEmsCloudDbContext(services);
                //emsCloudDbContext.Database.EnsureDeleted();

            });

            base.ConfigureWebHost(builder);
        }

        private static AuditChallengeContext CreateAuditChallengeDbContext(IServiceCollection services)
        {
            var serviceProvider = services.BuildServiceProvider();
            var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AuditChallengeContext>();

            return dbContext;
        }

        private static EmsCloudContext CreateEmsCloudDbContext(IServiceCollection services)
        {
            var serviceProvider = services.BuildServiceProvider();
            var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<EmsCloudContext>();

            return dbContext;
        }
    }
}
