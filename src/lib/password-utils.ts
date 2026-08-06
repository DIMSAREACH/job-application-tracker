export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  progress: number; // 0 to 100
  checks: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  let score = 0;
  if (checks.hasMinLength) score++;
  if (checks.hasUppercase && checks.hasLowercase) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  if (password.length >= 12 && score >= 3) score++;

  let label: PasswordStrengthResult["label"] = "Too Weak";
  let color = "bg-rose-500 text-rose-500";
  let progress = 20;

  switch (score) {
    case 1:
      label = "Weak";
      color = "bg-rose-500 text-rose-500";
      progress = 25;
      break;
    case 2:
      label = "Fair";
      color = "bg-amber-500 text-amber-500";
      progress = 50;
      break;
    case 3:
      label = "Strong";
      color = "bg-indigo-500 text-indigo-500";
      progress = 75;
      break;
    case 4:
    case 5:
      label = "Very Strong";
      color = "bg-emerald-500 text-emerald-500";
      progress = 100;
      break;
    default:
      label = "Too Weak";
      color = "bg-rose-500 text-rose-500";
      progress = 15;
  }

  return { score, label, color, progress, checks };
}

export function generateStrongPassword(length = 14): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+-=";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password.split("").sort(() => 0.5 - Math.random()).join("");
}
