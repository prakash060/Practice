import { useEffect, useState } from 'react'
import { UserIcon } from './Icons'

export type AgentAvatarSize = 'xs' | 'sm' | 'md'

export interface AgentAvatarProps {
  photoUrl?: string | null
  name?: string
  size?: AgentAvatarSize
  className?: string
}

const ICON_SIZE: Record<AgentAvatarSize, number> = {
  xs: 20,
  sm: 36,
  md: 28,
}

/** Circular delivery-agent photo, or UserIcon placeholder when no photo is set. */
export function AgentAvatar({
  photoUrl,
  name = 'Agent',
  size = 'md',
  className = '',
}: AgentAvatarProps) {
  const hasPhoto = Boolean(photoUrl?.trim())
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [photoUrl])

  const showPlaceholder = !hasPhoto || imgFailed

  const classes = [
    'agent-avatar',
    `agent-avatar--${size}`,
    showPlaceholder ? 'agent-avatar--placeholder' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (showPlaceholder) {
    return (
      <div
        className={classes}
        role="img"
        aria-label={name ? `${name} — no photo` : 'No photo'}
      >
        <UserIcon size={ICON_SIZE[size]} />
      </div>
    )
  }

  return (
    <div className={classes}>
      <img
        src={photoUrl!}
        alt={name}
        onError={() => setImgFailed(true)}
      />
    </div>
  )
}
