using Ecolab.AuditChallenge.Api.Models.Admin;

namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface IConfigurationService
    {
        Task<IEnumerable<AccountConfigurationModel>> GetAccountConfigurations();
        Task<AccountConfigurationModel> GetAccountConfigurationByAccountId(Guid accountId);
        Task<AccountConfigurationModel> CreateAccountConfiguration(AccountConfigurationModel accountConfiguration);
        Task DeleteAccountConfiguration(int accountConfigurationId);

        Task<IEnumerable<RoleConfigurationModel>> GetRoleConfigurations();
        Task<RoleConfigurationModel> GetRoleConfigurationByEmail(string email);
        Task<RoleConfigurationModel> CreateRoleConfiguration(RoleConfigurationModel roleConfiguration);
        Task DeleteRoleConfiguration(int roleConfigurationId);
    }
}
