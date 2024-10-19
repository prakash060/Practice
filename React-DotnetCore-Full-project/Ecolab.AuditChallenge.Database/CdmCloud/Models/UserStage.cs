namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class UserStage
    {
        public int UserKey { get; set; }
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? EmployeeNumber { get; set; }
        public string? FederationIdentifier { get; set; }
        public string? Culture { get; set; }
        public string? Currency { get; set; }
        public string UserStatusCode { get; set; } = null!;
        public string UserType { get; set; } = null!;
        public string? TimeZoneId { get; set; }
        public string? Title { get; set; }
        public string? Locale { get; set; }
        public string? Language { get; set; }
        public bool? IsMultisite { get; set; }
        public string? Createdby { get; set; }
        public DateTime CreatedOn { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime ModifiedOn { get; set; }
        public int? DataIntgExecId { get; set; }
        public string? RedemptionUrl { get; set; }
        public string? CompletionUrl { get; set; }
        public string? B2cAzureObjectId { get; set; }
        public string? B2bAzureObjectId { get; set; }
    }
}
