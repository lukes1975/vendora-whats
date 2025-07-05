
import { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url, size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    <div className="flex flex-col items-center space-y-2">
      <canvas 
        ref={canvasRef} 
        className="border rounded-lg shadow-sm"
        width={size}
        height={size}
      />
      <p className="text-xs text-gray-600 text-center max-w-[200px] break-all">
        Scan to visit store
      </p>
    </div>
  );
};

export default QRCodeGenerator;
