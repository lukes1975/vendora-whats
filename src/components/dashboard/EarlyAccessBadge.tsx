
import { Badge } from '@/components/ui/badge';

const EarlyAccessBadge = () => {
  return (
    <Badge 
      variant="default" 
      className="bg-green-100 text-green-800 hover:bg-green-100 text-xs sm:text-sm px-2 py-1"
    >
      🟢 Vendora Early Access – All Pro Features Unlocked
    </Badge>
  );
};

export default EarlyAccessBadge;
