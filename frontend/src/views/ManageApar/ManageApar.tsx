import {Card, Breadcrumb, Button, ListGroup, Form, Row, Modal, Spinner, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, FieldValues } from "react-hook-form";
import Select, { SingleValue } from 'react-select';
import { faSearch, faTrash, faPenToSquare, faXmark, faCheck, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import domainApi from '../../services/config/domainApi';
import DeleteModal from '../../components/DeleteModal';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';
import { fetchLocationData } from '../../services/utils/LocationsData';
import useAuth from '../../services/utils/useContext';

type User = {
  id: string
  username: string
  email: string
  password: string
  name: string
}

type Chceker = {
  id: string
  id_user: string
  id_location: string
  checker_type: string
  user: User
}

type DataRow = {
    id: string;
    apar_number: string;
    apar_type: string;
    condition: boolean;
    last_6montly_check_time: string;
    last_1montly_check_time: string;
    last_filing_time: string;
    location: {location_name: string, id:string, checker: Chceker[]}
};

interface LocationsData {
    readonly value: string;
    readonly label: string;
  }

type AparData = {
  id: string
  apar_number: string
  id_location: string
  apar_type: string
  condition: boolean
  last_6montly_check_time: string;
  last_1montly_check_time: string;
  last_filing_time: string;
  registered_time: Date
  location: {location_name: string, id:string , checker: Chceker[]}
};

type FormFieldName = "id" | "apar_number" | "id_location" | "location_label" | "apar_type" | "condition" | "check_6monthly" | "check_1monthly" | "last_filing_time";

function ManageApar() {
    const navigate = useNavigate();
    const [locationData, setLocationData] = useState<readonly LocationsData[]>([]);
    const [aparData, setAparData] = useState<AparData[]>([]);
    const { register, reset, setValue, getValues, handleSubmit } = useForm({
        defaultValues: {
            id: "",
            apar_number: "",
            id_location: "",
            location_label:"",
            apar_type: "",
            condition: true,
            check_6monthly: new Date().toISOString().split('T')[0],
            check_1monthly: new Date().toISOString().split('T')[0],
            last_filing_time: new Date().toISOString().split('T')[0],
        },
    });
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(aparData);
    const [infoDeleteData, setInfoDeleteData] = useState({id:"", name:""});
    const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);
    const [isUpdateModalShow, setIsUpdateModalShow] = useState(false);
    const token = localStorage.getItem('token');
    const [message, setMessage] = useState('');
    const [isDangerAlertShow, setIsDangerAlertShow] = useState(false);
    const [isSuccesAlertShow, setIsSuccesAlertShow] = useState(false);
    const { userRole } = useAuth();
    const tableStyles = {
      headCells: {
        style: {
          backgroundColor: '#34495E', 
          color: 'white',
          border:  "1px white solid"
        },
      }
    };

    function handleFilter(event: { target: { value: string; }; }){
        const newData = aparData.filter( row => {
            const searchTerm = event.target.value.toLowerCase();
            return  (
                row.apar_number.toLowerCase().includes(searchTerm) ||
                row.apar_type.toLowerCase().includes(searchTerm) ||
                row.location.location_name.toLowerCase().includes(searchTerm)
            );
        })
        setRecord(newData)

    }

    const handleDeleteApar = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      setMessage('')
      try {

        const response = await fetch(`${domainApi}/api/v1/apars/${infoDeleteData.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setMessage(data.message)
          setIsSuccesAlertShow(true)
          setIsDeleteModalShow(false)
        } else {
          const data = await response.json()
          setMessage(data.message)
          setIsDangerAlertShow(true)
          setIsDeleteModalShow(false)
        }
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error during Delete:', error);
      }
    };

    const setDefaultValues = (id: string, apar_number: string, id_location: string, location_label: string, apar_type: string, condition: boolean, check_6monthly: string, check_1monthly: string, last_filing_time: string) => {
        reset({
          id,
          apar_number,
          id_location,
          location_label,
          apar_type,
          condition,
          check_6monthly,
          check_1monthly,
          last_filing_time,
        });
      };

    const handleSelectChange = (selectedOption: SingleValue<LocationsData>, name: FormFieldName) => {
    setValue(name, selectedOption?.value || '');
    };

    const handleUpdateApar = async (data: FieldValues) => {
      setMessage('')
        try {
          
          setMessage("")
          const response = await fetch(`${domainApi}/api/v1/apars/${data.id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(
                {   
                    apar_number: data.apar_number, 
                    id_location: data.id_location, 
                    apar_type: data.apar_type,
                    condition: data.condition, 
                    check_6monthly: data.check_6monthly, 
                    check_1monthly: data.check_1monthly, 
                    last_filing_time: data.last_filing_time
                }),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setIsSuccesAlertShow(true)
            setIsUpdateModalShow(false)
          } else {
            const data = await response.json()
            setMessage(data.message)
            setIsDangerAlertShow(true)
            setIsUpdateModalShow(false)
          }
          window.scrollTo(0, 0);
        } catch (error) {
          console.error('Error during Delete:', error);
        }
      };

    useEffect(() => {
        const fetchAparDsata = async () => {
          try {
    
            const response = await fetch(`${domainApi}/api/v1/apars`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            const data = await fetchLocationData();
            setLocationData(data);
    
            if (response.ok) {
              const data = await response.json();
              console.log(data.data)
              setAparData(data.data);
              setRecord(data.data)
            } else {
              console.error('Error fetching Apar data:', response.status);
            }
          } catch (error) {
            console.error('Error during fetch:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchAparDsata();
      }, [navigate,message]);
    
    const columns: TableColumn<DataRow>[] = [
        {
            name: 'Nomor APAR',
            selector: row => row.apar_number,
            sortable: true,
            width: "10%"
        },
        {
          name: 'Lokasi',
          selector: row => row.location.location_name,
          sortable: true,
          width: "15%"
        },
        {
          name: 'Pemeriksa 6 Bulanan',
          cell: row => {
            const type1Checkers = row.location.checker.filter(checker => checker.checker_type === '6MONTHLY');
            return <>
              <ListGroup as="ol" numbered>
                { type1Checkers.map(checker =><><li>{checker.user.name}</li></>)}
              </ListGroup>
            </>
           
          },
          sortable: true,
          width: "12%",
        },
        {
          name: 'Pemeriksa 1 Bulanan',
          cell: row => {
            const type1Checkers = row.location.checker.filter(checker => checker.checker_type === '1MONTHLY');
            return <>
              <ListGroup as="ol" numbered>
                { type1Checkers.map(checker =><><li>{checker.user.name}</li></>)}
              </ListGroup>
            </>
           
          },
          sortable: true,
          width: "12%",
        },
        {
          name: 'Tipe',
          selector: row => row.apar_type,
          sortable: true
        },
        {
            name: 'Kondisi',
            cell: row =>(
                row.condition ? 
                  <FontAwesomeIcon className='text-success' icon={faCheck} /> :
                  <FontAwesomeIcon className='text-danger' icon={faXmark} />
              ),
            sortable: true,
        },
        {
            name: 'Pengisian Terakhir',
            selector: row => new Date(row.last_filing_time).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
              }),
            sortable: true
        },
        {
            name: 'Aksi',
            cell: row => <>
                          <Row>
                            <Col className='col-12 col-xl-8 p-0 align-self-center '>
                               {userRole === 'Admin' && (
                            <>
                              <Button variant="success" className='m-1' 
                                  onClick={() => {
                                      setIsUpdateModalShow(true); 
                                      setDefaultValues(
                                          row.id, 
                                          row.apar_number, 
                                          row.location.id, 
                                          row.location.location_name, 
                                          row.apar_type, 
                                          row.condition, 
                                          new Date(row.last_6montly_check_time).toISOString().split('T')[0], 
                                          new Date(row.last_1montly_check_time).toISOString().split('T')[0], 
                                          new Date(row.last_filing_time).toISOString().split('T')[0])}} >
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </Button>
                              <Button variant="danger" className='m-1' onClick={() => {setIsDeleteModalShow(true); setInfoDeleteData({id: row.id, name: row.apar_number})}} ><FontAwesomeIcon icon={faTrash} /></Button>
                            </>
                          )}
                            </Col>
                            <Col className='col-12 col-xl-4 p-0'>
                              <Link to={`/apar/info/${row.id}`}>
                                <Button variant="info" className='m-1'><FontAwesomeIcon icon={faCircleInfo} /></Button>
                              </Link>
                            </Col>
                          </Row>
                        </>,
            width: "15%"
        },
    ];
  return (
    <>
    <FailedAlert show= {isDangerAlertShow}
                setShow={() => {setIsDangerAlertShow(false)}}
                message={message}/>
    <SuccessAlert show= {isSuccesAlertShow}
                  setShow={() => {setIsSuccesAlertShow(false)}}
                  message={message}/>
    <Card
        bg={"light"}
        key={"secondary"}
        text={'dark'}
        style={{ width: '100%', minHeight: "80vh" }}
        className="mb-4"
    >
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Manajemen APAR</Card.Header>
        <Card.Body className='px-4'>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Manajemen APAR</Breadcrumb.Item>
        </Breadcrumb>
        <Card.Title> Data APAR </Card.Title>
          {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> :
              <>
                <div className="row my-3 align-items-center">
                  <div className="col col-md-3">      
                      <div className="input-group">
                          <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                          <input type="text" className="form-control" onChange={handleFilter}></input>
                      </div>
                  </div>
                  <div className="col text-end">
                  {userRole === 'Admin' && (
                    <Link to={"/apar/add"}><Button variant="primary">Tambah APAR</Button></Link>
                  )}
                  </div>
              </div>
              <DataTable
                  columns={columns}
                  data={record}
                  fixedHeader
                  pagination
                  paginationRowsPerPageOptions={[10,50,100]}
                  customStyles={tableStyles}
                  />
              </>
              }
        </Card.Body>
    </Card>
    <DeleteModal show={isDeleteModalShow} onHide={() => setIsDeleteModalShow(false)} onDelete={handleDeleteApar} infoData={infoDeleteData}/>
    <Modal
      show={isUpdateModalShow}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable={true}
      >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Update Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="formEditApar"onSubmit={handleSubmit((data) => handleUpdateApar(data))}>
            <Row className='my-3'>
                <Form.Group>
                    <Form.Label>Nomor APAR</Form.Label>
                    <Form.Control
                    required
                    type="text"
                    placeholder={`Nomor Apar`}
                    {...register(`apar_number`)}
                    disabled
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Lokasi</Form.Label>
                    <Select
                        placeholder="Pilih Lokasi"
                        className="basic-single"
                        classNamePrefix="Lokasi"
                        isClearable={true}
                        isSearchable={true}
                        options={locationData}
                        {...register('id_location')}
                        defaultValue={locationData.find(option => option.value === getValues('id_location'))}
                        onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, 'id_location')
                            }
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Tipe</Form.Label>
                    <Select
                        placeholder="Pilih Tipe"
                        className="basic-single"
                        classNamePrefix="Lokasi"
                        isSearchable={false}
                        isClearable={true}
                        options={[{value:"POWEDER", label:"Poweder"},{value:"HALOTRON", label:"Halotron"},{value:"CO2", label:"Co2"}]}
                        {...register('apar_type')}
                        defaultValue={[{value:"POWEDER", label:"Poweder"},{value:"HALOTRON", label:"Halotron"},{value:"CO2", label:"Co2"}].find(option => option.value === getValues('apar_type'))}
                        onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, 'apar_type')
                            }
                    />
                </Form.Group>
                <Form.Group>
                            <Form.Label>Kondisi</Form.Label>
                            <Form.Check
                                type={'checkbox'}
                                label={`Baik`}
                                {...register(`condition`)}
                            />
                </Form.Group>
            </Row>
            <Row className='my-3'>
                <Form.Group>
                    <Form.Label>Pemeriksaan 6 Bulanan Terakhir</Form.Label>
                        <Form.Control
                        type="date"
                        {...register(`check_6monthly`)}
                        />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Pemeriksaan 1 Bulanan Terakhir</Form.Label>
                        <Form.Control
                        type="date"
                        {...register(`check_1monthly`)}
                        />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Pengisian Terakhir</Form.Label>
                        <Form.Control
                        type="date"
                        {...register(`last_filing_time`)}
                        />
                </Form.Group>
            </Row>
          </Form>      
      </Modal.Body>
      <Modal.Footer>
          <Button variant='secondary' onClick={()=>setIsUpdateModalShow(false)}>Batal</Button>
          <Button form="formEditApar" type="submit">Ubah</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}

export default ManageApar;