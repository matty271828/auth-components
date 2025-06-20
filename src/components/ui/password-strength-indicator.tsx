import { Check, X } from "lucide-react"
import type { PasswordStrength } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  showRequirements?: boolean
}

export function PasswordStrengthIndicator({ 
  strength, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-semibold ${strength.color}`}>
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
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Requirements:</p>
          <div className="grid grid-cols-1 gap-2">
            {strength.requirements.map((requirement) => (
              <div 
                key={requirement.id}
                className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
                  requirement.met ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {requirement.met ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={requirement.met ? 'font-medium' : ''}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 