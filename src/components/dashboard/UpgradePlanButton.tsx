
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

const UpgradePlanButton = () => {
  return (
    <Link to="/pricing">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Crown className="h-4 w-4" />
        <span className="hidden sm:inline">Upgrade Plan</span>
        <span className="sm:hidden">Upgrade</span>
      </Button>
    </Link>
  );
};

export default UpgradePlanButton;
