using Ecolab.AuditChallenge.Api.Constants;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Database.CdmCloud;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class CdmService : ICdmService
    {
        private readonly IConfigReader _configuration;
        private readonly ILogger _logger;
        public CdmService(IConfigReader configuration, ILogger<CdmService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<IEnumerable<string>> GetCdmAccountNumbersForUser(string email)
        {
            try
            {
                using CdmSnapshotContext cdmContext = new();

                var userAccountDetails = cdmContext.UserAccountDetails.FromSqlInterpolated($"[dbo].[sp_GetAccountNumbersForUser] {email}").ToList();

                var accountNumbers = userAccountDetails.Select(res => res.AccountNumber);

                if (accountNumbers == null || !accountNumbers.Any())
                    return await Task.FromResult(new List<string>());

                return await Task.FromResult(accountNumbers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<string>());
            }
        }

        public async Task<IEnumerable<string>> GetCdmUsers()
        {
            try
            {
                using CdmSnapshotContext cdmContext = new();

                var users = cdmContext.UserEmailLists.FromSqlInterpolated($"[dbo].[sp_GetUserEmails] {_configuration.ApplicationCode}, {UserRoles.Submitter}, {UserRoles.Approver} ").ToList();
                var userList = users.Select(x => x.Email);
                return await Task.FromResult(userList.Distinct());
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<string>());
            }
        }

        public async Task<string> GetUserPermission(string email)
        {
            try
            {
                
                using CdmSnapshotContext cdmContext = new();
                var user = cdmContext.Users.FirstOrDefault(x => x.Email == email);
                if (user == null) throw new NullReferenceException($"User with email id {email} not found");

                var userPermission = cdmContext.UserPermissions
                    .FirstOrDefault(x => x.UserKey == user.UserKey && x.ApplicationCode == _configuration.ApplicationCode && x.IsActive && (x.PermissionCode == "CHALAPPRV" || x.PermissionCode == "CHALSUBM"));

                if (user == null) throw new NullReferenceException($"No user permissions were found for {email}");

                return await Task.FromResult(userPermission?.PermissionCode);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(string.Empty);
            }
        }
    }
}
