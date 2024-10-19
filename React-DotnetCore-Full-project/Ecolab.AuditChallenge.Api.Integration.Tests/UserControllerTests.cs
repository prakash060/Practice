using System.Net.Http.Json;

namespace Ecolab.AuditChallenge.Api.Integration.Tests
{
    [TestFixture]
    public class UsersControllerTests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public async Task Test_GetUserLocations()
        {
            var application = new AuditChallengeWepApplicationFactory();

            var client = application.CreateClient();
            string email = "prakash.betageri@ecolab.com";

            var response = await client.GetAsync($"/api/users/{email}/locations");
            response.EnsureSuccessStatusCode();

            var matchResponse = await response.Content.ReadFromJsonAsync<IEnumerable<Guid>>();
            Assert.IsNotNull( matchResponse );
            var res = matchResponse.ToList();
            Assert.IsNotNull( res );
        }
    }
}