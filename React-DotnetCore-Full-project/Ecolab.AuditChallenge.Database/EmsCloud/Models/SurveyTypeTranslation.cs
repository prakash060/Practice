namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyTypeTranslation
    {
        public string CultureCode { get; set; } = null!;
        public int SurveyTypeId { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual SurveyType SurveyType { get; set; } = null!;
    }
}
