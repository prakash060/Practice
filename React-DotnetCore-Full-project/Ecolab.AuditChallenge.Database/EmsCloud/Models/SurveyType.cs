namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyType
    {
        public SurveyType()
        {
            SurveyTypeTranslations = new HashSet<SurveyTypeTranslation>();
        }

        public int SurveyTypeId { get; set; }
        public string EnumValue { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ICollection<SurveyTypeTranslation> SurveyTypeTranslations { get; set; }
    }
}
