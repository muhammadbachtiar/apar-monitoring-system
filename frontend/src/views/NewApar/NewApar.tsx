import {Card, Breadcrumb, Button, Col, Form, Row, Alert, Spinner} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useForm, useFieldArray , FieldValues } from "react-hook-form";
import Select, { SingleValue } from 'react-select';
import domainApi from '../../services/config/domainApi';
import { fetchLocationData } from '../../services/utils/LocationsData';

interface LocationsData {
    readonly value: string;
    readonly label: string;
  }

function AddApar() {
    const navigate = useNavigate();
    const [locationData, setLocationData] = useState<readonly LocationsData[]>([]);
    const { register, control, reset, setValue, handleSubmit } = useForm();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'apars', 
    });
    const [aparCountInput, setAparCountInput] = useState(1);
    const [show, setShow] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

      const handleSelectChange = (selectedOption: SingleValue<LocationsData>, name: string, index: number) => {
        setValue(`apars.${index}.${name}`, selectedOption?.value);
      };

    const handleInputAparCount = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const maxElements: number = 20; 
        if (fields.length < maxElements) {
            for (let i = 0; i < aparCountInput; i++) {
                append({
                  apar_number: "",
                  id_location: "",
                  apar_type: "",
                  condition: true,
                  check_6monthly: `${new Date().toISOString().split('T')[0]}`,
                  check_1monthly: `${new Date().toISOString().split('T')[0]}`,
                  last_filing_time: `${new Date().toISOString().split('T')[0]}`,
                });
              }
          }
      };

    const handleAdd = async (data: FieldValues) => {
      setMessage('')
        try {
            setLoading(true)
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
              return;
            }

          const response = await fetch(`${domainApi}/api/v1/apars`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify( data ),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setLoading(false)
            navigate('/apar');
          } else {
            const data = await response.json()
            setMessage(data.message)
            setLoading(false)
            setShow(true)
            window.scrollTo(0, 0);
          }
        } catch (error) {
          setLoading(false)
          console.error('Error during login:', error);
        }
      };

      useEffect(() => {
        const fetchData = async () => {
          const data = await fetchLocationData();
          setLocationData(data);
          reset({
            apars: [
              {
                apar_number: "",
                id_location: "",
                apar_type: "",
                condition: true,
                check_6monthly: `${new Date().toISOString().split('T')[0]}`,
                check_1monthly: `${new Date().toISOString().split('T')[0]}`,
                last_filing_time: `${new Date().toISOString().split('T')[0]}`,
              },
            ],
          });
        };
    
        fetchData();
      }, [reset]);
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Manajemen Apar</Card.Header>
        <Card.Body className='px-4'>
        {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
              <>
                <Breadcrumb>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>Home</Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/apar' }}>Manajemen APAR</Breadcrumb.Item>
                    <Breadcrumb.Item active>Tambah</Breadcrumb.Item>
                </Breadcrumb>
                <Card.Title> Tambah Apar </Card.Title>
                <div className="row my-3 align-items-center">
                    <div className="col">
                        <Form onSubmit={handleInputAparCount}>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="6" controlId="validationCustom01">
                                <Form.Label>Tambah Form Apar</Form.Label>
                                <Form.Control
                                    required
                                    type="number"
                                    min="1"
                                    max="20"
                                    name="apar_count"
                                    placeholder='Tamabah jumlah'
                                    value={aparCountInput}
                                    onChange={(e) => setAparCountInput(Number(e.target.value))}
                                />
                                <div className="small form-text text-muted">Maksimal 20 form input data</div>
                                </Form.Group>
                                <div className='col md-4 align-self-center'>
                                    <Button className='px-4' type="submit">OK</Button>
                                </div>
                            </Row>
                        </Form>
                        <Form onSubmit={handleSubmit((data) => handleAdd(data))}>
                            {fields.map((apar, index) => (
                                <div  key={apar.id} className='mb-3 border border-primary-subtle rounded p-3'>
                                    <Row className='my-3'>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                    <Form.Label>Nomor APAR</Form.Label>
                                                    <Form.Control
                                                    required
                                                    type="text"
                                                    {...register(`apars.${index}.apar_number`)}
                                                    placeholder={`Nomor Apar`}
                                                    />
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                    <Form.Label>Lokasi</Form.Label>
                                                    <Select
                                                        placeholder="Pilih Lokasi"
                                                        className="basic-single"
                                                        classNamePrefix="Lokasi"
                                                        isClearable={true}
                                                        isSearchable={true}
                                                        options={locationData}
                                                        onChange={(selectedOption) =>
                                                            handleSelectChange(selectedOption, 'id_location', index)
                                                          }
                                                        required
                                                    />
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                    <Form.Label>Tipe</Form.Label>
                                                    <Select
                                                        placeholder="Pilih Tipe"
                                                        className="basic-single"
                                                        classNamePrefix="Lokasi"
                                                        isSearchable={false}
                                                        isClearable={true}
                                                        options={[{value:"POWEDER", label:"Poweder"},{value:"HALOTRON", label:"Halotron"},{value:"CO2", label:"Co2"}]}
                                                        onChange={(selectedOption) =>
                                                            handleSelectChange(selectedOption, 'apar_type', index)
                                                          }
                                                        required
                                                    />
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                    <Form.Label>Kondisi</Form.Label>
                                                    <Form.Check
                                                        type={'checkbox'}
                                                        label={`Baik`}
                                                        {...register(`apars.${index}.condition`)}
                                                    />
                                        </Form.Group>
                                    </Row>
                                    <Row className='my-3'>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                            <Form.Label>Pemeriksaan Semester Terakhir</Form.Label>
                                                <Form.Control
                                                required
                                                type="date"
                                                {...register(`apars.${index}.check_6monthly`)}
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                />
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                            <Form.Label>Pemeriksaan Bulanan Terakhir</Form.Label>
                                                <Form.Control
                                                required
                                                type="date"
                                                {...register(`apars.${index}.check_1monthly`)}
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                />
                                        </Form.Group>
                                        <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                            <Form.Label>Pengisian Terakhir</Form.Label>
                                                <Form.Control
                                                required
                                                type="date"
                                                {...register(`apars.${index}.last_filing_time`)}
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                />
                                        </Form.Group>
                                        <div className='col-1 align-self-end'>
                                            {index > 0 && (
                                                        <div className='col col-1 align-self-end'>
                                                            <Button variant="danger" onClick={() => remove(index)} ><FontAwesomeIcon icon={faTrash}/></Button>
                                                        </div>
                                                    )}
                                        </div>
                                    </Row>
                                </div>
                            ))}
                            <Link to={"/apar"}><Button type="submit" className='btn-secondary mx-2'>Kembali</Button></Link>
                            <Button type="submit">Tambahkan</Button>
                        </Form>      
                    </div>
                </div>
              </>}
        </Card.Body>
    </Card>
    </>
  );
}

export default AddApar;