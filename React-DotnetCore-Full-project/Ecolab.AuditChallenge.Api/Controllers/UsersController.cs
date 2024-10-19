using Ecolab.AuditChallenge.Api.Contracts;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Ecolab.AuditChallenge.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace Ecolab.AuditChallenge.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Tags("EMS Users")]
    [Route("api")]
    [EnableCors("AuditChallengeCors")]
    public class UsersController : ControllerBase
    {
        private readonly ICdmService _cdmService;
        private readonly IEmsCloudService _emsCloudService;
        private readonly ILogger _logger;
        private readonly IConfigurationService _configurationService;
        public UsersController(ICdmService userService, IEmsCloudService emsCloudService, ILogger<UsersController> logger,IConfigurationService configurationService)
        {
            _cdmService = userService;
            _emsCloudService = emsCloudService;
            _logger = logger;
            _configurationService= configurationService;
        }

        [HttpGet]
        [Route("users/{email}/locations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets user details for the given email id")]
        public async Task<IActionResult> GetUserLocations(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                    return StatusCode(StatusCodes.Status400BadRequest);

                var locations = await _emsCloudService.GetUserLocations(email);
                if (locations == null || !locations.Any())
                    return StatusCode(StatusCodes.Status404NotFound);

                return Ok(locations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("users/{email}/account-numbers")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets user details for the given email id")]
        public async Task<IActionResult> GetCdmAccountNumbers(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                    return StatusCode(StatusCodes.Status400BadRequest);

                var accountNumbers = await _cdmService.GetCdmAccountNumbersForUser(email);
                if (accountNumbers == null || !accountNumbers.Any())
                    return StatusCode(StatusCodes.Status404NotFound);

                return Ok(accountNumbers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("users/{email}/permission")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets user level for the given email id")]
        public async Task<IActionResult> GetUserPermission(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                    return StatusCode(StatusCodes.Status400BadRequest);

                var permission = await _cdmService.GetUserPermission(email);
                UserRole userRole = new();
                userRole.Permission = permission;
                var roleConfiguration = _configurationService.GetRoleConfigurationByEmail(email);
                userRole.IsAdmin = roleConfiguration.Result?.IsActive ?? false;
                if(string.IsNullOrEmpty(permission))
                    return StatusCode(StatusCodes.Status404NotFound, "No roles found for the user");
                return Ok(userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("users")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets users list")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _cdmService.GetCdmUsers();
              
                if (users == null || !users.Any())
                    return StatusCode(StatusCodes.Status404NotFound, "No users found.!");
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
