import {Card, Breadcrumb, Button, ListGroup, Spinner} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faClipboard } from "@fortawesome/free-solid-svg-icons";
import differenceInDays from '../../services/utils/diffrentDayTime';
import domainApi from '../../services/config/domainApi';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';
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
    location: {location_name: string, id:string , checker: Chceker[]}
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
  location: {location_name: string, id:string , checker: Chceker[]}
};


function InspectionApar() {
    const navigate = useNavigate();
    const [aparData, setAparData] = useState<AparData[]>([]);
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(aparData);
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
                row.location.location_name.toLowerCase().includes(searchTerm) ||
                row.location.checker.some(checker =>
                  checker.checker_type === 'SEMESTER' && checker.user.name.toLowerCase().includes(searchTerm)
                )
            );
        })
        setRecord(newData)

    }

    useEffect(() => {
        const fetchAparDsata = async () => {
          try {
    
            const response = await fetch(`${domainApi}/api/v1/apars?condition=true`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setAparData(data.data);
              setRecord(data.data)
            } else {
              console.error('Error fetching Apar data:', response.status);
            }
          } catch (error) {
            console.error('Error during fetch:', error);
            setIsDangerAlertShow(true)
            setMessage("Error fetching Inspection Apar data")
          } finally {
            setLoading(false);
          }
        };
    
        fetchAparDsata();
      }, [navigate,message]);

      const actionColumn = userRole === 'Admin' || userRole === 'Checker' ? {
        name: 'Aksi',
        cell: (row: DataRow) => <>
                      <Link to={`/inspection-6-monthly/add/${row.id}`}><Button variant="warning" className='mx-1'><FontAwesomeIcon icon={faClipboard} /></Button></Link>
                    </>,
        width: "15%"
    } : {};
    
    const columns: TableColumn<DataRow>[] = [
        {
            name: <div>Nomor APAR</div>,
            selector: row => row.apar_number,
            sortable: true,
        },
        {
            name: <div>Lokasi</div>,
            selector: row => row.location.location_name,
            sortable: true,
        },
        {
          name: <div>Pemeriksa Semester</div>,
          selector: row => {
            const type1Checkers = row.location.checker
              .filter(checker => checker.checker_type === 'SEMESTER')
              .map(checker => checker.user.name)
              .join(', ');
            return type1Checkers;
          },
          cell: row => {
            const type1Checkers = row.location.checker.filter(checker => checker.checker_type === 'SEMESTER');
            return <>
              <ListGroup as="ol" numbered>
                { type1Checkers.map(checker =><><li>{checker.user.name}</li></>)}
              </ListGroup>
            </>
           
          },
          sortable: true,
        },
        {
            name: 'Tipe',
            selector: row => row.apar_type,
            sortable: true
        },
        {
            name: <div>Pemeriksaan Semester Terakhir</div>,
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
            conditionalCellStyles: [
              {
                when: row => {
                  return differenceInDays(row.last_6montly_check_time) <= 135;
                },
                style: {
                  backgroundColor: 'rgba(63, 195, 128, 0.9)',
                  color: 'white',
                  '&:hover': {
                    cursor: 'pointer',
                  },
                },
              },
              {
                when: row => {return differenceInDays(row.last_6montly_check_time) > 135 && differenceInDays(row.last_6montly_check_time) <= 175},
                style: {
                  backgroundColor: 'rgba(248, 148, 6, 0.9)',
                  color: 'white',
                  '&:hover': {
                    cursor: 'pointer',
                  },
                },
              },
              {
                when: row => {return differenceInDays(row.last_6montly_check_time) > 175},
                style: {
                  backgroundColor: 'rgba(242, 38, 19, 0.9)',
                  color: 'white',
                  '&:hover': {
                    cursor: 'not-allowed',
                  },
                },
              },
            ],
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
        actionColumn
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Pemeriksaan APAR</Card.Header>
        <Card.Body className='px-4'>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Pemeriksaan APAR</Breadcrumb.Item>
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
    </>
  );
}

export default InspectionApar;