
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  storeName?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, size = 200, storeName = 'Store' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `vendora-store-${storeName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;
      
      try {
        // Import QR code library dynamically
        const QRCode = (await import('qrcode')).default;
        
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Fallback: Draw a simple placeholder
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = '#6b7280';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', size / 2, size / 2);
        }
      }
    };
    
    generateQR();
  }, [url, size]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <canvas 
        ref={canvasRef} 
        className="border rounded-lg shadow-sm"
        width={size}
        height={size}
      />
      <div className="flex flex-col items-center space-y-2">
        <p className="text-xs text-gray-600 text-center max-w-[200px] break-all">
          Scan to visit store
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={downloadQRCode}
          className="text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          Download QR Code
        </Button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
