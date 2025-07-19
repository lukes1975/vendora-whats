import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Crown, Zap, Target } from "lucide-react";

interface TransformationMessageProps {
  variant?: "success" | "power" | "elite" | "growth";
  title: string;
  description: string;
  className?: string;
}

const TransformationMessage = ({ 
  variant = "success", 
  title, 
  description, 
  className 
}: TransformationMessageProps) => {
  const variants = {
    success: {
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      badge: "WIN",
      badgeColor: "bg-green-600"
    },
    power: {
      icon: Zap,
      iconColor: "text-yellow-600",
      bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      badge: "POWER",
      badgeColor: "bg-yellow-600"
    },
    elite: {
      icon: Crown,
      iconColor: "text-purple-600",
      bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      badge: "ELITE",
      badgeColor: "bg-purple-600"
    },
    growth: {
      icon: Target,
      iconColor: "text-blue-600",
      bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      badge: "LEVEL UP",
      badgeColor: "bg-blue-600"
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      "p-4 rounded-xl border shadow-sm",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full bg-white/80 border", config.borderColor)}>
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">{title}</h4>
            <Badge className={cn("text-xs text-white border-0", config.badgeColor)}>
              {config.badge}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransformationMessage;