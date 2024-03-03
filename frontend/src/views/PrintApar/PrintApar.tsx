import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from 'react-bootstrap';


const PDFGenerator = ( data: {data: string} ) => {
    const handleGeneratePDF = () => {
        const input = document.getElementById('pdf-content');
    
        if (input) {
          html2canvas(input, { scale: 2 })
            .then((canvas) => {
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF('p', 'mm', 'a4');
              const imgWidth = 120;
              const x = (pdf.internal.pageSize.width - imgWidth) / 2;
              const y = 10;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
              pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
              pdf.save(`Kartu-Pemeriksaan-APAR-${data.data}.pdf`);
            });
        }
      };

  return (
    <div>
      <Button  onClick={handleGeneratePDF} className='col-12 my-2' variant='warning'>Cetak Kartu Pemeriksaan</Button>
    </div>
  );
};

export default PDFGenerator;
