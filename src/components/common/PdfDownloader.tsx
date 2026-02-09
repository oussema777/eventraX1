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
  const handleDownloadPdf = async () => {
    const element = document.getElementById(rootElementId);
    if (!element || !element.innerHTML) {
      console.error(`Element with ID "${rootElementId}" not found or is empty.`);
      return;
    }

    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Directly pass the innerHTML string to html2pdf
      await html2pdf().set(opt).from(element.innerHTML).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Optionally, show a toast or other user feedback
    }
    // No need to remove cloned element as we are no longer cloning
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
