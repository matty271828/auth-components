import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common passwords to check against
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
  'princess', 'qwerty123', 'football', 'baseball', 'superman', 'batman',
  'trustno1', 'hello123', 'freedom', 'whatever', 'qazwsx', 'password1',
  '12345678', '1234567', '123123', '111111', '000000', 'qwertyuiop',
  'asdfghjkl', 'zxcvbnm', '1q2w3e4r', '1qaz2wsx', 'q1w2e3r4', 'abcd1234'
];

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  requirements: PasswordRequirement[];
}

/**
 * Check if password contains sequential patterns
 */
function hasSequentialPatterns(password: string): boolean {
  const sequences = [
    '123456', '234567', '345678', '456789', '567890',
    'abcdef', 'bcdefg', 'cdefgh', 'defghi', 'efghij',
    'ghijkl', 'hijklm', 'ijklmn', 'jklmno', 'klmnop',
    'lmnopq', 'mnopqr', 'nopqrs', 'opqrst', 'pqrstu',
    'qrstuv', 'rstuvw', 'stuvwx', 'tuvwxy', 'uvwxyz',
    'qwerty', 'wertyu', 'ertyui', 'rtyuio', 'tyuiop',
    'asdfgh', 'sdfghj', 'dfghjk', 'fghjkl', 'ghjklz'
  ];
  
  return sequences.some(seq => password.toLowerCase().includes(seq));
}

/**
 * Check if password has more than 2 consecutive identical characters
 */
function hasRepeatedCharacters(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

/**
 * Validate password strength and return detailed feedback
 */
export function validatePassword(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 12 characters',
      test: (pwd) => pwd.length >= 12,
      met: false
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
      met: false
    },
    {
      id: 'numbers',
      label: 'At least one number (0-9)',
      test: (pwd) => /\d/.test(pwd),
      met: false
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
      met: false
    },
    {
      id: 'common',
      label: 'Not a common password',
      test: (pwd) => !COMMON_PASSWORDS.includes(pwd.toLowerCase()),
      met: false
    },
    {
      id: 'sequential',
      label: 'No sequential patterns',
      test: (pwd) => !hasSequentialPatterns(pwd),
      met: false
    },
    {
      id: 'repeated',
      label: 'No more than 2 consecutive identical characters',
      test: (pwd) => !hasRepeatedCharacters(pwd),
      met: false
    }
  ];

  // Test each requirement
  requirements.forEach(req => {
    req.met = req.test(password);
  });

  // Calculate strength score (0-5)
  const metRequirements = requirements.filter(req => req.met).length;
  const totalRequirements = requirements.length;
  const score = Math.floor((metRequirements / totalRequirements) * 5);

  // Determine strength label and color
  let label: string;
  let color: string;

  if (score === 0) {
    label = 'Very Weak';
    color = 'text-red-500';
  } else if (score === 1) {
    label = 'Weak';
    color = 'text-orange-500';
  } else if (score === 2) {
    label = 'Fair';
    color = 'text-yellow-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'text-blue-500';
  } else if (score === 4) {
    label = 'Strong';
    color = 'text-green-500';
  } else {
    label = 'Very Strong';
    color = 'text-emerald-500';
  }

  return {
    score,
    label,
    color,
    requirements
  };
}

/**
 * Check if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
  const strength = validatePassword(password);
  return strength.requirements.every(req => req.met);
}
