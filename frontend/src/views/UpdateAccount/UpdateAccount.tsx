import {Card, Button, Col, Form, Row, Breadcrumb, Spinner} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import domainApi from '../../services/config/domainApi';
import Alert from 'react-bootstrap/Alert';

function UpdateAccount() {
    const navigate = useNavigate();
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
    const [formData, setFormData]= useState({name:"", username:"", password: "", confirmPassword: "", email: "", role: "Viewer" })
    const [show, setShow] = useState(false);
    const token = localStorage.getItem('token');
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const handleChange = (event: { target: {name: string, value: string }; }) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        if (name === "name") {
            setIsNameValid(value.length < 3 || value.length > 25 );
          }
          
        if (name === "username") {
          setIsUsernameValid(Boolean(value.length <= 7));
        }

        if (name === "password") {
          setIsPasswordValid(value.length <= 7);
          setIsConfirmPasswordValid(value !== formData.confirmPassword);
        }
    
        if (name === "confirmPassword") {
          setIsConfirmPasswordValid(value !== formData.password);
        }
    
        if (name === "email") {
          const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          setIsEmailValid(!emailPattern.test(value));
        }

    }
    const isSubmitDisabled = !isUsernameValid && !isPasswordValid && !isConfirmPasswordValid && !isEmailValid;

    const handleUpdate = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
              return;
            }

          const response = await fetch(`${domainApi}/api/v1/users/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData),
          });
    
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message)
            navigate('/account');
          } else {
            const data = await response.json()
            setMessage(data.message)
            setShow(true)
          }
        } catch (error) {
          console.error('Error during login:', error);
        }
      };

      useEffect(() => {
        const fetchUserDsata = async () => {
          try {
            const response = await fetch(`${domainApi}/api/v1/users/${id}`,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
    
            if (response.ok) {
              const data = await response.json();
              setFormData({name: data.data.name, username: data.data.username, password: "", confirmPassword: "", email: data.data.email, role: data.data.role})
            } else {
              console.error('Error fetching account data:', response.status);
              navigate('/not-found');
            }
          } catch (error) {
            console.error('Error during fetch:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserDsata();
      }, [navigate,message]);
      console.log(formData)
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
        <Card.Header style={{ borderTop: "2px #34495E solid" }}>Manajemen Akun</Card.Header>
        <Card.Body className='px-4'>
        {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
              <>
                <Breadcrumb>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>Home</Breadcrumb.Item>
                  <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/account' }}>Manajemen Akun</Breadcrumb.Item>
                  <Breadcrumb.Item active>Edit</Breadcrumb.Item>
              </Breadcrumb>
              <Card.Title> Edit Akun </Card.Title>
              <div className="row my-3 align-items-center">
                  <div className="col">
                      <Form.Group as={Col} md="4" controlId="validationCustom01">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                              type="text"
                              value={formData.username}
                              disabled={true}
                          />
                      </Form.Group>
                      <div className="small form-text text-muted">Username tidak dapat diubah</div>
                      <Form className='my-2' onSubmit={handleUpdate}>
                          <Row className="mb-3">
                              <Form.Group as={Col} md="4" controlId="validationCustom01">
                                  <Form.Label>Nama Pengguna</Form.Label>
                                  <Form.Control
                                      required
                                      type="text"
                                      name='name'
                                      placeholder="Nama Pengguna"
                                      onChange={handleChange}
                                      value={formData.name}
                                      isInvalid={isNameValid}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                      Nama harus terdiri dari antara 3 sampai 25 karakter!
                                  </Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group as={Col} md="4" controlId="validationCustom02">
                                  <Form.Label>Email</Form.Label>
                                  <Form.Control
                                      required
                                      type="email"
                                      name='email'
                                      placeholder="Email"
                                      onChange={handleChange}
                                      isInvalid={isEmailValid}
                                      value={formData.email}
                                  />
                                  <Form.Control.Feedback type='invalid'>Format Email Tidak Sesuai</Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group as={Col} md="4" controlId="validationCustom03">
                                  <Form.Label>Role</Form.Label>
                                  <Form.Select name='role' onChange={handleChange} value={formData.role}>
                                      <option value="Viewer">Viewer</option>
                                      <option value="Checker">Checker</option>
                                      <option value="Admin">Admin</option>
                                  </Form.Select>
                              </Form.Group>
                          </Row>
                          <Row className="mb-3">
                              <Form.Group as={Col} md="4" controlId="validationCustom03">
                                  <Form.Label>Password</Form.Label>
                                  <Form.Control type="password" name='password' placeholder="Password" onBlur={handleChange} isInvalid={isPasswordValid} />
                                  <Form.Control.Feedback type="invalid">
                                      Masukan setidaknya 8 Karakter
                                  </Form.Control.Feedback>
                                  <div className="small form-text text-muted">Kosongkan jika tidak ingin mengubah password!</div>
                              </Form.Group>
                              <Form.Group as={Col} md="4" controlId="validationCustom03">
                                  <Form.Label>Konfirmasi Password</Form.Label>
                                  <Form.Control type="password" name='confirmPassword' placeholder="Konfirmasi Password" onBlur={handleChange} isInvalid={isConfirmPasswordValid} />
                                  <Form.Control.Feedback type="invalid">
                                      Password tidak cocok
                                  </Form.Control.Feedback>
                              </Form.Group>
                          </Row>
                          <Link to={"/account"}><Button type="submit" className='btn-secondary mx-2'>Kembali</Button></Link>
                          <Button type="submit" disabled={!isSubmitDisabled}>Ubah</Button>
                      </Form>      
                  </div>
              </div>
              </>}
        </Card.Body>
    </Card>
    </>
  );
}

export default UpdateAccount;