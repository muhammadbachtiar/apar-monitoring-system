import {Card, Button, Col, Form, Accordion, Row, Spinner} from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FileWithPath } from 'react-dropzone';
import { useForm, FieldValues, useFieldArray } from "react-hook-form";
import domainApi from '../../services/config/domainApi';
import Alert from 'react-bootstrap/Alert';
import DropzoneComponent from '../../components/dropzone';

type FormValues = {
  id_apar: string;
  checker_name: string;
  documents: {fileName: string, fileLink: string, fileId: string}[];
  result_check: { part: string; status: boolean; note: string }[];
  files: FileWithPath[];
  deletedDocuments: string[];
};

function UpdateInspection1Monthly() {
    const navigate = useNavigate();
    const { register, getValues, setValue, handleSubmit, control } = useForm<FormValues>({
        defaultValues:  {
            id_apar: '',
            checker_name: '',
            documents: [],
            result_check: [
                { part: 'Tabung', status: true, note: '' },
                { part: 'Pin', status: true, note:''  },
                { part: 'Segel', status: true, note: '' },
                { part: 'Pegangan', status: true, note: '' },
                { part: 'Label', status: true, note: '' },
                { part: 'Selang', status: true, note: '' },
                { part: 'Tekanan', status: true, note: '' },
                { part: 'Berat Tabung', status: true, note: '' },
                { part: 'Hasil Reaksi', status: true, note: '' },
                { part: 'Kondisi Powder', status: true, note: '' }
            ],
            files: [],
            deletedDocuments:[]
          },
    })

    const { fields, remove } = useFieldArray({
      control,
      name: 'documents',
    });

    const [aparData, setAparData]= useState({apar_number:"", apar_type:"", location: "", last_1montly_check_time: "", last_filing_time: "" })
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkboxStatus, setCheckboxStatus] = useState<boolean[]>([])
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const { id } = useParams();

    const handleFileUpload = (files : FileWithPath[]) => {
      setValue('files', files);
    };

    const handleDeleteDocument = (fileId: string, index: number) => {
      const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?");
      if (isConfirmed) {
        remove(index); 
        const currentDeletedDocuments = getValues('deletedDocuments');
        setValue('deletedDocuments', [...currentDeletedDocuments, fileId]);
      }
    };


    const handleUpdateInspection = async (data: FieldValues) => {
        const formData = new FormData();
        formData.append('id_apar', data.id_apar);
        formData.append('checker_name', data.checker_name);
        formData.append('deleted_documents', data.deletedDocuments);
        formData.append('documents', JSON.stringify(data.documents));
        formData.set('result_check', JSON.stringify(data.result_check));

        data.files.forEach((file: FileWithPath) => {
          formData.append(`files`, file);
        });
        
        setLoading(true)
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
              return;
            }

          const response = await fetch(`${domainApi}/api/v1/1monthly-inspections/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData,
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            navigate(`/history-1-monthly/${getValues('id_apar')}`);
          } else {
            const data = await response.json()
            setMessage(data.message)
            setShow(true)
            window.scrollTo(0, 0);
          }
          setLoading(false)
        } catch (error) {
          console.error('Error during login:', error);
          setLoading(false)
        }
    };

   

    useEffect(() => {
        const fetchAparData = async () => {
          try {
            setLoading(true)
            const response = await fetch(`${domainApi}/api/v1/1monthly-inspections/${id}`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setValue('id_apar', data.data.id_apar || '');
              setValue('checker_name', data.data.checker_name || '');
              setValue('documents', data.data.documents || '');
              JSON.parse(data.data.result_check).forEach((result:{ part: '', status: boolean, note: ''}, index: number) => {
                setValue(`result_check[${index}].part` as `result_check.${number}.part`, result.part || '');
                setValue(`result_check[${index}].status` as `result_check.${number}.status`, result.status || false);
                setValue(`result_check[${index}].note` as `result_check.${number}.note`, result.note || '')
            });
            const initialValues = getValues('result_check').map(result => result.status);
            setCheckboxStatus(initialValues);
            } else {
              console.error('Error fetching inspection data:', response.status);
              navigate('/not-found');
            }

            const aparResponse = await fetch(`${domainApi}/api/v1/apars/${getValues('id_apar')}`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (aparResponse.ok) {
              const data = await aparResponse.json();
              setAparData({apar_number: data.data.apar_number, apar_type: data.data.apar_type, location: data.data.location.location_name, last_1montly_check_time: data.data.last_1montly_check_time, last_filing_time: data.data.last_filing_time})
            } else {
              console.error('Error fetching inspection data:', aparResponse.status);
              navigate('/not-found');
            }
            setLoading(false)
          } catch (error) {
            console.error('Error during fetch:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchAparData();
    }, [navigate,message]);

  return (
    <>
    <Alert show={show} variant="danger">
        <Alert.Heading>Kesalahan</Alert.Heading>
        <p>
          {message}
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => setShow(false)} variant="outline-success">
            Close
          </Button>
        </div>
      </Alert>
    <Card
        bg={"light"}
        key={"secondary"}
        text={'dark'}
        style={{ width: '100%', minHeight: "80vh" }}
        className="mb-4"
    >
        <Card.Header>Edit Hasil Pemeriksaan APAR</Card.Header>
        <Card.Body className='px-4'>
          {loading ?
              <div className="col-12 p-5 m-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
              <>
                <Breadcrumb>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/history' }}>Daftar APAR</Breadcrumb.Item>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/history-1-monthly/${getValues('id_apar')}` }}>Riwayat</Breadcrumb.Item>
                  <Breadcrumb.Item active>Ubah</Breadcrumb.Item>
                </Breadcrumb>
                <Card.Title> Formulir Perubahan Pemeriksaan APAR </Card.Title>
                <div className="row my-3 align-items-center">
                    <div className="col">
                        <Accordion defaultActiveKey="1" className='mb-4'>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Data APAR</Accordion.Header>
                                <Accordion.Body>
                                <Row>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Form.Label>Nomor APAR</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={aparData.apar_number}
                                            disabled={true}
                                            readOnly
                                            className='fw-medium'
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="3" controlId="validationCustom01">
                                        <Form.Label>Lokasi</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={aparData.location}
                                            disabled={true}
                                            className='fw-medium'
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="2" controlId="validationCustom01">
                                        <Form.Label>Tipe</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={aparData.apar_type}
                                            disabled={true}
                                            className='fw-medium'
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="2" controlId="validationCustom01">
                                        <Form.Label>Pemeriksaan Terakhir</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={new Date(aparData.last_1montly_check_time).toLocaleString('id-ID', {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric'
                                            })}
                                            disabled={true}
                                            className='fw-medium'
                                            readOnly
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} md="2" controlId="validationCustom01">
                                        <Form.Label>Pengisian Terakhir</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={new Date(aparData.last_filing_time).toLocaleString('id-ID', {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric'
                                            })}
                                            disabled={true}
                                            className='fw-medium'
                                            readOnly
                                        />
                                    </Form.Group>
                                </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                        <Form className='shadow p-3 mb-2 bg-body-tertiary rounded' onSubmit={handleSubmit((data) => {handleUpdateInspection(data)})}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="col-1 col-md-2">Bagian</th>
                                        <th className="col-1 col-md-2">Status</th>
                                        <th className="co-10 col-md-8">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getValues('result_check').map((result, index) => {
                                        const handleCheckboxChange = (isChecked: boolean) => {
                                          const updatedStatus: boolean[] = [...checkboxStatus];
                                          updatedStatus[index] = isChecked;
                                          setCheckboxStatus(updatedStatus);
                                        };
                                      return (
                                            <tr key={index}>
                                                <td><label>{result.part}</label></td>
                                                <td><Form.Check type={'checkbox'} label={`Baik`} {...register(`result_check.${index}.status`)} onChange={(e) => {handleCheckboxChange(e.target.checked); console.log(result.note)}}/></td>
                                                <td>
                                                    <Form.Control type="text" {...register(`result_check.${index}.note`, { required: !checkboxStatus[index] })} placeholder="Catatan" />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="8" controlId="validationCustom01" className='m-2'>
                                    <Form.Label>Nama Pemeriksa</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        {...register(`checker_name`)}
                                        placeholder="Nama Pemeriksa"
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="8" controlId="documents" className='m-2'>
                                    <Form.Label>Dokumen</Form.Label>
                                    <ul className="list-group col">
                                        {fields.map((document : {fileName: string, fileLink: string, fileId: string}, index: number) => (
                                            <div className="row" key={index}>
                                              <li className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light" aria-disabled="true"><a href={document.fileLink} target='_blank'>{document.fileName}</a><span><Button className='btn-danger' onClick={() => handleDeleteDocument(document.fileId, index)}><FontAwesomeIcon icon={faTrash}/></Button></span></li>
                                            </div>
                                        ))}
                                    </ul>
                                </Form.Group>
                                <DropzoneComponent onFileUpload={handleFileUpload} />
                            </Row>
                            <Link to={`/history-1-monthly/${getValues('id_apar')}`}><Button className='btn-secondary'>Kembali</Button></Link>
                            <Button variant='success' className='mx-2' type="submit">Simpan Perubahan</Button>
                        </Form>      
                    </div>
                </div>
              </> }
        </Card.Body>
    </Card>
    </>
  );
}

export default UpdateInspection1Monthly;