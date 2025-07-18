import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { sendToWhatsappImporter } from "@/services/whatsappImporter";
import { toast } from "sonner";

interface WhatsAppImportButtonProps {
  phone: string;
  className?: string;
}

export default function WhatsAppImportButton({ phone, className }: WhatsAppImportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [lastImportStatus, setLastImportStatus] = useState<'success' | 'error' | null>(null);

  const handleImport = async () => {
    if (!phone || phone.trim() === '') {
      toast.error("Please add your WhatsApp number in settings first");
      return;
    }

    setLoading(true);
    setLastImportStatus(null);
    
    try {
      const result = await sendToWhatsappImporter(phone.trim());
      
      if (result.success) {
        setLastImportStatus('success');
        toast.success(
          `Import successful! ${result.imported_count ? `Imported ${result.imported_count} products` : 'Products synced from WhatsApp'}`
        );
      } else {
        setLastImportStatus('error');
        toast.error(result.message || "Import failed");
      }
    } catch (error) {
      setLastImportStatus('error');
      const errorMessage = error instanceof Error ? error.message : "Import failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonIcon = () => {
    if (loading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    if (lastImportStatus === 'success') return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
    if (lastImportStatus === 'error') return <AlertCircle className="mr-2 h-4 w-4 text-red-500" />;
    return <MessageSquare className="mr-2 h-4 w-4" />;
  };

  const getButtonText = () => {
    if (loading) return "Importing...";
    if (lastImportStatus === 'success') return "Import Successful";
    if (lastImportStatus === 'error') return "Try Again";
    return "Import from WhatsApp";
  };

  return (
    <Button 
      onClick={handleImport}
      disabled={loading}
      variant={lastImportStatus === 'success' ? 'outline' : 'default'}
      className={className}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}