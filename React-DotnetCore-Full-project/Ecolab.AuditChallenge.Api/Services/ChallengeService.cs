using AutoMapper;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Enums;
using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;
using Ecolab.AuditChallenge.Database.AuditChallenge;
using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class ChallengeService : IChallengeService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IConfigReader _configuration;
        private readonly IConfigurationService _configurationService;
        private readonly ILogger _logger;
        public ChallengeService(IUnitOfWork unitOfWork, IMapper mapper, IConfigurationService configurationService, IConfigReader configuration, ILogger<ChallengeService> logger)
        {
            _uow = unitOfWork;
            _mapper = mapper;
            _configurationService = configurationService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<IEnumerable<ChallengeAuditModel>> GetChallengeAudits(IEnumerable<Guid> locations)
        {
            try
            {
                if (locations == null || !locations.Any())
                    throw new ArgumentNullException("locations parameter is null or empty");

                var accountConfiguration = await _configurationService.GetAccountConfigurationByAccountId(new Guid(_configuration.DefaultAccountId));
                var dateLimit = DateTime.Now.AddDays(-accountConfiguration.LimitToReview);

                var challengedAudits = await _uow.ChallengedAudits.GetChallengedAuditsByLocations(locations, dateLimit);
                var audits = challengedAudits.Select(a => new ChallengeAuditModel
                {
                    Id = a.Id,
                    ServiceResponseId = a.ServiceResponseId,
                    LocationId = a.LocationId,
                    AccountId = a.AccountId,
                    Location = a.Location,
                    UnitNumber = a.UnitNumber,
                    SurveyName= a.SurveyName,
                    VisitDate = a.VisitDate,
                    FindingsCount = a.FindingsCount,
                    ChangedDate = a.ChangedDate,
                    Status = GetAuditStatus((AuditStatusEnum)a.Status)
                });
                return await Task.FromResult(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ChallengeAuditModel>());
            }
        }

        public async Task<IEnumerable<ReviewAuditModel>> GetReviewAudits(IEnumerable<Guid> locations)
        {
            try
            {
                if (locations == null || !locations.Any())
                    throw new ArgumentNullException("locations parameter is null or empty");

                var accountConfiguration = await _configurationService.GetAccountConfigurationByAccountId(new Guid(_configuration.DefaultAccountId));
                
                var dateLimit = DateTime.Now.AddDays(-accountConfiguration.LimitToReview);

                var challengedAudits = await _uow.ChallengedAudits.GetChallengedAuditsByLocations(locations, dateLimit);
                var audits = challengedAudits.Where(x => x.ChangedDate > dateLimit)
                    .Select(a => new ReviewAuditModel
                {
                    Id = a.Id,
                    ServiceResponseId = a.ServiceResponseId,
                    LocationId = a.LocationId,
                    AccountId = a.AccountId,
                    Location = a.Location,
                    UnitNumber = a.UnitNumber,
                    SurveyName = a.SurveyName,
                    VisitDate = a.VisitDate,
                    FindingsCount = a.FindingsCount,
                    ChangedDate = a.ChangedDate,
                    Status = GetAuditStatus((AuditStatusEnum)a.Status == AuditStatusEnum.Submitted ? AuditStatusEnum.New : (AuditStatusEnum)a.Status)
                });
                return await Task.FromResult(audits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ReviewAuditModel>());
            }
        }

        public async Task<IEnumerable<ChallengeQuestionModel>> GetChallengeQuestions(Guid serviceResponseId)
        {
            try
            {
                if (serviceResponseId == default)
                    throw new ArgumentNullException("serviceResponseId parameter is null or empty");

                var questions = new List<ChallengeQuestionModel>();
                var audit = await _uow.ChallengedAudits.GetChallengedAuditByServiceResponseId(serviceResponseId);

                if (audit == null) return questions;
                var challengedQuestions = await _uow.ChallengedQuestions.GetChallengedQuestionsByChallengedAuditId(audit.Id);

                questions = challengedQuestions.Select(cq => new ChallengeQuestionModel
                {
                    Id = cq.Id,
                    ChallengedAuditId = cq.ChallengedAuditId,
                    ServiceResponseId = serviceResponseId,
                    SurveyQuestionId = cq.SurveyQuestionId,
                    QuestionNumber = cq.QuestionNumber,
                    Notes = cq.Notes,
                    QuestionText = cq.QuestionText,
                    PickLists = cq.PickLists,
                    IsChallenged = cq.IsChallenged,
                    ChallengeNotes = cq.ChallengedQuestionStatusDetails.ChallengeNotes,
                    ReviewNotes = cq.ChallengedQuestionStatusDetails?.ReviewNotes,
                    DepartmentName = cq.ChallengedQuestionStatusDetails?.DepartmentName ?? "--",
                }).ToList();

                return questions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ChallengeQuestionModel>());
            }
        }

        public async Task<IEnumerable<ReviewQuestionModel>> GetReviewQuestions(Guid serviceResponseId)
        {
            try
            {
                if (serviceResponseId == default)
                    throw new ArgumentNullException("serviceResponseId parameter is null or empty");

                var questions = new List<ReviewQuestionModel>();
                var audit = await _uow.ChallengedAudits.GetChallengedAuditByServiceResponseId(serviceResponseId);

                if (audit == null) return questions;
                var challengedQuestions = await _uow.ChallengedQuestions.GetChallengedQuestionsByChallengedAuditId(audit.Id);

                questions = challengedQuestions.Select(cq => new ReviewQuestionModel
                {
                    Id = cq.Id,
                    ChallengedAuditId = cq.ChallengedAuditId,
                    ServiceResponseId = serviceResponseId,
                    SurveyQuestionId = cq.SurveyQuestionId,
                    QuestionNumber = cq.QuestionNumber,
                    Notes = cq.Notes,
                    QuestionText = cq.QuestionText,
                    PickLists = cq.PickLists,
                    ChallengeNotes = cq.ChallengedQuestionStatusDetails.ChallengeNotes,
                    ReviewAction = cq.ChallengedQuestionStatusDetails.Status,
                    ReviewNotes = cq.ChallengedQuestionStatusDetails.ReviewNotes ?? string.Empty,
                    DepartmentName = cq.ChallengedQuestionStatusDetails?.DepartmentName ?? "--",
                }).ToList();

                return questions;
            }
            catch (Exception ex )
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ReviewQuestionModel>());
            }
        }

        public async Task SaveChallenge(ChallengeModel challengeModel)
        {
            try
            {
                if (challengeModel == null)
                    throw new ArgumentNullException("challengeModel parameter is null");

                var challengedAuditId = await AddOrUpdateChallengedAudit(challengeModel);

                await AddOrUpdateChallengedQuestions(challengeModel, challengedAuditId);

                await AddOrUpdateChallengedQuestionsDetails(challengeModel);

                await _uow.Save();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
            }
        }

        private async Task AddOrUpdateChallengedQuestionsDetails(ChallengeModel challengeModel)
        {

            foreach (var question in challengeModel.ChallengeQuestions)
            {
                var questionDetail = new ChallengeQuestionDetailsModel
                {
                    ChallengedQuestionId = question.Id,
                    ChallengedDate = DateTime.UtcNow,
                    ChallengedBy = challengeModel.UserName,
                    ChallengeNotes = question?.ChallengeNotes?? string.Empty,
                    DepartmentName= question?.DepartmentName ?? string.Empty,
                };
                var mappedDetails = _mapper.Map<ChallengedQuestionDetail>(questionDetail);
                var existingQuestionDetail = await _uow.ChallengedQuestionStatusDetails.GetChallengedQuestionsByChallengedQuestionId(question.Id);
                if (existingQuestionDetail == null)
                {
                    await _uow.ChallengedQuestionStatusDetails.InsertChallengedQuestionStatusDetail(mappedDetails);
                }
                else
                {
                    mappedDetails.Id = existingQuestionDetail.Id;
                    await _uow.ChallengedQuestionStatusDetails.UpdateChallengedQuestionStatusDetail(mappedDetails);
                }
            }

        }

        private async Task AddOrUpdateChallengedQuestions(ChallengeModel challengeModel, Guid challengedAuditId)
        {
            foreach (var question in challengeModel.ChallengeQuestions)
            {
                question.ChallengedAuditId = challengedAuditId;
                var mappedQuestion = _mapper.Map<ChallengedQuestion>(question);
                var existingQuestion = await _uow.ChallengedQuestions.GetChallengedQuestionById(question.Id);
                if (existingQuestion == null)
                {
                    var createdQuestion = await _uow.ChallengedQuestions.InsertChallengedQuestion(mappedQuestion);
                    question.Id = createdQuestion.Id;
                }
                else
                {
                    mappedQuestion.Id = existingQuestion.Id;
                    await _uow.ChallengedQuestions.UpdateChallengedQuestion(mappedQuestion);
                }
            }
        }

        private async Task<Guid> AddOrUpdateChallengedAudit(ChallengeModel challengeModel)
        {
            challengeModel.ChallengeAudit.Status = new AuditStatus { StatusId = (int)AuditStatusEnum.Submitted };
            var mappedChallengedAudit = _mapper.Map<ChallengedAudit>(challengeModel.ChallengeAudit);
            var existingAudit = await _uow.ChallengedAudits.GetChallengedAuditById(challengeModel.ChallengeAudit.Id);
            if (existingAudit == null)
            {
                var createdChallengedAudit = await _uow.ChallengedAudits.InsertChallengedAudit(mappedChallengedAudit);
                return createdChallengedAudit.Id;
            }
            else
            {
                mappedChallengedAudit.Id = existingAudit.Id;
                await _uow.ChallengedAudits.UpdateChallengedAudit(mappedChallengedAudit);
            }

            return existingAudit.Id;
        }

        public async Task SaveReview(ReviewModel reviewModel)
        {
            try
            {
                if (reviewModel == null)
                    throw new ArgumentNullException("reviewModel parameter is null");

                //Do not change the sequence of execution
                await AddOrUpdateReviewedQuestions(reviewModel);
                await AddOrUpdateReviewedQuestionsDetails(reviewModel);
                await _uow.Save();

                await AddOrUpdateReviewedAudit(reviewModel);
                await _uow.Save();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
            }
        }

        private async Task AddOrUpdateReviewedQuestionsDetails(ReviewModel reviewModel)
        {
            foreach (var question in reviewModel.ReviewQuestions)
            {
                var existingQuestionDetail = await _uow.ChallengedQuestionStatusDetails.GetChallengedQuestionsByChallengedQuestionId(question.Id);
                if (existingQuestionDetail == null) continue;

                var questionDetail = new ReviewQuestionDetailsModel
                {
                    Id = existingQuestionDetail.Id,
                    ChallengedQuestionId = existingQuestionDetail.ChallengedQuestionId,
                    ChallengedBy = existingQuestionDetail.ChallengedBy,
                    ChallengedDate = DateTime.UtcNow,
                    ChallengeNotes = existingQuestionDetail.ChallengeNotes,
                    ReviewedBy = question.ReviewedBy,
                    ReviewedDate = DateTime.UtcNow,
                    ReviewNotes = question.ReviewNotes,
                    Status = question.ReviewAction,
                    DepartmentName = question?.DepartmentName ?? string.Empty,
                };
                var mappedDetails = _mapper.Map<ChallengedQuestionDetail>(questionDetail);
                await _uow.ChallengedQuestionStatusDetails.UpdateChallengedQuestionStatusDetail(mappedDetails);
            }
        }

        private async Task AddOrUpdateReviewedQuestions(ReviewModel reviewModel)
        {
            foreach (var question in reviewModel.ReviewQuestions)
            {
                var existingQuestion = await _uow.ChallengedQuestions.GetChallengedQuestionById(question.Id);
                if (existingQuestion == null) continue;

                var questionToUpdate = new ReviewQuestionModel
                {
                    Id = existingQuestion.Id,
                    ChallengedAuditId = existingQuestion.ChallengedAuditId,
                    SurveyQuestionId = existingQuestion.SurveyQuestionId,
                    QuestionNumber = existingQuestion.QuestionNumber,
                    QuestionText = existingQuestion.QuestionText,
                    PickLists = existingQuestion.PickLists,
                    Notes = existingQuestion.Notes,
                    IsChallenged = existingQuestion.IsChallenged,
                    IsReviewed = true
                };

                var mappedQuestion = _mapper.Map<ChallengedQuestion>(questionToUpdate);

                await _uow.ChallengedQuestions.UpdateChallengedQuestion(mappedQuestion);
            }
        }
        private async Task<Guid> AddOrUpdateReviewedAudit(ReviewModel reviewModel)
        {
            var existingAudit = await _uow.ChallengedAudits.GetChallengedAuditById(reviewModel.ReviewAudit.Id);
            if (existingAudit == null) return default;
            var currentAuditStatus = await GetCurrentAuditStatus(existingAudit.Id);

            var auditToUpdate = new ReviewAuditModel
            {
                Id = existingAudit.Id,
                ServiceResponseId = existingAudit.ServiceResponseId,
                AccountId = existingAudit.AccountId,
                LocationId = existingAudit.LocationId,
                Location = existingAudit.Location,
                UnitNumber = existingAudit.UnitNumber,
                SurveyName= existingAudit.SurveyName,
                VisitDate = existingAudit.VisitDate,
                FindingsCount = existingAudit.FindingsCount,
                Status = new AuditStatus { StatusId = (int)currentAuditStatus }
            };

            var mappedChallengedAudit = _mapper.Map<ChallengedAudit>(auditToUpdate);
            await _uow.ChallengedAudits.UpdateChallengedAudit(mappedChallengedAudit);

            return existingAudit.Id;
        }

        private async Task<AuditStatusEnum> GetCurrentAuditStatus(Guid auditId)
        {
            var allQuestions = await _uow.ChallengedQuestions.GetChallengedQuestionsByChallengedAuditId(auditId);
            if (allQuestions.ToList().TrueForAll(x => x.ChallengedQuestionStatusDetails.Status == (int)ReviewActionEnum.None))
                return AuditStatusEnum.Submitted;

            if (allQuestions.ToList().TrueForAll(x => x.ChallengedQuestionStatusDetails.Status == (int)ReviewActionEnum.Approved))
                return AuditStatusEnum.Approved;

            if (allQuestions.ToList().TrueForAll(x => x.ChallengedQuestionStatusDetails.Status == (int)ReviewActionEnum.Declined))
                return AuditStatusEnum.Declined;

            if (allQuestions.ToList().Any(x => x.ChallengedQuestionStatusDetails.Status == (int)ReviewActionEnum.None))
                return AuditStatusEnum.PartiallyReviewed;

            return AuditStatusEnum.PartiallyApproved;
        }

        private static AuditStatus GetAuditStatus(AuditStatusEnum auditStatusEnum)
        {
            var status = new AuditStatus { StatusId = (int)auditStatusEnum };
            switch (auditStatusEnum)
            {
                case AuditStatusEnum.New:
                    {
                        status.StatusText = "New";
                        break;
                    }
                case AuditStatusEnum.Challenge:
                    {
                        status.StatusText = "Challenge";
                        break;
                    }

                case AuditStatusEnum.Submitted:
                    {
                        status.StatusText = "Submitted";
                        break;
                    }
                case AuditStatusEnum.Approved:
                    {
                        status.StatusText = "Approved";
                        break;
                    }
                case AuditStatusEnum.Declined:
                    {
                        status.StatusText = "Declined";
                        break;
                    }
                case AuditStatusEnum.PartiallyApproved:
                    {
                        status.StatusText = "Partially Approved";
                        break;
                    }
                case AuditStatusEnum.PartiallyReviewed:
                    {
                        status.StatusText = "Partially Reviewed";
                        break;
                    }
                case AuditStatusEnum.Closed:
                    {
                        status.StatusText = "Closed";
                        break;
                    }

                default: break;
            }

            return status;
        }
    }
}
