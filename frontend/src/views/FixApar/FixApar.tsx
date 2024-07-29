import {Card, Breadcrumb, Button, Modal, Form, Spinner} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm, FieldValues } from "react-hook-form";
import Select, { SingleValue } from 'react-select';
import { faSearch, faCircleInfo, faScrewdriverWrench, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import domainApi from '../../services/config/domainApi';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';
import { fetchLocationData } from '../../services/utils/LocationsData';
import useAuth from '../../services/utils/useContext';

type Inspection = {
    id: string;
    documents: [];
    result_check: string;
    id_apar: string;
    id_checker_account: string;
    checker_name: string;
    status_check: boolean;
    check_time: string;
    user: {id: string, name: string, role: string}
};

type DataRow = {
    id: string;
    apar_number: string;
    apar_type: string;
    condition: boolean;
    last_6montly_check_time: string;
    last_1montly_check_time: string;
    last_filing_time: string;
    location: {location_name: string, id:string}
    inspection: Inspection[]
};

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
  location: {location_name: string, id:string}
  inspection: Inspection[]
};

interface LocationsData {
    readonly value: string;
    readonly label: string;
  }

type FormFieldName = "id" | "apar_number" | "id_location" | "location_label"| "condition";

function FixApar() {
    const navigate = useNavigate();
    const [aparData, setAparData] = useState<AparData[]>([]);
    const [infoInspectionData, setInfoInspectionData] = useState<Inspection>({
        id: '',
        documents: [],
        result_check: '',
        id_apar: '',
        id_checker_account: '',
        checker_name: '',
        status_check: false,
        check_time: '',
        user: { id: '', name: '', role: '' }
      });
    const [isInfomodalShow, setIsInfoModalShow] = useState(false);
    const { register, reset, setValue, getValues, handleSubmit } = useForm({
        defaultValues: {
            id: "",
            apar_number: "",
            id_location: "",
            location_label:"",
            condition: true,
            refill_status: false,
        },
    });
    const [isFixmodalShow, setIsFixModalShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(aparData);
    const token = localStorage.getItem('token');
    const [message, setMessage] = useState('');
    const [isDangerAlertShow, setIsDangerAlertShow] = useState(false);
    const [isSuccesAlertShow, setIsSuccesAlertShow] = useState(false);
    const [isMakeSureChecked, setIsMakeSureChecked] = useState(false);
    const [locationData, setLocationData] = useState<readonly LocationsData[]>([]);
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
  
    const handleMakeSureChange = () => {
      setIsMakeSureChecked(!isMakeSureChecked);
    };

    async function handleFixApar(data: FieldValues){
       try {
        
        setMessage("")
        const response = await fetch(`${domainApi}/api/v1/apars/fix/${data.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(data),
        });
  
        if (response.ok) {
          const data = await response.json();
          setMessage(data.message)
          setIsSuccesAlertShow(true)
        } else {
          const data = await response.json()
          setMessage(data.message)
          setIsDangerAlertShow(true)
        }
        setIsFixModalShow(false)
        setIsMakeSureChecked(false)
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error during Delete:', error);
      }
    }

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

    const handleSelectChange = (selectedOption: SingleValue<LocationsData>, name: FormFieldName) => {
        setValue(name, selectedOption?.value || '');
        };

    useEffect(() => {
        const fetchAparDsata = async () => {
          try {
    
            const response = await fetch(`${domainApi}/api/v1/apars?condition=false&withInspection=true`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

            const data = await fetchLocationData();
            setLocationData(data);

            if (response.ok) {
              const data = await response.json();
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
            name: <div>Nomor APAR</div>,
            selector: row => row.apar_number,
            sortable: true
        },
        {
            name: <div>Lokasi</div>,
            cell: row => <div>{row.location.location_name}</div>,
            selector: row => row.location.location_name,
            sortable: true
        },
        {
            name: <div>Tipe</div>,
            selector: row => row.apar_type,
            sortable: true
        },
        {
            name: <div>Pemeriksaan Terakhir</div>,
            selector: row => new Date(row.last_6montly_check_time).getTime(),
            cell: row => <div>{new Date(row.last_6montly_check_time).toLocaleString('id-ID', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            })}</div>,
            sortable: true,
        },
        {
            name: <div>Pengisian Terakhir</div>,
            selector: row => new Date(row.last_filing_time).getTime(),
            cell: row => <div>{new Date(row.last_filing_time).toLocaleString('id-ID', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            })}</div>,
            sortable: true
        },
        {
            name: 'Aksi',
            cell: row => <>
                            <Button variant="info" className='mx-1' 
                                  onClick={
                                            () => { setInfoInspectionData({
                                              id: '',
                                              documents: [],
                                              result_check: '',
                                              id_apar: '',
                                              id_checker_account: '',
                                              checker_name: '',
                                              status_check: false,
                                              check_time: '',
                                              user: { id: '', name: '', role: '' }
                                            })
                                                    setIsInfoModalShow(true); 
                                                    if (row.inspection && row.inspection[0]) {
                                                        setInfoInspectionData(row.inspection[0]);
                                                    }
                                                  }
                                            }>
                                <FontAwesomeIcon icon={faCircleInfo}/>
                            </Button>
                            {(userRole === 'Admin' || userRole === 'Checker') && (
                            <>
                              <Button variant="success" className='mx-1'
                             onClick={
                                () => { 
                                        setIsFixModalShow(true); 
                                        reset({id: row.id, apar_number: row.apar_number, id_location: row.location.id, location_label: row.location.location_name })
                                      }
                                }>
                                
                                <FontAwesomeIcon icon={faScrewdriverWrench} />
                            </Button>
                            </>
                          )}
                            
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Perbaikan APAR</Card.Header>
        <Card.Body className='px-4'>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Perbaikan APAR</Breadcrumb.Item>
        </Breadcrumb>
        <Card.Title> Data APAR</Card.Title>
        {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : <>
              <div className="row my-3 align-items-center">
                  <div className="col col-md-3">      
                      <div className="input-group">
                          <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                          <input type="text" className="form-control" onChange={handleFilter}></input>
                      </div>
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
              </>}
        </Card.Body>
    </Card>
    <Modal
      show={isInfomodalShow}
      size="lg"
      centered
      scrollable={true}
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Informasi Pemeriksaan
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='m-2'>
        {infoInspectionData.id ?
            <>
            <table className="table">
                <thead>
                    <tr>
                        <th className="col col-md-2">Bagian</th>
                        <th className="col col-md-2">Status</th>
                        <th className="col-5 col-md-8">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    {JSON.parse(infoInspectionData.result_check).map((result : {part: string, status: boolean, note: string}, index: number) => (
                        <tr key={index}>
                            <td>{result.part}</td>
                            <td>{result.status ? 
                                    <FontAwesomeIcon className='text-success' icon={faCheck} /> :
                                    <FontAwesomeIcon className='text-danger' icon={faXmark} />}
                                    </td>
                            <td>{result.note}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2 className='fw-bolder fs-6 mb-2 mt-4'>Informasi Pemeriksaan</h2>
            <table className="table">
                <tbody>
                    <tr>
                        <th className="col-2 col-md-2">Waktu</th>
                        <td className="col col-md-10">
                            : {new Date(infoInspectionData.check_time).toLocaleString('id-ID', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric'
                            })}
                        </td>
                    </tr>
                    <tr>
                        <th className="col-2 col-md-2">Nama</th>
                        <td className="col col-md-10">: {infoInspectionData.checker_name}</td>
                    </tr>
                    <tr>
                        <th className="col-2 col-md-2">Dokumen</th>
                        <td className="col col-md-10"> 
                            <div className='row m-2'>
                                <ul className="list-group col">
                                    {infoInspectionData.documents.map((document : {fileName: string, fileLink: string}) => (
                                        <a href={document.fileLink} target='_blank' key={document.fileLink}><li className="list-group-item disabled bg-light" aria-disabled="true">{document.fileName}</li></a> 
                                    ))}
                                </ul>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            </>
            :
            <h4>Data tidak ditemukan</h4>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => {setIsInfoModalShow(false);}}>Close</Button>
      </Modal.Footer>
    </Modal>
    <Modal show={isFixmodalShow} onHide={() => setIsFixModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Perbaiki APAR</Modal.Title>
        </Modal.Header>
          <Form onSubmit={handleSubmit((data) => handleFixApar(data))}>
            <Modal.Body>
                <h4  className="fw-semibold fs-5 mb-3">No Apar : {getValues('apar_number')}</h4>
                <Form.Group  className="mb-3">
                    <Form.Label>Penempatan Apar</Form.Label>
                    <Select
                        required
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
                <Form.Group className="mb-3"controlId="exampleForm.ControlTextarea1">
                <Form.Label>Apakah dilakukan pengisian ulang APAR ?</Form.Label>
                        <Form.Check
                            type={'checkbox'}
                            label={`Ya`}
                            {...register('refill_status')}
                        />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Pastikan kondisi APAR layak operasi !</Form.Label>
                        <Form.Check
                            type={'checkbox'}
                            label={`Ya`}
                            checked={isMakeSureChecked}
                            onChange={handleMakeSureChange}
                            required
                        />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsFixModalShow(false)}>
                Tutup
            </Button>
            <Button variant="primary" type='submit' disabled={!isMakeSureChecked}>
                Simpan
            </Button>
            </Modal.Footer>
          </Form>
      </Modal>
    </>
  );
}

export default FixApar;