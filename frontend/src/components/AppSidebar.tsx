import React from 'react';
import {Offcanvas , ListGroup, Accordion} from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faFireExtinguisher, faLocationDot, faUsers, faFolderOpen, faWrench, faListCheck } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';

interface OffcanvasContentProps {
  show: boolean;
  handleClose: () => void;
}

const SideBarApp: React.FC<OffcanvasContentProps> = ({ show, handleClose }) => {
  return (
      <Offcanvas show={show} onHide={handleClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Sistem Informasi Manajemen APAR</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='sidebar-list'>
          <ListGroup>
            <Accordion>
              <Accordion.Item eventKey="2">
                <Link to="/dashboard">
                  <ListGroup.Item action as="div" className='px-3'><span className="badge"><FontAwesomeIcon icon={faHome} /></span>Dashboard</ListGroup.Item>
                </Link>
              </Accordion.Item>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Manajemen Data</Accordion.Header>
                <Accordion.Body>
                  <Link to="/location">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faLocationDot} /></span>Lokasi</ListGroup.Item>
                  </Link>
                  <Link to="/apar">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faFireExtinguisher} /></span>APAR</ListGroup.Item>
                  </Link>
                  <Link to="/account">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faUsers} /></span>Akun</ListGroup.Item>
                  </Link>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Pemeriksaan</Accordion.Header>
                <Accordion.Body>
                  <Link to="/inspection-6-monthly">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faListCheck} /></span>Semester (6 Bulan)</ListGroup.Item>
                  </Link>
                  <Link to="/inspection-1-monthly">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faListCheck} /></span>Bulanan (1 Bulan)</ListGroup.Item>
                  </Link>
                  <Link to="/history">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faFolderOpen} /></span>Riwayat</ListGroup.Item>
                  </Link>
                  <Link to="/need-fix">
                    <ListGroup.Item action as="div"><span className="badge"><FontAwesomeIcon icon={faWrench} /></span>Perbaikan</ListGroup.Item>
                  </Link>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </ListGroup>
          </Offcanvas.Body>
      </Offcanvas>
  );
}

export default SideBarApp;
