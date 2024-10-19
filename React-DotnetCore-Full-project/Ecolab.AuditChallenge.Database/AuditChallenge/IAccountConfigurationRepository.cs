using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IAccountConfigurationRepository
    {
        public Task<IEnumerable<AccountConfiguration>> GetAccountConfigurations();
        public Task<AccountConfiguration> GetAccountConfigurationById(int accountConfigurationId);
        public Task<AccountConfiguration> GetAccountConfigurationByAccountId(Guid accountId);
        Task<AccountConfiguration> InsertAccountConfiguration(AccountConfiguration accountConfiguration);
        Task DeleteAccountConfiguration(int accountConfigurationId);
        Task UpdateAccountConfiguration(AccountConfiguration accountConfiguration);
    }
}
