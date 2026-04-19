import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures a DOM element and exports it as a PDF file.
 * @param {HTMLElement} element - The DOM element to capture.
 * @param {string} filename - The output PDF filename (without extension).
 */
export async function exportElementToPdf(element, filename = 'meeting-briefing') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let yOffset = 0;
  let remainingHeight = imgHeight;

  while (remainingHeight > 0) {
    pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight);
    remainingHeight -= pageHeight;
    yOffset += pageHeight;
    if (remainingHeight > 0) pdf.addPage();
  }

  pdf.save(`${filename}.pdf`);
}

