namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface ICdmService
    {
        Task<string> GetUserPermission(string email);
        Task<IEnumerable<string>> GetCdmAccountNumbersForUser(string email);
        Task<IEnumerable<string>> GetCdmUsers();
    }
}
