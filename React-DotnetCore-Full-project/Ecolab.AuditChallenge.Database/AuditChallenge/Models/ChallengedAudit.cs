using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecolab.AuditChallenge.Database.AuditChallenge.Models
{
    [Table("ChallengedAudit")]
    public class ChallengedAudit
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column(Order = 1)]
        public Guid Id { get; set; }

        [Required]
        [Column(Order = 2)]
        public Guid ServiceResponseId { get; set; }

        [Column(Order = 3)]
        public Guid AccountId { get; set; }

        [Column(Order = 4)]
        public Guid LocationId { get; set; }

        [Column(Order = 5)]
        [MaxLength(200)]
        public string Location { get; set; }

        [Column(Order = 6)]
        [MaxLength(200)]
        public string SurveyName { get; set; }

        [Column(Order = 7)]
        [MaxLength(20)]
        public string UnitNumber { get; set; }

        [Column(Order = 8)]
        public DateTime VisitDate { get; set; }

        [Column(Order = 9)]
        public int FindingsCount { get; set; }

        [Column(Order = 10)]
        public int Status { get; set; }

        [Column(Order = 11)]
        public DateTime ChangedDate { get; set; }

        [Column(Order = 12)]
        public bool IsActive { get; set; }
        public ICollection<ChallengedQuestion> ChallengedQuestions { get; set; }
    }
}
