import {Card, Breadcrumb, Button, Col, Form, Row, Spinner, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import domainApi from '../../services/config/domainApi';
import SuccessAlert from '../../components/SuccessAlert';
import FailedAlert from '../../components/FailedAlert';

function Profile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({name:"", username:"", email:"", role:""});
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
    const [formData, setFormData]= useState({name:"", oldPassword: "", newPassword:"" ,confirmnewPassword:"", email: "" })
    const [isDangerAlertShow, setIsDangerAlertShow] = useState(false);
    const [isSuccesAlertShow, setIsSuccesAlertShow] = useState(false);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');

    const handleChange = (event: { target: {name: string, value: string }; }) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });

        if (name === "name") {
          setIsNameValid(value.length < 3 || value.length > 25 );
        }

        if (name === "newPassword") {
          setIsPasswordValid(value.length <= 7);
        }
    
        if (name === "confirmnewPassword") {
          setIsConfirmPasswordValid(value !== formData.newPassword);
        }
    
        if (name === "email") {
          const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          setIsEmailValid(!emailPattern.test(value));
        }
        console.log(isPasswordValid,isConfirmPasswordValid,isEmailValid)

    }

    const handleUpdateName = async (e: { preventDefault: () => void; }) => {
      setMessage('')
        e.preventDefault();
    
        try {

          const response = await fetch(`${domainApi}/api/v1/profile`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({name: formData.name}),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setIsSuccesAlertShow(true)
            setFormData({name:"", oldPassword: "", newPassword:"" ,confirmnewPassword:"", email: "" })
          } else {
            const data = await response.json()
            setMessage(data.message)
            setIsDangerAlertShow(true)
          }
          window.scrollTo(0, 0);
        } catch (error) {
          console.error('Error during update:', error);
        }
      };

      const handleUpdateEmail = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setMessage('')
        try {

          const response = await fetch(`${domainApi}/api/v1/profile`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({email: formData.email}),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setIsSuccesAlertShow(true)
            setFormData({name:"", oldPassword: "", newPassword:"" ,confirmnewPassword:"", email: "" })
          } else {
            const data = await response.json()
            setMessage(data.message)
            setIsDangerAlertShow(true)
          }
        } catch (error) {
          console.error('Error during update:', error);
        }
      };

      const handleUpdatePassowrd = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setMessage('')
        try {

          const response = await fetch(`${domainApi}/api/v1/profile`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({oldPassword: formData.oldPassword, newPassword: formData.newPassword}),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            setIsSuccesAlertShow(true)
            setFormData({name:"", oldPassword: "", newPassword:"" ,confirmnewPassword:"", email: "" })
          } else {
            const data = await response.json()
            setMessage(data.message)
            setIsDangerAlertShow(true)
          }
          window.scrollTo(0, 0);
        } catch (error) {
          console.error('Error during update:', error);
        }
      };

    useEffect(() => {
        const fetchUserDsata = async () => {
          try {
    
            const response = await fetch(`${domainApi}/api/v1/auth`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setUserData(data);
            } else {
                const data = await response.json();
              console.error('Error fetching users data:', data.message);
            }
          } catch (error) {
            console.error('Error during fetch:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserDsata();
      }, [navigate, isDangerAlertShow, isSuccesAlertShow]);
  return (
    <>
    <FailedAlert show= {isDangerAlertShow}
                setShow={() => setIsDangerAlertShow(false)}
                message={message}/>
    <SuccessAlert show= {isSuccesAlertShow}
                  setShow={() => setIsSuccesAlertShow(false)}
                  message={message}/>
    <Card
        bg={"Black"}
        key={"secondary"}
        text={'dark'}
        style={{ width: '100%', minHeight: "80vh" }}
        className="mb-4"
    >
        <Card.Header style={{ borderTop: "2px #232931 solid" }}>Profile</Card.Header>
        <Card.Body className='px-4'>
        {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
              <>
                <Breadcrumb>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>Home</Breadcrumb.Item>
                    <Breadcrumb.Item active>Profile</Breadcrumb.Item>
                </Breadcrumb>
                <Card.Title> Informasi Akun </Card.Title>
                <div className="row my-3 align-items-center">
                    <div className="col">
                        <Row className="mb-3">
                            <Form.Group as={Col} md="3" controlId="validationCustom01">
                                <Form.Label>Nama Pengguna</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name='Info Nama'
                                    value={userData.name}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustomUsername">
                                <Form.Label>Username</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                    disabled
                                    type="text"
                                    name='Info Username'
                                    value={userData.username}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    disabled
                                    type="email"
                                    name='Info Email'
                                    value={userData.email}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>Role</Form.Label>
                                <Form.Control
                                    disabled
                                    type="text"
                                    name='Info Role'
                                    value={userData.role}
                                />
                            </Form.Group>
                        </Row>
                    </div>
                </div>
                <div className="row my-3 py-2 align-items-center border border-1 border-primary-subtle rounded">
                  <Card.Title> Ubah Email </Card.Title>
                    <Form onSubmit={handleUpdateEmail}>
                        <Row className="mb-3">
                            <div className='col-md-3 my-2'>
                                <Form.Group controlId="validationCustom02">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        required
                                        type="email"
                                        name='email'
                                        placeholder="Email"
                                        onBlur={handleChange}
                                        isInvalid={isEmailValid}
                                    />
                                    <Form.Control.Feedback type='invalid'>Format Email Tidak Sesuai</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <div className='col align-self-end my-2'>
                                <Button type="submit" disabled={isEmailValid}>Ubah Email</Button>
                            </div>
                        </Row>
                    </Form>      
                </div>
                <div className="row my-3 py-2 align-items-center border border-1 border-primary-subtle rounded">
                  <Card.Title> Ubah Password </Card.Title>
                    <Form onSubmit={handleUpdatePassowrd}>
                        <Row className="mb-3 my-2">
                            <Form.Group as={Col} md="3" controlId="validationCustom03">
                                <Form.Label>Password Lama</Form.Label>
                                <Form.Control type="password" name='oldPassword' placeholder="Password Lama" onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom03">
                                <Form.Label>Password Baru</Form.Label>
                                <Form.Control type="password" name='newPassword' placeholder="Password Baru" onChange={handleChange} required isInvalid={isPasswordValid} />
                                <Form.Control.Feedback type="invalid">
                                    Masukan setidaknya 8 Karakter
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom03">
                                <Form.Label>Konfirmasi Password Baru</Form.Label>
                                <Form.Control type="password" name='confirmnewPassword' placeholder="Konfirmasi Password Baru" onChange={handleChange} required isInvalid={isConfirmPasswordValid} />
                                <Form.Control.Feedback type="invalid">
                                    Password tidak cocok
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className='col-md-3 align-self-end my-2'>
                                <Button type="submit" disabled={ isPasswordValid || isConfirmPasswordValid}>Ubah Password</Button>
                            </div>
                        </Row>
                    </Form>      
                </div>
                <div className="row my-3 py-2 align-items-center border border-1 border-primary-subtle rounded">
                  <Card.Title> Ubah Nama </Card.Title>
                  <Form onSubmit={handleUpdateName}>
                      <Row className="mb-3">
                          <div className='col-md-3 my-2'>
                              <Form.Group controlId="validationCustom01">
                                  <Form.Label>Nama Pengguna</Form.Label>
                                  <Form.Control
                                      required
                                      type="text"
                                      name='name'
                                      placeholder="Nama Pengguna"
                                      onBlur={handleChange}
                                      isInvalid={isNameValid}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    Nama harus terdiri dari antara 3 sampai 25 karakter!
                                </Form.Control.Feedback>
                              </Form.Group>
                          </div>
                          <div className='col align-self-end my-2'>
                              <Button type="submit" disabled={isNameValid}>Ubah Nama</Button>
                          </div>
                      </Row>
                  </Form>      
                </div>
              </>}
        </Card.Body>
    </Card>
    </>
  );
}

export default Profile;