using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Ecolab.AuditChallenge.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Tags("EMS Audit Challenge")]
    [Route("api")]
    [EnableCors("AuditChallengeCors")]
    public class AuditChallengeController : ControllerBase
    {
        private readonly IAuditService _auditService;
        private readonly ILogger _logger;
        public AuditChallengeController(IAuditService auditService, ILogger<AuditChallengeController> logger)
        {
            _auditService = auditService;
            _logger = logger;
        }

        [HttpGet]
        [Route("challenge-audits/{email}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all audits for user having submitter role")]
        public async Task<IActionResult> GetChallengeAudits(string email)
        {
            try
            {
                var audits = await _auditService.GetChallengeAudits(email);
                return Ok(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("review-audits/{email}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all audits for user user having approver role")]
        public async Task<IActionResult> GetReviewAudits(string email)
        {
            try
            {
                var audits = await _auditService.GetReviewAudits(email);
                return Ok(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("challenge-questions/{serviceResponseId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all question details for selected audit for submitter role")]
        public async Task<IActionResult> GetChallengeQuestions(Guid serviceResponseId)
        {
            try
            {
                var audits = await _auditService.GetChallengeQuestions(serviceResponseId);
                return Ok(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("review-questions/{serviceResponseId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets all question details for selected audit for approver role")]
        public async Task<IActionResult> GetReviewQuestions(Guid serviceResponseId)
        {
            try
            {
                var audits = await _auditService.GetReviewQuestions(serviceResponseId);
                return Ok(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("save-challenge")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Save the challenged audit and questions")]
        public async Task<IActionResult> SaveChallenge([FromBody]ChallengeModel challengeModel)
        {
            try
            {
                if (challengeModel == null)
                    return BadRequest();

                 await _auditService.SaveChallenge(challengeModel);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("save-review")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Save the reviewed audit and questions")]
        public async Task<IActionResult> SaveReview([FromBody] ReviewModel reviewModel)
        {
            try
            {
                if (reviewModel == null)
                    return BadRequest();

                await _auditService.SaveReview(reviewModel);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("service-report/{serviceResponseId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets the audit report for the service response id provided")]
        public async Task<FileContentResult> GetServiceReport(Guid serviceResponseId)
        {
            try
            {
                var fileResponse = await _auditService.GetServiceReport(serviceResponseId);

                return new FileContentResult(fileResponse.FileContent, @"application/pdf")
                {
                    FileDownloadName = fileResponse.FileName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return new FileContentResult(new byte[0], @"application/pdf")
                {
                    FileDownloadName = "EmptyFile.pdf"
                };
            }
        }

        [HttpGet]
        [Route("service-report-path/{serviceResponseId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(Summary = "Gets the audit report path for the service response id provided")]
        public async Task<IActionResult> GetServiceReportPath(Guid serviceResponseId)
        {
            try
            {
                var path = await _auditService.GetServiceReportPath(serviceResponseId);

                return new JsonResult(path);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }

}
