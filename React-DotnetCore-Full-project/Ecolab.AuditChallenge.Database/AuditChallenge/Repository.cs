using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public abstract class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        private readonly DbContext _context;
        private readonly DbSet<TEntity> _entity;

        public Repository(DbContext context)
        {
            _context = context;
            _entity = context.Set<TEntity>();
        }

        public virtual async Task<IQueryable<TEntity>> FindAll()
        {
            var result = _entity.AsNoTracking();
            return await Task.FromResult(result);
        }
        public virtual async Task<TEntity> FindById(object id)
        {
            return await _entity.FindAsync(id);
        }

        public virtual async Task<IQueryable<TEntity>> FindByCondition(Expression<Func<TEntity, bool>> expression)
        {
            var result = _entity.Where(expression).AsNoTracking();
            return await Task.FromResult(result);
        }
        public virtual async Task<TEntity> Create(TEntity entity)
        {
            await _entity.AddAsync(entity);
            return entity;
        }

        public virtual async Task<IEnumerable<TEntity>> CreateMany(IEnumerable<TEntity> entities)
        {
            await _entity.AddRangeAsync(entities);
            return entities;
        }

        public virtual async Task<TEntity> Update(TEntity entity)
        {
            await Task.Run(() => _entity.Update(entity));
            return entity;

        }

        public async Task<IEnumerable<TEntity>> UpdateMany(IEnumerable<TEntity> entities)
        {
            await Task.Run(() => _entity.UpdateRange(entities));
            return entities;
        }

        public virtual async Task Delete(object id)
        {
            TEntity entityToDelete = await _entity.FindAsync(id);

            if (entityToDelete != null)
                _entity.Remove(entityToDelete);
        }

        public virtual async Task DeleteMany(IEnumerable<object> ids)
        {
            var entitiesToDelete = new List<TEntity>();
            foreach (var id in ids)
            {
                TEntity entityToDelete = await _entity.FindAsync(id);
                if (entityToDelete != null)
                    entitiesToDelete.Add(entityToDelete);
            }

            if (entitiesToDelete.Any())
                _entity.RemoveRange(entitiesToDelete);
        }
    }
}
