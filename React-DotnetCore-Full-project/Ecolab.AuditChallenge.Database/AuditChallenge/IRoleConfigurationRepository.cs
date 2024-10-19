using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IRoleConfigurationRepository
    {
        public Task<IEnumerable<RoleConfiguration>> GetRoleConfigurations();
        public Task<RoleConfiguration> GetRoleConfigurationById(int roleConfigurationId);
        Task<RoleConfiguration> InsertRoleConfiguration(RoleConfiguration roleConfiguration);
        Task DeleteRoleConfiguration(int roleConfigurationId);
        Task UpdateRoleConfiguration(RoleConfiguration roleConfiguration);
    }
}
