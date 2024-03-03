import {Card, Button, Row, Spinner  } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import domainApi from '../../services/config/domainApi';
import PDFGenerator from '../PrintApar/PrintApar';
import QRCode from 'qrcode.react';
import domainFrontend from '../../services/config/domainFronend';

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

function InfoApar() {
    const navigate = useNavigate();
    const [aparData, setAparData] = useState<AparData>();
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAparDsata = async () => {
            setLoading(true)
          try {
    
            const response = await fetch(`${domainApi}/api/v1/apars/${id}`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setAparData(data.data);
            } else {
              console.error('Error fetching Apar data:', response.status);
              navigate('/not-found')
            }
            setLoading(false)
          } catch (error) {
            console.error('Error during fetch:', error);
            setLoading(false)
          }
        };
    
        fetchAparDsata();
      }, [navigate]);
    
  return (
    <>
    <Card
        bg={"light"}
        key={"secondary"}
        text={'dark'}
        style={{ width: '100%', minHeight: "80vh" }}
        className="mb-4"
    >
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>INFO APAR</Card.Header>
        <Card.Body className='px-4'>
        {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
              <>
                <Row>
                    <div className='col-12 col-md-6'>
                        <table className="table table-striped">
                            <tbody>
                                <tr>
                                    <th className="col-2 col-md-3">Nomor APAR</th>
                                    <td>{aparData?.apar_number}</td>
                                </tr>
                                <tr>
                                    <th>Tipe</th>
                                    <td>{aparData?.apar_type}</td>
                                </tr>
                                <tr>
                                    <th>Lokasi</th>
                                    <td>{aparData?.location.location_name}</td>
                                </tr>
                                <tr>
                                    <th>Kondisi</th>
                                    <td>
                                        {
                                            aparData?.condition ? 
                                            <FontAwesomeIcon className='text-success' icon={faCheck} /> :
                                            <FontAwesomeIcon className='text-danger' icon={faXmark} />
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <th>Pemeriksaan Semesteran</th>
                                    <td>
                                        <ul>
                                            <li>
                                            Waktu :  {new Date(String(aparData?.last_6montly_check_time)).toLocaleDateString('id-ID', { 
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            second: 'numeric',
                                                            })}
                                            </li>
                                            <li>
                                                Pemeriksa 
                                                {
                                                    aparData?.location.checker
                                                        .filter(checker => checker.checker_type === '6MONTHLY')
                                                        .map((checker, index, array) => (
                                                            <span key={checker.id}>
                                                            : {checker.user.name}
                                                                {index < array.length - 1 && ','}
                                                            </span>
                                                        ))
                                                }
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Pemeriksaan Bulanan</th>
                                    <td>
                                        <ul>
                                            <li>
                                            Waktu :  {new Date(String(aparData?.last_1montly_check_time)).toLocaleDateString('id-ID', { 
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                        })}
                                            </li>
                                            <li>
                                                Pemeriksa 
                                                {
                                                    aparData?.location.checker
                                                        .filter(checker => checker.checker_type === '1MONTHLY')
                                                        .map((checker, index, array) => (
                                                            <span key={checker.id}>
                                                            : {checker.user.name}
                                                                {index < array.length - 1 && ','}
                                                            </span>
                                                        ))
                                                }
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Pengisian Terakhir</th>
                                    <td>
                                        {new Date(String(aparData?.last_filing_time)).toLocaleDateString('id-ID', { 
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                        })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div id="pdf-content">
                            <Row className='border border-black rounded'>
                                <div className='col-12 align-self-center border-black border-bottom'>
                                    <h1 className='text-center fs-4 fw-normal'>Kartu Pemeriksaan Apar</h1>
                                </div>
                                <div className='col-8 p-2'>
                                    <table className="table table-striped">
                                        <tbody>
                                            <tr>
                                                <th className="col-2 col-md-5">Nomor APAR</th>
                                                <td>{aparData?.apar_number}</td>
                                            </tr>
                                            <tr>
                                                <th>Tipe</th>
                                                <td>{aparData?.apar_type}</td>
                                            </tr>
                                            <tr>
                                                <th>Lokasi</th>
                                                <td>{aparData?.location.location_name}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className='col-4 p-2'>
                                    <QRCode value={`${domainFrontend}/apar/info/${aparData?.id}`} />
                                </div>
                            </Row>
                        </div>
                    </div>
                    <div className='col-12 col-md-6'>
                    <Row className='p-3'>
                            <Link to={`/inspection-6-monthly/add/${aparData?.id}`}>
                                <Button className='col-12 my-2'>Pemeriksaan Semesteran</Button>
                            </Link>
                            <Link to={`/inspection-1-monthly/add/${aparData?.id}`}>
                                <Button className='col-12 my-2'>Pemeriksaan Bulanan</Button>
                            </Link>
                            <Link to={`/history-6-monthly/${aparData?.id}`}>
                                <Button className='col-12 my-2'>Riwayat Pemeriksaan Semesteran</Button>
                            </Link>
                            <Link to={`/history-1-monthly/${aparData?.id}`}>
                                <Button className='col-12 my-2'>Riwayat Pemeriksaan Bulanan</Button>
                            </Link>
                                <PDFGenerator data={aparData?.apar_number ? aparData?.apar_number : '' } />   
                            <Link to={'/apar'}>
                                <Button className='col-12 my-2' variant='secondary'>Kembali</Button>
                            </Link>
                    </Row>
                    </div>
                </Row>
              </>}
        </Card.Body>    
    </Card>
    </>
  );
}

export default InfoApar;