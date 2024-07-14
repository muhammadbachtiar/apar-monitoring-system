import {Card, Breadcrumb, Button, ListGroup, Modal, Form, Col, Spinner} from 'react-bootstrap';
import Select, { MultiValue } from 'react-select';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useForm, FieldValues } from "react-hook-form";
import domainApi from '../../services/config/domainApi';
import DeleteModal from '../../components/DeleteModal';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';
import { fetchAccountsData } from '../../services/utils/AccountsData';
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
    location_name: string;
    update_time: string;
    checker: Chceker[]
}

type LocationData = {
    location_name: string;
    registered_time: Date;
    update_time: string
    id: string,
    checker: Chceker[]
};

interface AccountsData {
 readonly value: string;
 readonly  label: string;
}

type formValueType = {
    id: string;
    location_name: string;
    checker_6monthly: string[];
    checker_1monthly: string[];
};

function ManageLocation() {
    const navigate = useNavigate();
    const [locationData, setLocationData] = useState<LocationData[]>([]);
    const [accountData, setAccountData] = useState<readonly AccountsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(locationData);
    const [infoDeleteData, setInfoDeleteData] = useState<{id: string, name: string, checker: Chceker[]}>({id:"", name:"", checker:[]});
    const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);
    const [isUpdateModalShow, setIsUpdateModalShow] = useState(false);
    const token = localStorage.getItem('token');
    const [message, setMessage] = useState('');
    const [isDangerAlertShow, setIsDangerAlertShow] = useState(false);
    const [isSuccesAlertShow, setIsSuccesAlertShow] = useState(false);
    const { userRole } = useAuth();
    const { register, getValues, setValue, handleSubmit, reset } = useForm<formValueType>({
      defaultValues:  {
          id: '',
          location_name: '',
          checker_6monthly: [],
          checker_1monthly: []
        },
  })

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
        const newData = locationData.filter( row => {
            const searchTerm = event.target.value.toLowerCase();
            return  (
                row.location_name.toLowerCase().includes(searchTerm) ||
                row.checker.some(checker =>
                  checker.checker_type === 'SEMESTER' && checker.user.name.toLowerCase().includes(searchTerm) ||
                  row.checker.some(checker =>
                    checker.checker_type === 'MONTHLY' && checker.user.name.toLowerCase().includes(searchTerm)
                )
              )
            );
        })
        setRecord(newData)

    }

    const handleDeleteLocation = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      setMessage('')
      try {
        console.log(infoDeleteData.checker)
        const response = await fetch(`${domainApi}/api/v1/locations/${infoDeleteData.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(infoDeleteData.checker)
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

    const handleButtonClick = (row: DataRow) => {
      const checker1Monthly = row.checker.filter(checker => checker.checker_type === 'MONTHLY');
      const checker6Monthly = row.checker.filter(checker => checker.checker_type === 'SEMESTER');
      const checker1MonthlyArrayId = checker1Monthly.map(data => data.id_user)
      const checker6MonthlyArrayId = checker6Monthly.map(data => data.id_user)

      setIsUpdateModalShow(true);
      reset({
        id: row.id,
        location_name: row.location_name,
        checker_6monthly: checker6MonthlyArrayId,
        checker_1monthly: checker1MonthlyArrayId,
      });
    };

    const handleSelectChange = (
      selectedOption: MultiValue<AccountsData> | undefined,
      name: 'checker_6monthly' | 'checker_1monthly'
    ) => {
      if (selectedOption) {
        const selectedValues = selectedOption.map((option) => option.value);
        setValue(`${name}`, selectedValues);
      }
    };
    
   const getDefaultValues = (valuesArray: string[]) => {
  return valuesArray.map((value) => {
    const foundOption = accountData.find((option) => option.value === value);
    return foundOption || null;
  }).filter(option => option !== null) as AccountsData[];
};

    const handleUpdateLocation = async (data: FieldValues) => {
      setMessage('')
        try {
  
          const response = await fetch(`${domainApi}/api/v1/locations/${data.id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
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
        const fetchLocationDsata = async () => {
          try {
            const data = await fetchAccountsData();
            setAccountData(data);
            const response = await fetch(`${domainApi}/api/v1/locations`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setLocationData(data.data);
              setRecord(data.data)
            } else {
              console.error('Error fetching location data:', response.status);
            }
          } catch (error) {
            console.error('Error during fetch:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchLocationDsata();
      }, [navigate,message]);

      const actionColumn = userRole === 'Admin' ? {
        name: 'Aksi',
        cell: (row: DataRow) => (
          <>
            <Button variant="success" className='mx-1' onClick={() => {handleButtonClick(row)}} ><FontAwesomeIcon icon={faPenToSquare} /></Button>
            <Button variant="danger" className='mx-1' onClick={() => {setIsDeleteModalShow(true); setInfoDeleteData({id: row.id, name: row.location_name, checker: row.checker})}} ><FontAwesomeIcon icon={faTrash} /></Button>
          </>
        ),
      } : {};
    
    const columns: TableColumn<DataRow>[] = [
        {
            name: <div>Lokasi</div>,
            selector: row => row.location_name,
            sortable: true
        },
        {
          name: <div>Pemeriksa Semester</div>,
          selector: row => {
            const type1Checkers = row.checker
              .filter(checker => checker.checker_type === 'SEMESTER')
              .map(checker => checker.user.name)
              .join(', ');
        
            return type1Checkers;
          },
          cell: row => {
            const type1Checkers = row.checker.filter(checker => checker.checker_type === 'SEMESTER');
            return <>
              <ListGroup as="ol" numbered>
                { type1Checkers.map(checker =><><li>{checker.user.name}</li></>)}
              </ListGroup>
            </>
           
          },
          sortable: true
        },
        {
          name: <div>Pemeriksa Bulanan</div>,
          selector: row => {
            const type1Checkers = row.checker
              .filter(checker => checker.checker_type === 'MONTHLY')
              .map(checker => checker.user.name)
              .join(', ');
            return type1Checkers;
          },
          cell: row => {
            const type1Checkers = row.checker.filter(checker => checker.checker_type === 'MONTHLY');
            return <>
              <ListGroup as="ol" numbered>
                { type1Checkers.map(checker =><><li>{checker.user.name}</li></>)}
              </ListGroup>
            </>
           
          },
          sortable: true
        },
        {
            name: <div>Waktu Update</div>,
            selector: row => new Date(row.update_time).getTime(),
            cell: row => <div>{new Date(row.update_time).toLocaleString('id-ID', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            })}</div>,
            sortable: true
        },
        actionColumn
    ];

  return (
    <>
    <FailedAlert show= {isDangerAlertShow}
                setShow={() => setIsDangerAlertShow(false)}
                message={message}/>
    <SuccessAlert show= {isSuccesAlertShow}
                  setShow={() => setIsSuccesAlertShow(false)}
                  message={message}/>
    <Card
        bg={"light"}
        key={"secondary"}
        text={'dark'}
        style={{ width: '100%', minHeight: "80vh" }}
        className="mb-4"
    >
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Manajemen Lokasi</Card.Header>
        <Card.Body className='px-4'>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Manajemen Lokasi</Breadcrumb.Item>
        </Breadcrumb>
        <Card.Title> Data Lokasi </Card.Title>
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
                        <Link to={"/location/add"}><Button variant="primary">Tambah Lokasi</Button></Link>
                      )}
                      </div>
                  </div>
                  <DataTable
                      columns={columns}
                      data={record}
                      fixedHeader
                      pagination
                      customStyles={tableStyles}
                  />
              </>
          }
        </Card.Body>
    </Card>
    <DeleteModal show={isDeleteModalShow} onHide={() => setIsDeleteModalShow(false)} onDelete={handleDeleteLocation} infoData={infoDeleteData}/>
    <Modal
      show={isUpdateModalShow}
      onHide={() => setIsUpdateModalShow(false)}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Update Data
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit((data) => handleUpdateLocation(data))}>
        <Modal.Body>
                <Form.Group>
                        <div className='col'>
                            <Form.Label>Lokasi</Form.Label>
                            <Form.Control
                            required
                            type="text"
                            placeholder={`Nama Lokasi`}
                            {...register(`location_name`)}
                            />
                        </div>
                </Form.Group>
                <Form.Group as={Col}>
                          <Form.Label>Pemeriksa Semester</Form.Label>
                          <Select
                              required
                              placeholder="Pilih Pemeriksa"
                              className="basic-single"
                              classNamePrefix="Lokasi"
                              isMulti
                              isClearable={true}
                              isSearchable={true}
                              defaultValue={getDefaultValues(getValues('checker_6monthly'))}
                              {...register('checker_6monthly')}
                              options={accountData}
                              onChange={(selectedOption) =>
                                  handleSelectChange(selectedOption, 'checker_6monthly')
                                }
                          />
              </Form.Group>
              <Form.Group as={Col}>
                          <Form.Label>Pemeriksa Bulanan</Form.Label>
                          <Select
                              required
                              placeholder="Pilih Pemeriksa"
                              className="basic-single"
                              classNamePrefix="Lokasi"
                              isClearable={true}
                              isSearchable={true}
                              isMulti
                              defaultValue={getDefaultValues(getValues('checker_1monthly'))}
                              options={accountData}
                              {...register('checker_1monthly')}
                              onChange={(selectedOption) =>
                                  handleSelectChange(selectedOption, 'checker_1monthly')
                                }
                          />
              </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' onClick={() => setIsUpdateModalShow(false)}>Batal</Button>
            <Button type="submit">Ubah</Button>
        </Modal.Footer>
      </Form>
    </Modal>
    </>
  );
}

export default ManageLocation;