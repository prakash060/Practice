import type { FoodItem } from '../../types/food'
import { useEffect, useMemo, useState } from 'react'
import { useFood } from '../../hooks/useFood'
import { MinusIcon, PlusIcon } from '../Icons'

interface FoodCardProps {
  item: FoodItem
}

export function FoodCard({ item }: FoodCardProps) {
  const { cartItems, addToCart, removeFromCart, getCategoryMeta } = useFood()
  const categoryMeta = useMemo(
    () => getCategoryMeta(item.category),
    [getCategoryMeta, item.category]
  )
  const primarySrc = item.imageUrl || categoryMeta.imageUrl
  const [imageSrc, setImageSrc] = useState<string | null>(primarySrc)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageSrc(item.imageUrl || categoryMeta.imageUrl)
    setImageFailed(false)
  }, [item.imageUrl, categoryMeta.imageUrl])

  const quantity = cartItems.find((line) => line.id === item.id)?.quantity ?? 0
  const description = item.description?.trim()
  const showImage = Boolean(imageSrc) && !imageFailed

  return (
    <article className={`food-card ${quantity > 0 ? 'food-card--in-cart' : ''}`}>
      <div
        className={`food-card__media ${showImage ? '' : 'food-card__media--empty'}`}
      >
        {showImage ? (
          <img
            src={imageSrc!}
            alt={item.name}
            loading="lazy"
            onError={() => {
              if (imageSrc === item.imageUrl && categoryMeta.imageUrl) {
                setImageSrc(categoryMeta.imageUrl)
                return
              }
              setImageFailed(true)
            }}
          />
        ) : (
          <span className="food-card__media-emoji" aria-hidden="true">
            {categoryMeta.emoji}
          </span>
        )}
        {quantity > 0 ? (
          <span className="food-card__qty-badge" aria-hidden="true">
            {quantity} in cart
          </span>
        ) : null}
      </div>

      <div className="food-card__body">
        <div className="food-card__top">
          <h3 className="food-card__title">{item.name}</h3>
          <span className="food-card__price">₹{item.price}</span>
        </div>

        {description ? <p className="food-card__desc">{description}</p> : null}

        <div className="food-card__footer">
          {quantity === 0 ? (
            <button
              type="button"
              className="food-card__add btn-icon"
              onClick={() => addToCart(item)}
              aria-label={`Add ${item.name} to cart`}
            >
              <PlusIcon size={16} />
              <span>Add to cart</span>
            </button>
          ) : (
            <div
              className="qty-stepper qty-stepper--card"
              role="group"
              aria-label={`Quantity for ${item.name}`}
            >
              <button
                type="button"
                className="qty-stepper__btn qty-stepper__btn--minus"
                onClick={() => removeFromCart(item.id)}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={14} />
              </button>
              <span className="qty-stepper__count" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="qty-stepper__btn qty-stepper__btn--plus"
                onClick={() => addToCart(item)}
                aria-label="Increase quantity"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
