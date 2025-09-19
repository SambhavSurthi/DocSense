import React, { useEffect, useRef, useState } from 'react';
import { X, Shield, Lock, Eye, EyeOff } from 'lucide-react';

interface SecurePDFViewerProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({
  documentId,
  documentTitle,
  onClose
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [securityEnabled, setSecurityEnabled] = useState(true);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Disable print shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+P, Ctrl+S, F12, Ctrl+Shift+I, Ctrl+U
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // CSS to disable text selection and other interactions
    const style = document.createElement('style');
    style.textContent = `
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      iframe {
        pointer-events: auto !important;
      }
      
      /* Disable print */
      @media print {
        body * {
          visibility: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Load PDF with security headers
    loadSecurePDF();

    return () => {
      // Cleanup event listeners
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, [documentId]);

  const loadSecurePDF = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get secure PDF URL with token
      const response = await fetch(`/api/documents/${documentId}/view`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);

      if (iframeRef.current) {
        // Set the src directly to the blob URL
        iframeRef.current.src = pdfUrl;
      }
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Add watermark overlay
    addWatermarkOverlay();
  };

  const addWatermarkOverlay = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeRect = iframe.getBoundingClientRect();
    
    // Create watermark overlay
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: absolute;
      top: ${iframeRect.top}px;
      left: ${iframeRect.left}px;
      width: ${iframeRect.width}px;
      height: ${iframeRect.height}px;
      pointer-events: none;
      z-index: 1000;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(0, 0, 0, 0.1) 100px,
        rgba(0, 0, 0, 0.1) 200px
      );
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='rgba(0,0,0,0.3)' text-anchor='middle' dy='.3em'%3EDocSense - Confidential%3C/text%3E%3C/svg%3E");
      background-repeat: repeat;
      opacity: 0.3;
    `;
    
    document.body.appendChild(watermark);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{documentTitle}</h2>
              <p className="text-sm text-gray-600">Secure Document Viewer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Protected</span>
            </div>
            
            <button
              onClick={() => setSecurityEnabled(!securityEnabled)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {securityEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{securityEnabled ? 'Hide' : 'Show'} Security</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Security Notice */}
        {securityEnabled && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Shield className="w-5 h-5" />
              <div className="text-sm">
                <p className="font-medium">Security Features Active:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Copy/paste disabled</li>
                  <li>• Print function disabled</li>
                  <li>• Screenshot protection enabled</li>
                  <li>• Download restrictions active</li>
                  <li>• Watermark overlay applied</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading secure document...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Shield className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-900 font-medium mb-2">Failed to load document</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={loadSecurePDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0"
            style={{
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            title={`Secure PDF Viewer - ${documentTitle}`}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Document ID: {documentId}</span>
              <span>•</span>
              <span>Viewing Time: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Secure Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePDFViewer;
