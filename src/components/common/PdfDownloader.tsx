// src/components/common/PdfDownloader.tsx
import React from 'react';
import html2pdf from 'html2pdf.js';

interface PdfDownloaderProps {
  rootElementId: string;
  fileName: string;
  buttonText?: string;
  buttonStyle?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

const PdfDownloader: React.FC<PdfDownloaderProps> = ({
  rootElementId,
  fileName,
  buttonText = 'Download as PDF',
  buttonStyle,
  className,
  disabled = false,
}) => {
  const handleDownloadPdf = async () => { // Made function async
    const element = document.getElementById(rootElementId);
    if (!element) {
      console.error(`Element with ID "${rootElementId}" not found.`);
      return;
    }

    // Clone the element to manipulate its visibility without affecting the original
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Apply temporary styles to the cloned element to make it renderable but off-screen
    clonedElement.style.display = 'block';
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.opacity = '0'; // Keep it invisible
    // Set a fixed width to prevent layout issues if content is too wide for standard A4 portrait
    clonedElement.style.width = '210mm'; // Standard A4 width
    clonedElement.style.padding = '20mm'; // Add some padding
    clonedElement.style.backgroundColor = 'white'; // Ensure background is white for print

    document.body.appendChild(clonedElement); // Temporarily append to body

    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true }, // Changed logging to false
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(clonedElement).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Optionally, show a toast or other user feedback
    } finally {
      document.body.removeChild(clonedElement); // Clean up: remove the cloned element
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      style={{
        padding: '12px 18px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#0684F5',
        color: '#FFFFFF',
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s',
        ...buttonStyle,
      }}
      className={className}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#0570D6';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#0684F5';
      }}
    >
      {buttonText}
    </button>
  );
};

export default PdfDownloader;
