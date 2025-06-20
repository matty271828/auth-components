import { Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { PasswordStrength } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  showRequirements?: boolean
  compact?: boolean
}

export function PasswordStrengthIndicator({ 
  strength, 
  showRequirements = true,
  compact = true
}: PasswordStrengthIndicatorProps) {
  const [showFullRequirements, setShowFullRequirements] = useState(false)

  if (!showRequirements) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium">Password Strength</span>
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
    )
  }

  if (compact) {
    const metCount = strength.requirements.filter(req => req.met).length
    const totalCount = strength.requirements.length
    
    return (
      <div className="space-y-2">
        {/* Compact strength bar with count */}
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium">Password Strength</span>
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
        
        {/* Expandable requirements with fixed height container */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowFullRequirements(!showFullRequirements)}
            className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>Requirements</span>
            {showFullRequirements ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${
            showFullRequirements ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="grid grid-cols-1 gap-1.5 sm:gap-2 pl-2 pb-2">
              {strength.requirements.map((requirement) => (
                <div 
                  key={requirement.id}
                  className={`flex items-start space-x-2 text-xs sm:text-sm transition-colors duration-200 ${
                    requirement.met ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {requirement.met ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`leading-tight ${requirement.met ? 'font-medium' : ''}`}>
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
          <span className="text-xs sm:text-sm font-medium">Password Strength</span>
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

      {/* Requirements checklist */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm font-medium text-gray-700">Requirements:</p>
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {strength.requirements.map((requirement) => (
            <div 
              key={requirement.id}
              className={`flex items-start space-x-2 text-xs sm:text-sm transition-colors duration-200 ${
                requirement.met ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {requirement.met ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <span className={`leading-tight ${requirement.met ? 'font-medium' : ''}`}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 