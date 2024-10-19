namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid SurveyId { get; set; }
        public string Name { get; set; } = null!;
        public string SurveyDescription { get; set; } = null!;
        public string? Abbreviation { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual Survey Survey { get; set; } = null!;
    }
}
