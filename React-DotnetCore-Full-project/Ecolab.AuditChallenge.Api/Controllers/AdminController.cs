using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Ecolab.AuditChallenge.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Tags("EMS Audit Challenge Administration")]
    [Route("api")]
    [EnableCors("AuditChallengeCors")]
    public class AdminController : ControllerBase
    {
        private readonly IConfigurationService _configurationService;
        private readonly IEmsCloudService _emsCloudService;
        private readonly ILogger _logger;
        public AdminController(IConfigurationService  configurationService, IEmsCloudService emsCloudService, ILogger<AdminController> logger)
        {
            _configurationService = configurationService;
            _emsCloudService = emsCloudService;
            _logger = logger;
        }

        [HttpGet]
        [Route("accounts")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all accounts")]
        public async Task<IActionResult> GetAccounts()
        {
            try
            {
                var accounts = await _emsCloudService.GetAllCustomerAccounts();
                return Ok(accounts.ToArray());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("account-configurations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all challenge app enrolled account configurations")]
        public async Task<IActionResult> GetAccountConfigurations()
        {
            try
            {
                var configurations = await _configurationService.GetAccountConfigurations();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("create-account-configuration")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Creates the challenge application account configuration")]
        public async Task<IActionResult> CreateAccountConfiguration([FromBody] CustomerCreateRequest customerCreateRequest)
        {
            try
            {
                if (customerCreateRequest == null)
                    return BadRequest();

                var model = new AccountConfigurationModel
                {
                    AccountId = customerCreateRequest.AccountId,
                    AccountName = customerCreateRequest.AccountName,
                    LimitToChallenge = customerCreateRequest.LimitToChallenge,
                    LimitToReview = customerCreateRequest.LimitToReview
                };
                var configuration = await _configurationService.CreateAccountConfiguration(model);
                var configurations = await _configurationService.GetAccountConfigurations();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("delete-account-configuration/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Deletes the challenge application account configurations")]
        public async Task<IActionResult> DeleteAccountConfiguration(int id)
        {
            try
            {
                if (id == default)
                    return BadRequest();

                 await _configurationService.DeleteAccountConfiguration(id);
                var configurations = await _configurationService.GetAccountConfigurations();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("role-configurations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all challenge application roles configurations")]
        public async Task<IActionResult> GetRoleConfigurations()
        {
            try
            {
                var configurations = await _configurationService.GetRoleConfigurations();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("create-role-configuration")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Creates the challenge application account configuration")]
        public async Task<IActionResult> CreateRoleConfiguration([FromBody] RoleCreateRequest roleCreateRequest)
        {
            try
            {
                if (roleCreateRequest == null)
                    return BadRequest();

                var model = new RoleConfigurationModel
                {
                    EmailId = roleCreateRequest.EmailId,
                    RoleId= roleCreateRequest.RoleId,
                };
                var configuration = await _configurationService.CreateRoleConfiguration(model);
                var configurations = await _configurationService.GetRoleConfigurations();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("delete-role-configuration/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Deletes the challenge application role configuration")]
        public async Task<IActionResult> DeleteRoleConfiguration(int id)
        {
            try
            {
                if (id == default)
                    return BadRequest();

                await _configurationService.DeleteRoleConfiguration(id);
                var configurations = await _configurationService.GetRoleConfigurations();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }

}
