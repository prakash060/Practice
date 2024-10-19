using AutoMapper;
using Ecolab.AuditChallenge.Api.Models.Admin;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;
using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Api.Models
{
    public class ModelMapper: Profile
    {
        public ModelMapper()
        {
            //---------Challenge audit-------------------------
            CreateMap<ChallengeAuditModel, ChallengedAudit>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.StatusId))
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<ChallengedAudit, ChallengeAuditModel>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => new AuditStatus { StatusId = src.Status, StatusText = string.Empty }));

            CreateMap<ChallengeQuestionModel, ChallengedQuestion>()
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<ChallengedQuestion, ChallengeQuestionModel>();

            CreateMap<ChallengeQuestionDetailsModel, ChallengedQuestionDetail>()
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<ChallengedQuestionDetail, ChallengeQuestionDetailsModel>();

            //---------Review challenged audit-------------------------
            CreateMap<ReviewAuditModel, ChallengedAudit>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.StatusId))
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<ChallengedAudit, ReviewAuditModel>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => new AuditStatus { StatusId = src.Status, StatusText = string.Empty }));

            CreateMap<ReviewQuestionModel, ChallengedQuestion>()
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<ChallengedQuestion, ReviewQuestionModel>();

            CreateMap<ReviewQuestionDetailsModel, ChallengedQuestionDetail>()
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<ChallengedQuestionDetail, ReviewQuestionDetailsModel>();


            //---------Configurations-------------------------
            CreateMap<AccountConfigurationModel, AccountConfiguration>()
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<AccountConfiguration, AccountConfigurationModel>();

            CreateMap<RoleConfigurationModel, RoleConfiguration>()
                .ForMember(dest => dest.ChangedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<RoleConfiguration, RoleConfigurationModel>();
        }
    }
}
