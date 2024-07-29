import {Card, Breadcrumb, Button, Form, InputGroup, Row, Alert, Spinner, Col} from 'react-bootstrap';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import domainApi from '../../services/config/domainApi';

function AddAccount() {
    const navigate = useNavigate();
    const [isNameValid, setIsNameValid] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [formData, setFormData]= useState({name:"", username: "", password: "", confirmPassword: "", email: "", role: "Viewer" })
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (event: { target: {name: string, value: string }; }) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        if (name === "name") {
          setIsNameValid(Boolean(value.length < 3 || value.length > 52));
        }

        if (name === "username") {
          setIsUsernameValid(Boolean(value.length <= 7));
        }

        if (name === "password") {
          setIsPasswordValid(value.length <= 7);
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

    const handleRegister = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true)
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
              return;
            }

          const response = await fetch(`${domainApi}/api/v1/users`, {
            method: 'POST',
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
          setLoading(false)
        } catch (error) {
          console.error('Error during login:', error);
          setLoading(false)
        }
      };

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
                    <Breadcrumb.Item active>Tambah</Breadcrumb.Item>
                </Breadcrumb>
                <Card.Title> Tambah Akun </Card.Title>
                <div className="row my-3 align-items-center">
                    <div className="col">
                        <Form onSubmit={handleRegister}>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4" controlId="validationCustom01">
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
                                      Yakin sudah memasukkan nama dengan benar?
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                                    <Form.Label>Username</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        placeholder="Username"
                                        name='username'
                                        aria-describedby="inputGroupPrepend"
                                        required
                                        onBlur={handleChange}
                                        isInvalid={isUsernameValid}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Masukkan setidaknya 8 Karakter
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group as={Col} md="4" controlId="validationCustom02">
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
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="3" controlId="validationCustom03">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name='password' placeholder="Password" onBlur={handleChange} required isInvalid={isPasswordValid} />
                                    <Form.Control.Feedback type="invalid">
                                        Masukkan password yang lebih kuat
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="3" controlId="validationCustom03">
                                    <Form.Label>Konfirmasi Password</Form.Label>
                                    <Form.Control type="password" name='confirmPassword' placeholder="Konfirmasi Password" onBlur={handleChange} required isInvalid={isConfirmPasswordValid} />
                                    <Form.Control.Feedback type="invalid">
                                        Password tidak cocok
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="validationCustom03">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Select name='role' onBlur={handleChange}>
                                        <option value="Viewer">Viewer</option>
                                        <option value="Checker">Checker</option>
                                        <option value="Admin">Admin</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                            <Link to={"/account"}><Button type="submit" className='btn-secondary mx-2'>Kembali</Button></Link>
                            <Button type="submit" disabled={!isSubmitDisabled}>Tambahkan</Button>
                        </Form>      
                    </div>
                </div>
              </>}
        </Card.Body>
    </Card>
    </>
  );
}

export default AddAccount;