using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Ecolab.AuditChallenge.Api.Models.Challenge;

namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface IEmsCloudService
    {
        Task<IEnumerable<AccountModel>> GetAllCustomerAccounts();
        Task<IEnumerable<Guid>> GetUserLocations(string email);
        Task<List<ChallengeAuditModel>> GetEmsAudits(IEnumerable<Guid> locations);
        Task<IEnumerable<ChallengeQuestionModel>> GetEmsAuditQuestions(Guid serviceResponseId);
        Task<ServiceReportModel> GetServiceReportDetails(Guid serviceResponseId);
    }
}
