using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecolab.AuditChallenge.Database.AuditChallenge.Models
{
    [Table("AccountConfiguration")]
    public class AccountConfiguration
    {
        [Column(Order = 1)]
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column(Order = 2)]
        public Guid AccountId { get; set; }

        [Column(Order = 3)]
        public string AccountName { get; set; }

        [Column(Order = 4)]
        public int LimitToChallenge { get; set; }

        [Column(Order = 5)]
        public int LimitToReview { get; set; }

        [Column(Order = 6)]
        public DateTime ChangedDate { get; set; }

        [Column(Order = 7)]
        public bool IsActive { get; set; }
    }
}
 