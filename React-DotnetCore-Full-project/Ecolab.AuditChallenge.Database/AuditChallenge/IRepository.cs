using System.Linq.Expressions;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IRepository<TEntity>
    {
        Task<IQueryable<TEntity>> FindAll();
        Task<TEntity> FindById(object id);
        Task<IQueryable<TEntity>> FindByCondition(Expression<Func<TEntity, bool>> expression);
        Task<TEntity> Create(TEntity entity);
        Task<IEnumerable<TEntity>> CreateMany(IEnumerable<TEntity> entities);
        Task<TEntity> Update(TEntity entity);
        Task<IEnumerable<TEntity>> UpdateMany(IEnumerable<TEntity> entities);
        Task Delete(object id);
        Task DeleteMany(IEnumerable<object> ids);
    }
}
