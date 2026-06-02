import type { AlertProps } from '@/types'

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: 'bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success-text)]',
    error: 'bg-[var(--color-error-bg)] border-[var(--color-error-border)] text-[var(--color-error-text)]',
  }

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border text-sm font-medium ${styles[type]}`}
    >
      <span className="font-bold shrink-0">
        {type === 'success' ? '✓' : '✕'}
      </span>
      <p className="flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="text-xl leading-none opacity-60 hover:opacity-100 transition-opacity duration-150 shrink-0"
        >
          ×
        </button>
      )}
    </div>
  )
}
