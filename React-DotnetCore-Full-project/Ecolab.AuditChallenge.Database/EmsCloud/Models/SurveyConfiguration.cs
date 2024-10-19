namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class SurveyConfiguration
    {
        public Guid SurveyId { get; set; }
        public bool EnableMarkUnobserved { get; set; }
        public string UnableToObserveComment { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool HideIssueCheckbox { get; set; }
        public bool IsDeviceLibraryCapture { get; set; }
        public bool CanBeChallenged { get; set; }

        public virtual Survey Survey { get; set; } = null!;
    }
}
