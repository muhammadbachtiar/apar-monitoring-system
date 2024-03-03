import React, { useState } from 'react';
import {Modal, Button, Spinner} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import domainApi from "../../services/config/domainApi";
import {CButton,CCard,CCardBody,CCardGroup,CCol,CContainer,CForm,CFormInput,CInputGroup,CInputGroupText,CRow} from '@coreui/react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";

const LoginPage: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWrongPasswordShow, setIsWrongPasswordShow] = useState(false);
  const [isWrongUsernameShow, setIsWrongUsernameShow] = useState(false);
  const isSubmitDisabled = !username || !password;
  const navigate = useNavigate();

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      setLoading(true)
      const response = await fetch(`${domainApi}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        const ErrorMessage = await response.json();
        if(ErrorMessage.error === 'INVALID_USERNAME'){
          setIsWrongUsernameShow(true)
        }
        if(ErrorMessage.error === 'INVALID_PASSWORD'){
          setIsWrongPasswordShow(true)
        }
      }
      setUsername('')
      setPassword('')
      setLoading(false)
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 min-vw-100 d-flex flex-row align-items-center" style={{ backgroundImage: 'url("/assets/bukit-asam.jpg")', backgroundSize: 'cover' }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={7} className="align-items-stretch">
            <CCardGroup style={{height: '100%'}}>
              <CCard className="p-2">
              <CCardBody style={{ backgroundImage: 'url("/assets/profile.jpg")', backgroundSize: 'cover' }}>
                <div className='row' style={{height: '100%'}}>
                  <div className='col-12 col-md-6 align-self-end'>
                    <p className="text-white fs-6 mt-3 mb-0">Sistem Informasi Manajemen APAR</p>
                    <div className="text-white fs-5">Satuan Kerja PK&K PT Bukit Asam</div>
                    <div className="text-white fs-5 text-opacity-50">Satuan Kerja PK&K PT Bukit Asam</div>
                  </div>
                  <div className='col-12 col-md-6 align-items-start'>
                    <h1 className='fs-1 text-success-emphasis text-black'>Selamat Datang</h1>
                  </div>
                </div>
              </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
          <CCol md={5} className="align-items-stretch d-flex flex-column">
            <CCardGroup>
              <CCard className="p-2">
                <CCardBody>
                {loading ?
              <div className="col-12 p-5 m-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> : 
                  <CForm onSubmit={handleLogin}>
                  <CRow>
                    <CCol >
                      <h1 className='fs-3'>Silakan Masuk</h1>
                      <p className="text-body-secondary">Masukkan Kredensial Login Anda</p>
                    </CCol>
                    <CCol className='text-center'>
                      <img
                        src="/assets/LogoSatker.svg"
                        width={100}
                        alt="Logo"
                        className='rounded'
                        style={{
                          borderRadius: '10px', 
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </CCol>
                  </CRow>
                  <CInputGroup className="my-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faUser} />
                    </CInputGroupText>
                    <CFormInput placeholder="username" autoComplete="username" onBlur={(e) => setUsername(e.target.value)}  />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faLock} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol xs={6}>
                      <CButton type="submit" color="primary" className="px-4" disabled={isSubmitDisabled}>
                        Masuk
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>}
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
      <Modal
        show={isWrongPasswordShow} onHide={() => setIsWrongPasswordShow(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <h4>Password Salah</h4>
          <p>
            Password yang anda masukan tidak cocok dengan data kami. Silakan masukan password yang benar
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setIsWrongPasswordShow(false)}>Mengerti</Button>
        </Modal.Footer>
    </Modal>
    <Modal
        show={isWrongUsernameShow} onHide={() => setIsWrongUsernameShow(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <h4>Username Salah</h4>
          <p>
            Kami tidak dapat menemukan username yang anda masukan. Silakan masukan username yang benar
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setIsWrongUsernameShow(false)}>Mengerti</Button>
        </Modal.Footer>
    </Modal>
    </div>
  )
};

export default LoginPage;
