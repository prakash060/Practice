
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecolab.AuditChallenge.Database.AuditChallenge.Models
{
    [Table("ChallengedQuestionDetail")]
    public class ChallengedQuestionDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column(Order = 1)]
        public Guid Id { get; set; }

        [ForeignKey("ChallengedQuestion")]
        [Column(Order = 2)]
        public Guid ChallengedQuestionId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column(Order = 3)]
        public string ChallengedBy { get; set; }

        [Required]
        [Column(Order = 4)]
        public DateTime ChallengedDate { get; set; }

        [MaxLength(1000)]
        [Column(Order = 5)]
        public string ChallengeNotes { get; set; }

        [MaxLength(50)]
        [Column(Order = 6)]
        public string? ReviewedBy { get; set; }

        [Column(Order = 7)]
        public DateTime? ReviewedDate { get; set; }

        [MaxLength(1000)]
        [Column(Order = 8)]
        public string? ReviewNotes { get; set; }

        [Column(Order = 9)]
        public int Status { get; set; }

        [Column(Order = 10)]
        public DateTime ChangedDate { get; set; }

        [Column(Order = 11)]
        public bool IsActive { get; set; }

        [Column(Order = 12)]
        public string? DepartmentName { get; set; }

        public ChallengedQuestion ChallengedQuestion { get; set; }
    }
}
