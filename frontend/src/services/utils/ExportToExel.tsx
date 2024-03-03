import * as XLSX from 'xlsx';
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

interface ExportToExcelButtonProps<T> {
    data: T[];
    fileName: string;
  }
  
  const ExportToExcelButton = <T,>({ data, fileName }: ExportToExcelButtonProps<T>) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Button variant="warning" className='mx-1' onClick={exportToExcel} ><FontAwesomeIcon icon={faPrint} /></Button>
  );
};

export default ExportToExcelButton;
