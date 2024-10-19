using AutoMapper;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Ecolab.AuditChallenge.Database.AuditChallenge;
using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class ConfigurationService: IConfigurationService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;
        public ConfigurationService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ConfigurationService> logger)
        {
            _uow = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }


        public async Task<IEnumerable<AccountConfigurationModel>> GetAccountConfigurations()
        {
            try
            {
                var response = new List<AccountConfigurationModel>();
                var configurations = await _uow.AccountConfigurations.GetAccountConfigurations();
                configurations.ToList().ForEach(c =>
                {
                   var mappedModel = _mapper.Map<AccountConfigurationModel>(c);
                    response.Add(mappedModel);
                });

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<AccountConfigurationModel>());
            }
        }

        public async Task<AccountConfigurationModel> GetAccountConfigurationByAccountId(Guid accountId)
        {
            try
            {
                var response = new List<AccountConfigurationModel>();
                var accountConfiguration = await _uow.AccountConfigurations.GetAccountConfigurationByAccountId(accountId);
                if (accountConfiguration == null)
                    return new AccountConfigurationModel();
                var mappedModel = _mapper.Map<AccountConfigurationModel>(accountConfiguration);

                return mappedModel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new AccountConfigurationModel());
            }
        }

        public async Task<AccountConfigurationModel> CreateAccountConfiguration(AccountConfigurationModel accountConfigurationModel)
        {
            try
            {

                if (accountConfigurationModel == null) throw new ArgumentNullException("Argument accountConfigurationModel cannot be null");
                var mappedModel = _mapper.Map<AccountConfiguration>(accountConfigurationModel);
                var accountConfiguration = await _uow.AccountConfigurations.InsertAccountConfiguration(mappedModel);

                var newAccountConfiguration = _mapper.Map<AccountConfigurationModel>(accountConfiguration);

                await _uow.Save();

                return newAccountConfiguration;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new AccountConfigurationModel());
            }
        }
        public async Task DeleteAccountConfiguration(int accountConfigurationId)
        {
            try
            {
                await _uow.AccountConfigurations.DeleteAccountConfiguration(accountConfigurationId);
                await _uow.Save();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
            }
        }

        public async Task<IEnumerable<RoleConfigurationModel>> GetRoleConfigurations()
        {
            try
            {
                var response = new List<RoleConfigurationModel>();
                var configurations = await _uow.RoleConfigurations.GetRoleConfigurations();

                configurations.ToList().ForEach(c =>
                {
                    var mappedModel = _mapper.Map<RoleConfigurationModel>(c);
                    response.Add(mappedModel);
                });

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<RoleConfigurationModel>());
            }
        }

        public async Task<RoleConfigurationModel> GetRoleConfigurationByEmail(string email)
        {
            try
            {
                if(string.IsNullOrEmpty(email)) return null;

                var roleConfigurations = await _uow.RoleConfigurations.GetRoleConfigurations();
                if (roleConfigurations == null || !roleConfigurations.Any())
                    return null;

                var roleConfig = roleConfigurations.FirstOrDefault(x => x.EmailId == email);
                if (roleConfig == null) return null;

                var newRoleConfiguration = _mapper.Map<RoleConfigurationModel>(roleConfig);

                return newRoleConfiguration;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new RoleConfigurationModel());
            }
        }

        public async Task<RoleConfigurationModel> CreateRoleConfiguration(RoleConfigurationModel roleConfigurationModel)
        {
            try
            {
                if (roleConfigurationModel == null) return null;

                var mappedModel = _mapper.Map<RoleConfiguration>(roleConfigurationModel);
                var roleConfiguration = await _uow.RoleConfigurations.InsertRoleConfiguration(mappedModel);

                var newRoleConfiguration = _mapper.Map<RoleConfigurationModel>(roleConfiguration);

                await _uow.Save();

                return newRoleConfiguration;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new RoleConfigurationModel());
            }
        }

        public async Task DeleteRoleConfiguration(int roleConfigurationId)
        {
            try
            {
                await _uow.RoleConfigurations.DeleteRoleConfiguration(roleConfigurationId);
                await _uow.Save();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
            }
        }
    }
}
