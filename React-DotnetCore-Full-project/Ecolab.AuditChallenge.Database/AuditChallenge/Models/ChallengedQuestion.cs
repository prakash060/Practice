using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecolab.AuditChallenge.Database.AuditChallenge.Models
{
    [Table("ChallengedQuestion")]
    public class ChallengedQuestion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column(Order = 1)]
        public Guid Id { get; set; }

        [ForeignKey("ChallengedAudit")]
        [Column(Order = 2)]
        public Guid ChallengedAuditId { get; set; }

        [Column(Order = 3)]
        public Guid SurveyQuestionId { get; set; }

        [Column(Order = 4)]
        public int QuestionNumber { get; set; }

        [Column(Order = 5)]
        [MaxLength(500)]
        public string QuestionText { get; set; }

        [Column(Order = 6)]
        [MaxLength(1000)]
        public string PickLists { get; set; }

        [Column(Order = 7)]
        [MaxLength(1000)]
        public string Notes { get; set; }

        [Column(Order = 8)]
        public bool IsChallenged { get; set; }

        [Column(Order = 9)]
        public bool IsReviewed { get; set; }

        [Column(Order = 10)]
        public DateTime ChangedDate { get; set; }

        [Column(Order = 11)]
        public bool IsActive { get; set; }

        public ChallengedAudit ChallengedAudit { get; set; }
        public ChallengedQuestionDetail ChallengedQuestionStatusDetails { get; set; }
    }
}
