using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IChallengedAuditRepository
    {
        Task<IEnumerable<ChallengedAudit>> GetChallengedAudits();
        Task<ChallengedAudit> GetChallengedAuditById(Guid challengedAuditId);
        Task<ChallengedAudit> InsertChallengedAudit(ChallengedAudit challengedAudit);
        Task DeleteChallengedAudit(Guid challengedAuditId);
        Task UpdateChallengedAudit(ChallengedAudit challengedAudit);
        Task<IEnumerable<ChallengedAudit>> GetChallengedAuditsByLocations(IEnumerable<Guid> locationIds, DateTime dateLimit);
        Task<ChallengedAudit> GetChallengedAuditByServiceResponseId(Guid serviceResponseId);
    }
}
