namespace LinqPractice.Data
{
    public class Employee
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public int DepartmentId { get; set; }

        public override bool Equals(object obj)
        {
            return Name == ((Employee)obj).Name;    
        }

        public override int GetHashCode()
        {
            return Name.GetHashCode();
        }
    }
}
