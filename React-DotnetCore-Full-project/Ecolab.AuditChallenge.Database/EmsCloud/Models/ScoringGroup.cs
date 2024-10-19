namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ScoringGroup
    {
        public ScoringGroup()
        {
            RepeatViolationScoringGroups = new HashSet<RepeatViolationScoringGroup>();
            ScoringGroupTranslations = new HashSet<ScoringGroupTranslation>();
            SurveyZoneSectionScores = new HashSet<SurveyZoneSectionScore>();
        }

        public Guid ScoringGroupId { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }

        public virtual ICollection<RepeatViolationScoringGroup> RepeatViolationScoringGroups { get; set; }
        public virtual ICollection<ScoringGroupTranslation> ScoringGroupTranslations { get; set; }
        public virtual ICollection<SurveyZoneSectionScore> SurveyZoneSectionScores { get; set; }
    }
}
