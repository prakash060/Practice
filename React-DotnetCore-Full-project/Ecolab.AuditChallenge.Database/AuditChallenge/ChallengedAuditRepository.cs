using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class ChallengedAuditRepository : Repository<ChallengedAudit>, IChallengedAuditRepository
    {
        public ChallengedAuditRepository(AuditChallengeContext context) : base(context)
        {
        }
        public async Task<IEnumerable<ChallengedAudit>> GetChallengedAudits()
        {
            return await FindAll();
        }

        public async Task<ChallengedAudit> GetChallengedAuditById(Guid challengedAuditId)
        {
            var result = await FindByCondition(x => x.Id == challengedAuditId);
            return await result.FirstOrDefaultAsync();

        }

        public async Task<ChallengedAudit> InsertChallengedAudit(ChallengedAudit challengedAudit)
        {
           return await Create(challengedAudit);
        }

        public async Task DeleteChallengedAudit(Guid challengedAuditId)
        {
            await Delete(challengedAuditId);
        }

        public async Task UpdateChallengedAudit(ChallengedAudit challengedAudit)
        {
            await Update(challengedAudit);
        }

        public async Task<IEnumerable<ChallengedAudit>> GetChallengedAuditsByLocations(IEnumerable<Guid> locationIds, DateTime dateLimit)
        {
            return await FindByCondition(a => locationIds.Contains(a.LocationId) && a.IsActive && a.ChangedDate > dateLimit);
        }

        public async Task<ChallengedAudit> GetChallengedAuditByServiceResponseId(Guid serviceResponseId)
        {
            var audits = await FindByCondition(a => a.ServiceResponseId == serviceResponseId && a.IsActive);
            return audits.FirstOrDefault();
        }
    }
}
