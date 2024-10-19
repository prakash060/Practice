namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Zone
    {
        public Zone()
        {
            RepeatViolations = new HashSet<RepeatViolation>();
            SurveyResponseDetails = new HashSet<SurveyResponseDetail>();
            SurveyResponseZoneSectionSummaries = new HashSet<SurveyResponseZoneSectionSummary>();
            ZoneTranslations = new HashSet<ZoneTranslation>();
        }

        public Guid ZoneId { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ICollection<RepeatViolation> RepeatViolations { get; set; }
        public virtual ICollection<SurveyResponseDetail> SurveyResponseDetails { get; set; }
        public virtual ICollection<SurveyResponseZoneSectionSummary> SurveyResponseZoneSectionSummaries { get; set; }
        public virtual ICollection<ZoneTranslation> ZoneTranslations { get; set; }
    }
}
