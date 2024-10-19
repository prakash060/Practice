using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Enums;
using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class AuditService : IAuditService
    {
        private readonly IEmsCloudService _emsCloudService;
        private readonly IChallengeService _challengeService;
        private readonly ILogger _logger;
        private readonly IConfigReader _configuration;
        private readonly IBlobService _blobService;
        public AuditService(IEmsCloudService emsCloudService, IChallengeService challengeService, ILogger<AuditService> logger, IConfigReader configuration, IBlobService blobService)
        {
            _emsCloudService = emsCloudService;
            _challengeService = challengeService;
            _logger = logger;
            _configuration = configuration;
            _blobService = blobService;
        }

        public async Task<IEnumerable<ReviewAuditModel>> GetReviewAudits(string email)
        {
            try
            {
                if(string.IsNullOrEmpty(email)) throw new ArgumentNullException("email cannot be null");

                var locations = await _emsCloudService.GetUserLocations(email);
                if (locations == null || !locations.Any()) throw new Exception($"Locations not found");

                var challengedAudits = await _challengeService.GetReviewAudits(locations);
                if (challengedAudits == null || !challengedAudits.Any()) throw new Exception($"Audits not found");

                return await Task.FromResult(challengedAudits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ReviewAuditModel>());
            }
        }

        public async Task<IEnumerable<ChallengeAuditModel>> GetChallengeAudits(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email)) throw new ArgumentNullException("email cannot be null");

                var audits = new List<ChallengeAuditModel>();

                var locations = await _emsCloudService.GetUserLocations(email);
                if (locations == null || !locations.Any()) throw new Exception($"Locations not found");

                var emsAudits = await _emsCloudService.GetEmsAudits(locations);

                var challengedAudits = await _challengeService.GetChallengeAudits(locations);


                audits.AddRange(challengedAudits);

                var challengedIds = challengedAudits.Select(ca => ca.ServiceResponseId).Distinct().ToList();
                var newAudits = emsAudits.Where(a => !challengedIds.Contains(a.ServiceResponseId)).ToList();

                newAudits.ForEach(a =>
                {
                    a.Status = new AuditStatus { StatusId = (int)AuditStatusEnum.Challenge, StatusText = "Challenge" };
                });

                audits.AddRange(newAudits);

                return await Task.FromResult(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ChallengeAuditModel>());
            }
        }

        public async Task<List<ChallengeQuestionModel>> GetChallengeQuestions(Guid serviceResponseId)
        {
            try
            {
                var auditDetails = new List<ChallengeQuestionModel>();

                var emsAuditQuestions = await _emsCloudService.GetEmsAuditQuestions(serviceResponseId);
                var challengedAuditQuestions = await _challengeService.GetChallengeQuestions(serviceResponseId);

                var challengedQuestionIds = challengedAuditQuestions.Select(ca => ca.SurveyQuestionId).Distinct();
                var newAuditQuestions = emsAuditQuestions.Where(a => !challengedQuestionIds.Contains(a.SurveyQuestionId)).ToList();

                auditDetails.AddRange(challengedAuditQuestions);
                auditDetails.AddRange(newAuditQuestions);

                return await Task.FromResult(auditDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ChallengeQuestionModel>());
            }
        }

        public async Task<List<ReviewQuestionModel>> GetReviewQuestions(Guid serviceResponseId)
        {
            try
            {
                var reviewQuestions = await _challengeService.GetReviewQuestions(serviceResponseId);

                return reviewQuestions.ToList();


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ReviewQuestionModel>());
            }
        }

        public async Task SaveChallenge(ChallengeModel challengeModel)
        {
            try
            {
                if (challengeModel == null) throw new ArgumentNullException("Argument challengeModel cannot be null");
                await _challengeService.SaveChallenge(challengeModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
            }
        }

        public async Task SaveReview(ReviewModel reviewModel)
        {
            try
            {
                if (reviewModel == null) throw new ArgumentNullException("Argument reviewModel cannot be null");
                await _challengeService.SaveReview(reviewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
            }
        }

        public async Task<string> GetServiceReportPath(Guid serviceResponseId)
        {
            try
            {
                var serviceReportDetails = await _emsCloudService.GetServiceReportDetails(serviceResponseId);
                if (serviceReportDetails == null) throw new Exception("ServiceReportDetails were not found");

                return await Task.FromResult(serviceReportDetails.ReportPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(string.Empty);
            }
        }

        public async Task<FileDownloadResponse> GetServiceReport(Guid serviceResponseId)
        {
            try
            {
                var response = new FileDownloadResponse();
                var serviceReportDetails = await _emsCloudService.GetServiceReportDetails(serviceResponseId);
                var report = await _blobService.GetCloudBlob(_configuration.FinishVisitReportsContainer, serviceReportDetails.ReportPath);

                response.FileContent = report.Data;
                response.FileName = Path.GetFileName(serviceReportDetails.ReportPath);
                return await Task.FromResult(response);

            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}
