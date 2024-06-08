import {Card, Breadcrumb, Button, Spinner} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import domainApi from '../../services/config/domainApi';
import DeleteModal from '../../components/DeleteModal';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';
import useAuth from '../../services/utils/useContext';

type DataRow = {
    username: string;
    name: string;
    email: string
    role: string;
    id:string;
};
type UserData = {
    username: string;
    name: string;
    email: string
    role: string;
    id: string,
    iat: number
};

function ManageAccount() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(userData);
    const [infoDeleteData, setInfoDeleteData] = useState({id:"", name:""});
    const [isDeleteModalShow, setIsDeleteModalShow] = useState(false);
    const token = localStorage.getItem('token');
    const [message, setMessage] = useState('');
    const [isDangerAlertShow, setIsDangerAlertShow] = useState(false);
    const [isSuccesAlertShow, setIsSuccesAlertShow] = useState(false);
    const tableStyles = {
      headCells: {
        style: {
          backgroundColor: '#34495E', 
          color: 'white',
          border:  "1px white solid"
        },
      }
    };

    const { userRole } = useAuth();

    function handleFilter(event: { target: { value: string; }; }){
        const newData = userData.filter( row => {
            const searchTerm = event.target.value.toLowerCase();
            return  (
                row.name.toLowerCase().includes(searchTerm) ||
                row.username.toLowerCase().includes(searchTerm) ||
                row.email.toLowerCase().includes(searchTerm) ||
                row.role.toLowerCase().includes(searchTerm)
            );
        })
        setRecord(newData)

    }

    const handleDeleteUser = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      setMessage('')
      setLoading(true)
      try {

        const response = await fetch(`${domainApi}/api/v1/users/${infoDeleteData.id}`, {
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
        setLoading(false)
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error during Delete:', error);
      }
    };

    useEffect(() => {
        const fetchUserDsata = async () => {
          try {
            const response = await fetch(`${domainApi}/api/v1/users`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setUserData(data.data);
              setRecord(data.data)
            } else {
              console.error('Error fetching cars data:', response.status);
            }
          } catch (error) {
            console.error('Error during fetch:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserDsata();
      }, [navigate,message]);

      const actionColumn = userRole === 'Admin' ? {
        name: 'Aksi',
        cell: (row: DataRow) => (
          <>
            <Link to={`/account/update/${row.id}`}><Button variant="success" className='mx-2'><FontAwesomeIcon icon={faPenToSquare} /></Button></Link>
            <Button variant="danger" onClick={() => {setIsDeleteModalShow(true); setInfoDeleteData({id: row.id, name: row.name})}} ><FontAwesomeIcon icon={faTrash} /></Button>
          </>
        ),
      } : {};
    
    const columns: TableColumn<DataRow>[] = [
        {
            name: 'Username',
            selector: row => row.username,
            sortable: true
        },
        {
            name: 'Nama',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true
        },
        {
            name: 'Role',
            selector: row => row.role,
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Manajemen Akun</Card.Header>
        <Card.Body className='px-4'>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Manajemen Akun</Breadcrumb.Item>
        </Breadcrumb>
        <Card.Title> Data Akun </Card.Title>
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
                    <Link to={"/account/add"}><Button variant="primary">Tambah Akun</Button></Link>
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
    <DeleteModal show={isDeleteModalShow} onHide={() => setIsDeleteModalShow(false)} onDelete={handleDeleteUser} infoData={infoDeleteData}/>
    </>
  );
}

export default ManageAccount;