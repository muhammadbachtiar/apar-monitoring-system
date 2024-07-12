import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeleteModal from '../../components/DeleteModal';
import { faSearch, faCheck, faXmark, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import differenceInMinutes from '../../services/utils/diffrentMinuteTime';
import domainApi from '../../services/config/domainApi';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';
import { Accordion,Form , Row, Col, Spinner, Card, Breadcrumb, Button } from 'react-bootstrap';

type DataRow = {
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

type InspectionData = {
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


function HistoryInspection6Monthly() {
    const navigate = useNavigate();
    const [aparData, setAparData]= useState({apar_number:"", apar_type:"", location: "", last_6montly_check_time: "", last_filing_time: "" })
    const [historyData, setHistoryData] = useState<InspectionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);
    const [infoDeleteData, setInfoDeleteData] = useState({id:"", name:""});
    const [record, setRecord] = useState(historyData);
    const token = localStorage.getItem('token');
    const [message, setMessage] = useState('');
    const [isDangerAlertShow, setIsDangerAlertShow] = useState(false);
    const [isSuccesAlertShow, setIsSuccesAlertShow] = useState(false);
    const { id } = useParams();
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
        const newData = historyData.filter( row => {
            const searchTerm = event.target.value.toLowerCase();
            return  (
                row.check_time.toLowerCase().includes(searchTerm)
            );
        })
        setRecord(newData)

    }

    const handleDeleteUser = async (e: { preventDefault: () => void; }) => {
        setLoading(true)
        setIsDeleteModalShow(false)
        e.preventDefault();
        try {
  
          const response = await fetch(`${domainApi}/api/v1/6monthly-inspections/${infoDeleteData.id}`, {
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
          } else {
            const data = await response.json()
            setMessage(data.message)
            setIsDangerAlertShow(true)
          }
          setLoading(false)
          window.scrollTo(0, 0);
        } catch (error) {
          console.error('Error during Delete:', error);
          setLoading(false)
        }
      };

    useEffect(() => {

        const fetchData = async () => {
            setLoading(true)
            try {
              const aparResponse = await fetch(`${domainApi}/api/v1/apars/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
          
              if (aparResponse.ok) {
                const aparData = await aparResponse.json();
                setAparData({
                  apar_number: aparData.data.apar_number,
                  apar_type: aparData.data.apar_type,
                  location: aparData.data.location.location_name,
                  last_6montly_check_time: aparData.data.last_6montly_check_time,
                  last_filing_time: aparData.data.last_filing_time,
                });
              } else {
                console.error('Error fetching Apar data:', aparResponse.status);
                navigate('/not-found');
              }
          
              const inspectionResponse = await fetch(`${domainApi}/api/v1/6monthly-inspections?id_apar=${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
          
              if (inspectionResponse.ok) {
                const inspectionData = await inspectionResponse.json();
                setHistoryData(inspectionData.data);
                setRecord(inspectionData.data);
              } else {
                console.error('Error fetching Inspection data:', inspectionResponse.status);
              }
              setLoading(false)
            } catch (error) {
              console.error('Error during fetch:', error);
              setLoading(false)
              navigate('/not-found');
            } finally {
              setLoading(false);
            }
          };
          
        fetchData();          
            
      }, [navigate,message]);
    
    const columns: TableColumn<DataRow>[] = [
        {   name: 'Daftar Riwayat Pemeriksaan',
            cell: (row) => {
                const result_check = JSON.parse(row.result_check);
                return (
                    <Accordion defaultActiveKey="1" className='m-2 col-12'>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>{new Date(row.check_time).toLocaleString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric'
                                                })}
                            </Accordion.Header>
                            <Accordion.Body>
                            {loading ?
                            <div className="col-12 pb-5 mb-5 align-self-center text-center">
                                <Spinner animation="border" variant="success" />
                            </div> : 
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
                                        {result_check.map((result : {part: string, status: boolean, note: string}, index: number) => (
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
                                                : {new Date(row.check_time).toLocaleString('id-ID', {
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
                                            <th className="col-2 col-md-2">Akun</th>
                                            <td className="col col-md-10">: {row.user.name}</td>
                                        </tr>
                                        <tr>
                                            <th className="col-2 col-md-2">Nama</th>
                                            <td className="col col-md-10">: {row.checker_name}</td>
                                        </tr>
                                        <tr>
                                            <th className="col-2 col-md-2">Hasil</th>
                                            <td className="col col-md-10">
                                                : {row.status_check ? 
                                                    "Layak Operasi" :
                                                    "Tidak Layak Operasi"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="col-2 col-md-2">Dokumen</th>
                                            <td className="col col-md-10"> 
                                                <div className='row m-2'>
                                                    <ul className="list-group col">
                                                        {row.documents.map((document : {fileName: string, fileLink: string}) => (
                                                            <a href={document.fileLink} target='_blank' key={document.fileLink}><li className="list-group-item disabled bg-light" aria-disabled="true">{document.fileName}</li></a> 
                                                        ))}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="col-2 col-md-2">Aksi</th>
                                            <td className="col-5 col-md-10">
                                                    {
                                                    differenceInMinutes(row.check_time) < 30 ? (
                                                        <Link to={`/history-6-monthly/edit/${row.id}`}>
                                                            <Button variant="success" className='mx-1'>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </Button>
                                                        </Link>
                                                    ) : null
                                                }
                                                <Button variant="danger" onClick={() => {setIsDeleteModalShow(true); setInfoDeleteData({id: row.id, name: new Date(row.check_time).toLocaleString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric'
                                                    })})}} >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                            }
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                );
              },
              sortable: true,
              conditionalCellStyles: [
                {
                  when: row => {
                    return row.status_check;
                  },
                  style: {
                    border: '1px solid rgba(63, 195, 128, 0.9)',
                    color: 'white',
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  },
                },
                {
                  when: row => {return !row.status_check },
                  style: {
                    border: '1px solid rgba(242, 38, 19, 0.9)',
                    color: 'white',
                    '&:hover': {
                      cursor: 'not-allowed',
                    },
                  },
                },
              ],
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Riwayat Pemeriksaan APAR</Card.Header>
        <Card.Body className='px-4'>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/history' }}>Daftar APAR</Breadcrumb.Item>
            <Breadcrumb.Item active>Riwayat</Breadcrumb.Item>
        </Breadcrumb>
        <Card.Title>Riwayat Pemeriksaan Semester </Card.Title>
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
                                    value={new Date(aparData.last_6montly_check_time).toLocaleString('id-ID', {
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
            </div>
        </div>
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
            pagination
            paginationRowsPerPageOptions={[10,50,100]}
            customStyles={tableStyles}
            />
        </Card.Body>
    </Card>
    <DeleteModal show={isDeleteModalShow} onHide={() => setIsDeleteModalShow(false)} onDelete={handleDeleteUser} infoData={infoDeleteData}/>
    </>
  );
}

export default HistoryInspection6Monthly;