import { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '../../lib/utils/cn'

export interface SliderProps {
  className?: string
  value?: number[]
  onValueChange?: (value: number[]) => void
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, defaultValue = [0], min = 0, max = 100, step = 1, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value ? value[0] : defaultValue[0])
    const localRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || localRef

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value[0])
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      setInternalValue(newValue)
      onValueChange?.([newValue])
    }

    const percentage = ((internalValue - Number(min)) / (Number(max) - Number(min))) * 100

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <div className="relative w-full h-2 bg-secondary rounded-full">
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ width: `${percentage}%` }}
          />
          <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={internalValue}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...props}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-background border-2 border-primary rounded-full shadow-sm transition-transform hover:scale-110"
            style={{ left: `calc(${percentage}% - 0.625rem)` }}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
