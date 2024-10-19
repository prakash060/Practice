namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Account
    {
        public Account()
        {
            CustomerAlignments = new HashSet<CustomerAlignment>();
            LocationLastSurveyVisits = new HashSet<LocationLastSurveyVisit>();
            Locations = new HashSet<Location>();
            SurveyQuestionScoringRules = new HashSet<SurveyQuestionScoringRule>();
        }

        public Guid AccountId { get; set; }
        public string CrmIntegrationId { get; set; } = null!;
        public string MajorAccount { get; set; } = null!;
        public Guid MarketTypeId { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
        public string? LogoImagePath { get; set; }
        public DateTime ChangeDate { get; set; }
        public string? SalesForceIntegrationId { get; set; }

        public virtual ICollection<CustomerAlignment> CustomerAlignments { get; set; }
        public virtual ICollection<LocationLastSurveyVisit> LocationLastSurveyVisits { get; set; }
        public virtual ICollection<Location> Locations { get; set; }
        public virtual ICollection<SurveyQuestionScoringRule> SurveyQuestionScoringRules { get; set; }
    }
}
