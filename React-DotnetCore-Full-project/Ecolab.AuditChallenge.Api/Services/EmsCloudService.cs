using Ecolab.AuditChallenge.Api.Constants;
using Ecolab.AuditChallenge.Api.Contracts;
using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Database.EmsCloud;
using Microsoft.Data.SqlClient;
using Microsoft.Data.SqlClient.Server;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Cryptography;

namespace Ecolab.AuditChallenge.Api.Services
{
    public class EmsCloudService : IEmsCloudService
    {
        private readonly IConfigReader _configuration;
        private readonly ICdmService _cdmService;
        private readonly IConfigurationService _configurationService;
        private readonly ILogger _logger;
        public EmsCloudService(IConfigReader configuration, ICdmService cdmService, IConfigurationService configurationService, ILogger<EmsCloudService> logger)
        {
            _configuration = configuration;
            _cdmService = cdmService;
            _configurationService = configurationService;
            _logger = logger;
        }

        public async Task<IEnumerable<Guid>> GetUserLocations(string email)
        {
            try
            {
                var accountNumbers = await _cdmService.GetCdmAccountNumbersForUser(email);
                using EmsCloudContext emsContext = new();
                var locationIds = emsContext.Locations
                                            .Where(l => l.AccountId.ToString() == _configuration.DefaultAccountId)
                                            .ToList();


                // commented for time being need to cross check and enable if this filter needed

                //var userLocations = locationIds.Where(l => accountNumbers.Contains(l.CustomerAccountNumber))
                //                                .Select(x => x.LocationId);

                //return userLocations;

                return locationIds.Select(x => x.LocationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<Guid>());
            }
        }

        public async Task<List<ChallengeAuditModel>> GetEmsAudits(IEnumerable<Guid> locations)
        {
            try
            {
                var accountConfiguration = await _configurationService.GetAccountConfigurationByAccountId(new Guid(_configuration.DefaultAccountId));
                var dateLimit = DateTime.Now.AddDays(-accountConfiguration.LimitToChallenge);
                string cultureCode = "en-US";

                var audits = new List<ChallengeAuditModel>();
                using EmsCloudContext emsContext = new();
               
                var tableSchema = new List<SqlMetaData>(1)
                {
                    new SqlMetaData("Id", SqlDbType.UniqueIdentifier)
                }.ToArray();

                var table = new List<SqlDataRecord>();
                foreach (var location in locations)
                {
                    var tableRow = new SqlDataRecord(tableSchema);
                    tableRow.SetGuid(0, location);
                    table.Add(tableRow);
                }

                var tblParam = new SqlParameter
                {
                    SqlDbType = SqlDbType.Structured,
                    Direction = ParameterDirection.Input,
                    ParameterName = "locationsIds",
                    TypeName = "[dbo].[GuidList]",
                    Value = table
                };

                var dateParam = new SqlParameter
                {
                    SqlDbType = SqlDbType.DateTime,
                    Direction = ParameterDirection.Input,
                    ParameterName = "limit",
                    Value = dateLimit
                };

                var cultureCodeParam = new SqlParameter
                {
                    SqlDbType = SqlDbType.NVarChar,
                    Direction = ParameterDirection.Input,
                    ParameterName = "cultureCode",
                    Value = cultureCode
                };

                var allAudits = emsContext.ToBeChallengedAudits.FromSqlInterpolated($"[dbo].[sp_GetToBeChallengedAudits] {dateParam}, {tblParam}, {cultureCodeParam}").ToList();

                audits = allAudits.GroupBy(a => a.ServiceResponseId).Select(g =>
                {
                    var item = g.First();
                    return new ChallengeAuditModel
                    {
                        ServiceResponseId = item.ServiceResponseId,
                        LocationId = item.LocationId,
                        AccountId = item.AccountId,
                        Location = item.LocationName,
                        SurveyName = item.SurveyName,
                        UnitNumber = item.LocationIdentifier,
                        VisitDate = item.VisitStartTime.DateTime,
                        FindingsCount = 0
                    };

                    }).ToList();

                    return await Task.FromResult(audits.ToList());


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ChallengeAuditModel>());
            }
        }

