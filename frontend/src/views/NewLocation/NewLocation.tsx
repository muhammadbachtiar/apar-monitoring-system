import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Select, { MultiValue } from 'react-select';
import { useForm, useFieldArray , FieldValues } from "react-hook-form";
import {Card, Breadcrumb, Button, Col, Form, Row, Alert, Spinner} from 'react-bootstrap';
import domainApi from '../../services/config/domainApi';
import { fetchAccountsData } from '../../services/utils/AccountsData';

interface AccountsData {
  readonly value: string;
  readonly label: string;
}

type formValueType = {
  locations: {
    location_name: string;
    checker_6monthly: string[];
    checker_1monthly: string[];
  }[];
};

function AddLocation() {
    const navigate = useNavigate();
    const { register, control, reset, setValue, handleSubmit } = useForm<formValueType>({
      defaultValues: {
        locations: [
          {
            location_name: "",
            checker_6monthly: [],
            checker_1monthly: []
          },
        ],
      }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'locations', 
    });
    const [accountData, setAccountData] = useState<readonly AccountsData[]>([]);
    const [locationCountInput, setLocationCountInput] = useState(1);
    const [show, setShow] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSelectChange = (
      selectedOption: MultiValue<AccountsData> | null,
      name: 'checker_6monthly' | 'checker_1monthly',
      index: number
    ) => {
      if (selectedOption) {
        const selectedValues = selectedOption.map((option) => option.value);
        setValue(`locations.${index}.${name}`, selectedValues);
      }
    };
    
    

    const handleInputLocationCount = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      const maxElements: number = 20; 
      if (fields.length < maxElements) {
          for (let i = 0; i < locationCountInput; i++) {
              append(
                {
                  location_name: "",
                  checker_6monthly: [],
                  checker_1monthly: []
                }
              );
            }
        }
    };

    const handleAdd = async (data: FieldValues) => {
    
        try {
            setLoading(true)
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
              return;
            }

          const response = await fetch(`${domainApi}/api/v1/locations`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setLoading(false)
            navigate('/location');
          } else {
            const data = await response.json()
            setMessage(data.message)
            setLoading(false)
            setShow(true)
          }
        } catch (error) {
          setLoading(false)
          console.error('Error during login:', error);
        }
      };

      useEffect(() => {
        const fetchData = async () => {
          const data = await fetchAccountsData();
          setAccountData(data);
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Manajemen Lokasi</Card.Header>
        <Card.Body className='px-4'>
        {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
              <>
              <Breadcrumb>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/location' }}>Manajemen Lokasi</Breadcrumb.Item>
                  <Breadcrumb.Item active>Tambah</Breadcrumb.Item>
              </Breadcrumb>
              <Card.Title> Tambah Lokasi </Card.Title>
              <div className="row my-3 align-items-center">
                  <div className="col">
                      <Form onSubmit={handleInputLocationCount}>
                          <Row className="mb-3">
                              <Form.Group as={Col} md="6" controlId="validationCustom01">
                              <Form.Label>Tambah Form Lokasi</Form.Label>
                              <Form.Control
                                  required
                                  type="number"
                                  min="1"
                                  max="20"
                                  name="location_count"
                                  placeholder='Tamabah jumlah'
                                  value={locationCountInput}
                                  onChange={(e) => setLocationCountInput(Number(e.target.value))}
                              />
                              <div className="small form-text text-muted">Maksimal 20 form input data</div>
                              </Form.Group>
                              <div className='col md-4 align-self-center'>
                                  <Button className='px-4' type="submit">OK</Button>
                              </div>
                          </Row>
                      </Form>
                      <Form onSubmit={handleSubmit((data) => handleAdd(data))}>
                          {fields.map((location, index) => (
                              <div  key={location.id} className='mb-3 border border-primary-subtle rounded p-3'>
                                  <Row className='my-3'>
                                      <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                  <Form.Label>Lokasi</Form.Label>
                                                  <Form.Control
                                                  required
                                                  type="text"
                                                  {...register(`locations.${index}.location_name`)}
                                                  placeholder={`Nama Lokasi`}
                                                  />
                                      </Form.Group>
                                      <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                  <Form.Label>Pemeriksa 6 Bulanan</Form.Label>
                                                  <Select
                                                      required
                                                      placeholder="Pilih Pemeriksa"
                                                      className="basic-single"
                                                      classNamePrefix="Lokasi"
                                                      isMulti
                                                      isClearable={true}
                                                      isSearchable={true}
                                                      options={accountData}
                                                      onChange={(selectedOption) =>
                                                          handleSelectChange(selectedOption, 'checker_6monthly', index)
                                                        }
                                                  />
                                      </Form.Group>
                                      <Form.Group as={Col} md="3" controlId={`validationCustom0${index + 2}`}>
                                                  <Form.Label>Pemeriksa 1 Bulanan</Form.Label>
                                                  <Select
                                                      required
                                                      placeholder="Pilih Pemeriksa"
                                                      className="basic-single"
                                                      classNamePrefix="Lokasi"
                                                      isClearable={true}
                                                      isSearchable={true}
                                                      isMulti
                                                      options={accountData}
                                                      onChange={(selectedOption) =>
                                                          handleSelectChange(selectedOption, 'checker_1monthly', index)
                                                        }
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
                          <Link to={"/location"}><Button type="submit" className='btn-secondary mx-2'>Kembali</Button></Link>
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

export default AddLocation;