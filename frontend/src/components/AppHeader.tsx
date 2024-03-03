import {Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faUser, faBars, faBell, faAddressCard, faArrowRightFromBracket, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from 'react';
import SideBarApp from './AppSidebar';
import LogOutModal from './LogOutModal';
import  useAuth  from '../services/utils/useContext';

interface Notification {
  id: string
  id_user: string
  title: string
  message: string
  status_read: boolean
  notification_type: string
  timestamp: string
}

interface TopbarProps {
  notificationData: Notification[];
  handleNotificationClick: (notificationId: string) => Promise<void>;
}

const Topbar: React.FC<TopbarProps> = ({ notificationData,  handleNotificationClick}) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [logOutModalShow, setLogOutModalShow] = useState(false);
  const { userName } = useAuth();


  return (
    <>
      <Navbar expand="lg" className="topbar px-3 py-2 mb-4 static-top shadow" style={{ backgroundColor: 'rgb(255 83 113)' }}>
        <div className="row header-row align-items-center">
          <div className="col col-md-9">
            <button className="btn btn-primary" type="button" onClick={() => setShowSideBar(true)}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
          <div className="col">
            <div className="row justify-content-end">
              <div className="col text-end">
                <NavDropdown  className='className="position-relative"' title={<button className="p-0 btn position-relative">
                  <FontAwesomeIcon icon={faBell} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{notificationData.length > 0 ? notificationData.length : ''}</span>
                </button>
                  } id="alertsDropdown">
                  {notificationData.map(notification => (
                    <NavDropdown.Item className='my-1 border fw-medium' onClick={() => handleNotificationClick(notification.id)}>
                      <div className="d-flex align-items-center">
                        {notification.title}
                      </div>  
                    </NavDropdown.Item>
                  ))}
                  <NavDropdown.Item as={Link} to={'/notifications'} className='text-primary-emphasis py-3'>Lihat Seluruh Notifikasi <span><FontAwesomeIcon icon={faAngleRight} className='px-2' /></span></NavDropdown.Item>
                </NavDropdown>
              </div>
              <div className="col text-end">
                <NavDropdown title={<span><span className="pe-2 d-none d-lg-inline text-gray-600 small">{userName}</span><FontAwesomeIcon icon={faUser} /></span>} className='text-end header-dropdown' id="userDropdown">
                  <NavDropdown.Item as={Link} to='/profile'>
                    <FontAwesomeIcon icon={faAddressCard} className='px-2' />
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => setLogOutModalShow(true)} >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className='px-2' />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            </div>
          </div>
        </div>
      </Navbar>
      <SideBarApp show={showSideBar} handleClose={() => setShowSideBar(false)}/>
      <LogOutModal 
        show={logOutModalShow}
        onHide={() => setLogOutModalShow(false)}
      />
    </>
  );
}

export default Topbar;
