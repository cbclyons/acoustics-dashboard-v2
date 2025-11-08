import { forwardRef, SelectHTMLAttributes, createContext, useContext, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export function Select({ children, value, onValueChange, defaultValue }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value: value || defaultValue, onValueChange }}>
      {children}
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export const SelectTrigger = forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(SelectContext)

    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input',
            'bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none',
            className
          )}
          value={context?.value}
          onChange={(e) => context?.onValueChange?.(e.target.value)}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

export function SelectValue() {
  return null // Value is handled by native select
}

interface SelectContentProps {
  children: ReactNode
}

export function SelectContent({ children }: SelectContentProps) {
  return <>{children}</>
}

interface SelectItemProps {
  value: string
  children: ReactNode
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>
}
