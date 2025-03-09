import { Progress } from "@/components/ui/progress";
import { calculatePasswordStrength } from "@/lib/encryption";

export default function PasswordStrength({ password }: { password: string }) {
  const strength = calculatePasswordStrength(password);
  const percentage = (strength / 5) * 100;

  const getStrengthColor = () => {
    if (percentage <= 20) return "bg-destructive";
    if (percentage <= 40) return "bg-orange-500";
    if (percentage <= 60) return "bg-yellow-500";
    if (percentage <= 80) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (percentage <= 20) return "Very Weak";
    if (percentage <= 40) return "Weak";
    if (percentage <= 60) return "Medium";
    if (percentage <= 80) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Password Strength</span>
        <span className={percentage > 60 ? "text-green-500" : "text-destructive"}>
          {getStrengthText()}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${getStrengthColor()}`}
      />
    </div>
  );
}
