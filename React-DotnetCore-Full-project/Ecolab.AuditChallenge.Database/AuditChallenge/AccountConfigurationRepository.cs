using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class AccountConfigurationRepository : Repository<AccountConfiguration>, IAccountConfigurationRepository
    {
        public AccountConfigurationRepository(AuditChallengeContext context) : base(context)
        {
        }

        public async Task<IEnumerable<AccountConfiguration>> GetAccountConfigurations()
        {
            return await FindAll();
        }

        public async Task<AccountConfiguration> GetAccountConfigurationById(int accountConfigurationId)
        {
            var result = await FindByCondition(x => x.Id == accountConfigurationId);
            return await result.FirstOrDefaultAsync();
        }

        public async Task<AccountConfiguration> InsertAccountConfiguration(AccountConfiguration accountConfiguration)
        {
            return await Create(accountConfiguration);
        }

        public async Task DeleteAccountConfiguration(int accountConfigurationId)
        {
            await Delete(accountConfigurationId);
        }

        public async Task UpdateAccountConfiguration(AccountConfiguration accountConfiguration)
        {
            await Update(accountConfiguration);
        }

        public async Task<AccountConfiguration> GetAccountConfigurationByAccountId(Guid accountId)
        {
            var result = await FindAll();
            return await result.FirstOrDefaultAsync(r => r.AccountId.Equals(accountId));
        }
    }
}
