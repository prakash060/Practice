
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecolab.AuditChallenge.Database.AuditChallenge.Models
{
    [Table("RoleConfiguration")]
    public class RoleConfiguration
    {
        [Column(Order = 1)]
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column(Order = 2)]
        public string EmailId { get; set; }

        [Column(Order = 3)]
        public int RoleId { get; set; }

        [Column(Order = 5)]
        public DateTime ChangedDate { get; set; }

        [Column(Order = 6)]
        public bool IsActive { get; set; }
    }
}
