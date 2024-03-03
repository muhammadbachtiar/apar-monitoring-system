import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, FieldValues } from "react-hook-form";
import {FileWithPath } from 'react-dropzone';
import {Button, Col, Form, Accordion, Row, Breadcrumb, Spinner, Alert, Card} from 'react-bootstrap';
import DropzoneComponent from '../../components/dropzone';
import domainApi from '../../services/config/domainApi';

interface FormData {
  id_apar: string;
  checker_name: string;
  result_check: Array<{ part: string; status: boolean; note: string }>;
  files: FileWithPath[];
}

function AddInspection1Monthly() {
    const navigate = useNavigate();
    const { register, getValues, setValue, handleSubmit } = useForm<FormData>({
        defaultValues:  {
            id_apar: '',
            checker_name: '',
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
            files:[]
          },
    })

    const handleFileUpload = (files : FileWithPath[]) => {
      setValue('files', files);
    };
  
    const [aparData, setAparData]= useState({apar_number:"", apar_type:"", location: "", last_1montly_check_time: "", last_filing_time: "" })
    const [show, setShow] = useState(false);
    const token = localStorage.getItem('token');
    const [checkboxStatus, setCheckboxStatus] = useState<boolean[]>([true,true,true,true,true,true,true,true,true,true])
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAddInspection = async (data: FieldValues) => {
        setLoading(true)
        const formData = new FormData();
        formData.append('id_apar', data.id_apar);
        formData.append('checker_name', data.checker_name);
        formData.set('result_check', JSON.stringify(data.result_check));

        data.files.forEach((file: FileWithPath) => {
          formData.append(`files`, file);
        });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
              return;
            }

          const response = await fetch(`${domainApi}/api/v1/1monthly-inspections`, {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setLoading(false);
            navigate('/inspection-1-monthly');
          } else {
            const data = await response.json()
            setMessage(data.message)
            setLoading(false);
            setShow(true)
            window.scrollTo(0, 0);
          }
        } catch (error) {
          console.error('Error during login:', error);
          setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAparData = async () => {
          setLoading(true);
          try {
            setValue('id_apar', id || '')
            const response = await fetch(`${domainApi}/api/v1/apars/${id}`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setAparData({apar_number: data.data.apar_number, apar_type: data.data.apar_type, location: data.data.location.location_name, last_1montly_check_time: data.data.last_1montly_check_time, last_filing_time: data.data.last_filing_time})
            } else {
              console.error('Error fetching apars data:', response.status);
              navigate('/not-found');
            }
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Pemeriksaan APAR</Card.Header>
        <Card.Body className='px-4'>
          {loading ?
            <div className="col-12 py-5 my-5 align-self-center text-center">
              <Spinner animation="border" variant="success" />
            </div> :
            <>
              <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>Home</Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/inspection-1-monthly' }}>Pemeriksaan APAR</Breadcrumb.Item>
                <Breadcrumb.Item active>Tambah</Breadcrumb.Item>
              </Breadcrumb>
              <Card.Title> Formulir Pemeriksaan APAR </Card.Title>
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
                      <Form className='shadow p-3 mb-2 bg-body-tertiary rounded' onSubmit={handleSubmit((data) => handleAddInspection(data))}>
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
                                    return <tr key={index}>
                                          <td><label>{result.part}</label></td>
                                          <td><Form.Check type={'checkbox'} label={`Baik`} {...register(`result_check.${index}.status`)} onChange={(e) => {handleCheckboxChange(e.target.checked); console.log(result.note)}}/></td>
                                          <td>
                                              <Form.Control type="text" {...register(`result_check.${index}.note`, { required: !checkboxStatus[index] })} placeholder="Catatan" />
                                          </td>
                                      </tr>
                                  } )}
                              </tbody>
                          </table>
                          <Row className="mb-3">
                              <Form.Group as={Col} md="8" controlId="validationCustom01">
                                  <Form.Label>Nama Pemeriksa</Form.Label>
                                  <Form.Control
                                      required
                                      type="text"
                                      {...register(`checker_name`)}
                                      placeholder="Nama Pemeriksa"
                                  />
                              </Form.Group>
                              <DropzoneComponent onFileUpload={handleFileUpload} />
                          </Row>
                          <Link to={"/inspection-1-monthly"}><Button className='btn-secondary'>Kembali</Button></Link>
                          <Button variant='success' className='mx-2' type="submit">Simpan Hasil Pemeriksaan</Button>
                      </Form>      
                  </div>
              </div>
            </>
          }
        </Card.Body>
    </Card>
    </>
  );
}

export default AddInspection1Monthly;