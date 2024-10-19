namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Employee
    {
        public Employee()
        {
            EmployeeAccessClaims = new HashSet<EmployeeAccessClaim>();
        }

        public Guid EmployeeId { get; set; }
        public string DomainLogin { get; set; } = null!;
        public string EmailAddress { get; set; } = null!;
        public string EmployeeNumber { get; set; } = null!;
        public string FamilyName { get; set; } = null!;
        public Guid? AddressId { get; set; }
        public DateTime? Birthdate { get; set; }
        public string? BusinessTelephoneNumber { get; set; }
        public DateTime? EmploymentStartDate { get; set; }
        public string? GivenName { get; set; }
        public string? HomeTelephoneNumber { get; set; }
        public Guid? ManagerEmployeeId { get; set; }
        public string? Title { get; set; }
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }
        public int? CrmIntegrationId { get; set; }
        public string? SalesForceIntegrationId { get; set; }
        public Guid BusinessUnitId { get; set; }

        public virtual ICollection<EmployeeAccessClaim> EmployeeAccessClaims { get; set; }
    }
}
