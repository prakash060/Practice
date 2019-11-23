using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EF6Bl
{
    [Table("tblPerson")]
    public class Person
    {        
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string CreatedBy { get; set; }
        [Column( TypeName = "datetime2")]
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        [Column(TypeName = "datetime2")]
        public DateTime? UpdatedDate { get; set; }
    }
}
