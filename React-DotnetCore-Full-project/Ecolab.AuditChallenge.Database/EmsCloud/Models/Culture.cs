namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Culture
    {
        public Culture()
        {
            IssueTranslations = new HashSet<IssueTranslation>();
            ScoringCategoryTranslations = new HashSet<ScoringCategoryTranslation>();
            ScoringGradeTranslations = new HashSet<ScoringGradeTranslation>();
            ScoringGroupTranslations = new HashSet<ScoringGroupTranslation>();
            ServiceTypeTranslations = new HashSet<ServiceTypeTranslation>();
            SurveyQuestionTranslations = new HashSet<SurveyQuestionTranslation>();
            SurveyTranslations = new HashSet<SurveyTranslation>();
            SurveyTypeTranslations = new HashSet<SurveyTypeTranslation>();
            ZoneTranslations = new HashSet<ZoneTranslation>();
        }

        public string CultureCode { get; set; } = null!;
        public string LanguageCode { get; set; } = null!;
        public string? CountryCode { get; set; }
        public string Name { get; set; } = null!;
        public string NativeName { get; set; } = null!;
        public bool IsApplicationCulture { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
        public string? FallbackCultureCode { get; set; }

        public virtual ICollection<IssueTranslation> IssueTranslations { get; set; }
        public virtual ICollection<ScoringCategoryTranslation> ScoringCategoryTranslations { get; set; }
        public virtual ICollection<ScoringGradeTranslation> ScoringGradeTranslations { get; set; }
        public virtual ICollection<ScoringGroupTranslation> ScoringGroupTranslations { get; set; }
        public virtual ICollection<ServiceTypeTranslation> ServiceTypeTranslations { get; set; }
        public virtual ICollection<SurveyQuestionTranslation> SurveyQuestionTranslations { get; set; }
        public virtual ICollection<SurveyTranslation> SurveyTranslations { get; set; }
        public virtual ICollection<SurveyTypeTranslation> SurveyTypeTranslations { get; set; }
        public virtual ICollection<ZoneTranslation> ZoneTranslations { get; set; }
    }
}