        public async Task<IEnumerable<ChallengeQuestionModel>> GetEmsAuditQuestions(Guid serviceResponseId)
        {
            try
            {
                List<ChallengeQuestionModel> auditDetails = new();

                using EmsCloudContext emsContext = new();
                var auditResponseDetails = (from srd in emsContext.SurveyResponseDetails
                                            join ob in emsContext.Observations on srd.SurveyResponseDetailId equals ob.SurveyResponseDetailId
                                            join oi in emsContext.ObservationIssues on ob.ObservationId equals oi.ObservationId
                                            join it in emsContext.IssueTranslations on oi.IssueId equals it.IssueId
                                            join sqd in emsContext.SurveyQuestionDetails on srd.SurveyQuestionId equals sqd.SurveyQuestionId
                                            join sqt in emsContext.SurveyQuestionTranslations on sqd.SurveyQuestionId equals sqt.SurveyQuestionId
                                            join zt in emsContext.ZoneTranslations on srd.ZoneId equals zt.ZoneId
                                            where srd.ServiceResponseSurveyId == serviceResponseId
                                                  && sqd.IsCurrentlyActive
                                                  && it.IsActive.HasValue && it.IsActive.Value
                                                  && oi.IsActive
                                                  && ob.IsActive
                                                  && sqt.IsCurrentlyActive
                                                  && sqt.CultureCode == _configuration.DefaultCultureCode
                                                  && zt.CultureCode == _configuration.DefaultCultureCode
                                            select new
                                            {
                                                ServiceResponseId = srd.ServiceResponseSurveyId,
                                                SurveyQuestionId = sqd.SurveyQuestionId,
                                                QuestionText = sqt.QuestionText ?? string.Empty,
                                                Notes = oi.AdditionalComments ?? string.Empty,
                                                QuestionNumber = sqd.QuestionNumber,
                                                PickLists = it.IssueText,
                                                DepartmentName = string.IsNullOrEmpty(zt.Name) ? "--" : zt.Name,
                                            }).ToList();

                auditDetails = auditResponseDetails.GroupBy(a => a.SurveyQuestionId).Select(g =>
                {
                    var item = g.First();
                    return new ChallengeQuestionModel
                    {
                        ServiceResponseId = item.ServiceResponseId,
                        SurveyQuestionId = item.SurveyQuestionId,
                        QuestionText = item.QuestionText,
                        QuestionNumber = item.QuestionNumber,
                        Notes = item.Notes,
                        PickLists = item.PickLists,
                        IsChallenged = false,
                        DepartmentName = item.DepartmentName
                    };

                }).OrderBy(x => x.QuestionNumber).ToList();

                return await Task.FromResult(auditDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<ChallengeQuestionModel>());
            }
        }

        public async Task<ServiceReportModel> GetServiceReportDetails(Guid serviceResponseId)
        {
            try
            {
                ServiceReportModel serviceReportModel = new();
                using EmsCloudContext emsContext = new();
                var serviceReport = emsContext.ServiceReports.FirstOrDefault(p => p.ServiceResponseId == serviceResponseId);
                if (serviceReport == null) return serviceReportModel;

                serviceReportModel.ReportPath= serviceReport.ReportPath;
                serviceReportModel.ServiceReportId = serviceReport.ServiceReportId;
                serviceReportModel.VersionNumber = serviceReport.VersionNumber;
                serviceReportModel.ServiceResponseId = serviceReport.ServiceResponseId;
                serviceReportModel.LocationVisitId= serviceReport.LocationVisitId;

                return await Task.FromResult(serviceReportModel);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<IEnumerable<AccountModel>> GetAllCustomerAccounts()
        {
            try
            {
                var response = new List<AccountModel>();
                using EmsCloudContext emsContext = new();
                var accounts = emsContext.Accounts.Where(a => a.IsActive).ToList();

                if (accounts == null || !accounts.Any()) return response;

                response = accounts.Select(a => new AccountModel { AccountId = a.AccountId, AccountName = a.Name }).ToList();

                return response;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error- : {ex.Message}");
                return await Task.FromResult(new List<AccountModel>());
            }
        }
    }
}
