// Small shared UI pieces (moved out of App.jsx so Step 1 screens can reuse them).

export const Paw = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <ellipse cx="5" cy="11" rx="2" ry="2.6" /><ellipse cx="9.5" cy="6.5" rx="2" ry="2.8" />
    <ellipse cx="14.5" cy="6.5" rx="2" ry="2.8" /><ellipse cx="19" cy="11" rx="2" ry="2.6" />
    <path d="M12 12c-3 0-6 3.2-6 5.6 0 1.7 1.4 2.4 3 2.4 1.2 0 2-.5 3-.5s1.8.5 3 .5c1.6 0 3-.7 3-2.4C18 15.2 15 12 12 12z" />
  </svg>
)

export const Chip = ({ tone = 'ok', children }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tone === 'ok' ? 'bg-tint text-brand' : 'bg-warn-tint text-warn'}`}>{children}</span>
)

export const Card = ({ title, children, className = '' }) => (
  <section className={`rounded-2xl border border-line bg-card p-5 ${className}`}>
    {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
    {children}
  </section>
)

/**
 * Header lockup: "Daly Track" wordmark + smaller "Vet" product tag.
 * Always Latin letters and always LTR, even inside the Arabic (RTL) UI.
 */
export const Brand = ({ brand, product, stacked = false }) => (
  <span dir="ltr" lang="en" className={`inline-flex ${stacked ? 'flex-col items-start leading-tight' : 'items-center gap-1.5'}`}>
    <span className="text-xl font-bold text-ink">{brand}</span>
    <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">{product}</span>
  </span>
)
