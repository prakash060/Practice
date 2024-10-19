using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class RoleConfigurationRepository: Repository<RoleConfiguration>, IRoleConfigurationRepository
    {
        public RoleConfigurationRepository(AuditChallengeContext context) : base(context)
        {
        }

        public async Task<IEnumerable<RoleConfiguration>> GetRoleConfigurations()
        {
            return await FindAll();
        }

        public async Task<RoleConfiguration> GetRoleConfigurationById(int roleConfigurationId)
        {
            var result = await FindByCondition(x => x.Id == roleConfigurationId);
            return await result.FirstOrDefaultAsync();
        }

        public async Task<RoleConfiguration> InsertRoleConfiguration(RoleConfiguration roleConfiguration)
        {
            return await Create(roleConfiguration);
        }
        public async Task DeleteRoleConfiguration(int roleConfigurationId)
        {
            await Delete(roleConfigurationId);
        }

        public async Task UpdateRoleConfiguration(RoleConfiguration roleConfiguration)
        {
            await Update(roleConfiguration);
        }
    }
}
