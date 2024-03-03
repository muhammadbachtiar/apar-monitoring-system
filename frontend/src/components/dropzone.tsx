// DropzoneComponent.tsx
import { useCallback  } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useDropzone, FileWithPath, FileRejection, DropEvent } from 'react-dropzone';

interface DropzoneComponentProps {
    onFileUpload: (files: FileWithPath[]) => void;
  }
  

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({ onFileUpload }) => {

    const onDrop = useCallback((acceptedFiles: FileWithPath[], fileRejections: FileRejection[], event: DropEvent) => {
        console.log('Accepted files:', acceptedFiles);
        console.log('Rejected files:', fileRejections);
        console.log('Drop event:', event);
        if (onFileUpload) {
          onFileUpload(acceptedFiles);
        }
      }, [onFileUpload]);

      const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles:5, maxSize: 5 * 1024 * 1024, });
      const acceptedFileItems: JSX.Element[] = acceptedFiles.map((file: FileWithPath) => (
        <li key={file.path}>
          {file.path} - {file.size} bytes
        </li>
      ));
  return (
    <Form.Group>
      <section className="border border-3 rounded my-3 mx-1 p-4">
        <div {...getRootProps({ className: 'dropzone border border-2 my-2 p-5 text-center' })}>
          <input {...getInputProps()} />
          <FontAwesomeIcon icon={faUpload} size='5x' className='mb-3' color='#93CAED'></FontAwesomeIcon>
          <p>Masukkan file hasil pemeriksaan</p>
        </div>
        <aside>
           <h4>Files</h4>
           <ul>{acceptedFileItems}</ul>
        </aside>
        {fileRejections.length > 0 && (
        <div className="small form-text text-danger">Max jumlah file: 5, Max ukuran file: 5MB (5242880 bytes)</div>
      )}
      </section>
    </Form.Group>
  );
}

export default DropzoneComponent;
