
import type { PasswordStrength } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  showRequirements?: boolean
  compact?: boolean
  isEmpty?: boolean
  showLabel?: boolean
}

export function PasswordStrengthIndicator({ 
  strength, 
  showRequirements = true,
  compact = true,
  isEmpty = false,
  showLabel = true
}: PasswordStrengthIndicatorProps) {

  // Show empty state when no password is entered
  if (isEmpty) {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="h-2 rounded-full bg-gray-200" style={{ width: '0%' }} />
      </div>
    )
  }

  if (!showRequirements) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.score === 0 ? 'bg-red-500' :
              strength.score === 1 ? 'bg-orange-500' :
              strength.score === 2 ? 'bg-yellow-500' :
              strength.score === 3 ? 'bg-blue-500' :
              strength.score === 4 ? 'bg-green-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        {showLabel && (
          <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${strength.color}`}>
            {strength.label}
          </span>
        )}
      </div>
    )
  }

  if (compact) {
    const metCount = strength.requirements.filter(req => req.met).length
    const totalCount = strength.requirements.length
    
    return (
      <div className="space-y-2">
        {/* Compact strength bar with count */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`text-xs sm:text-sm font-semibold ${strength.color}`}>
              {strength.label}
            </span>
            <span className="text-xs text-gray-500">
              ({metCount}/{totalCount})
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.score <= 1 ? 'bg-red-500' :
              strength.score === 2 ? 'bg-orange-500' :
              strength.score === 3 ? 'bg-yellow-500' :
              strength.score === 4 ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        

      </div>
    )
  }

  // Full expanded view (original)
  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-xs sm:text-sm font-semibold ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.score <= 1 ? 'bg-red-500' :
              strength.score === 2 ? 'bg-orange-500' :
              strength.score === 3 ? 'bg-yellow-500' :
              strength.score === 4 ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      </div>


    </div>
  )
} 