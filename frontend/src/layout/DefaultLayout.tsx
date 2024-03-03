import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppFooter, AppHeader } from '../components/index';
import domainApi from '../services/config/domainApi';
import ManageAccount from "../views/manageAccount/ManageAccount";
import DashboardContent from '../views/dashboard/dashboardContent';
import AddAccount from "../views/newAccount/NewAccount";
import UpdateAccount from "../views/UpdateAccount/UpdateAccount";
import Profile from "../views/Profile/Profile";
import ManageLocation from "../views/ManageLocation/ManageLocation";
import AddLocation from "../views/NewLocation/NewLocation";
import ManageApar from "../views/ManageApar/ManageApar";
import AddApar from "../views/NewApar/NewApar";
import InspectionApar from "../views/InspectionApar.tsx/InspectionApar";
import AddInspection6Monthly from "../views/NewInspection6Monthly/NewInspection6Monthly";
import HistoryInspection6Monthly from "../views/HistoryInspection6Monthly/HistoryInspection6Monthly";
import UpdateInspection6Monthly from "../views/UpdateInspection6Monthly/UpdateInspection6Monthly";
import InspectionApar1Monthly from "../views/InspectionApar1Monthly/InspectionApar1Monthly";
import AddInspection1Monthly from "../views/NewInspection1Monthly/NewInspection1Monthly";
import HistoryInspection1Monthly from "../views/HistoryInspection1Monthly/HistoryInspection1Monthly";
import UpdateInspection1Monthly from "../views/UpdateInspection1Monthly/UpdateInspection1Monthly";
import HistoryList from "../views/HistoryList/HistoryList";
import FixApar from "../views/FixApar/FixApar";
import InfoApar from '../views/InfoApar/InfoApar';
import NotificationList from "../views/NotificationsList/NotificationList";



interface Notification {
  id: string
  id_user: string
  title: string
  message: string
  status_read: boolean
  notification_type: string
  timestamp: string
}

const DefaultLayout: React.FC = () => {
  const [notificationData, setNotificationData] = useState<Notification[]>([]);
  const token = localStorage.getItem('token');
  const { pathname } = useLocation();
  let contentComponent: React.ReactNode;

  
  const handleNotificationClick = async (notificationId: string) => {
    try {
      await fetch(`${domainApi}/api/v1/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAparDsata()
    } catch (error) {
      console.error('Error during API request:', error);
    }
  };

  const handleReadAllNotification = async () => {
    try {
      await fetch(`${domainApi}/api/v1/notifications`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchAparDsata()
      
    } catch (error) {
      console.error('Error during API request:', error);
    }
  };
  
  switch (true) {
    case pathname ===  "/dashboard":
    contentComponent = <DashboardContent />;
    break;
    case pathname === "/profile":
      contentComponent = <Profile />;
      break;
    case pathname === "/location":
      contentComponent = <ManageLocation />;
      break;
    case pathname === "/location/add":
      contentComponent = <AddLocation />;
      break;
    case pathname === "/account":
      contentComponent = <ManageAccount />;
      break;
    case pathname === "/account/add":
      contentComponent = <AddAccount />;
      break;
    case pathname.includes("/account/update/"):     
      contentComponent = <UpdateAccount />;
      break;
    case pathname === "/apar":
      contentComponent = <ManageApar />;
      break;
    case pathname === "/apar/add":
      contentComponent = <AddApar />;
      break;
    case pathname.includes("/apar/info/"):
      contentComponent = <InfoApar />;
      break;
    case pathname === "/inspection-6-monthly":
      contentComponent = <InspectionApar />;
      break;
    case pathname.includes("/inspection-6-monthly/add/"):
      contentComponent = <AddInspection6Monthly />;
      break;
    case pathname === "/inspection-1-monthly":
      contentComponent = <InspectionApar1Monthly />;
      break;
    case pathname.includes("/inspection-1-monthly/add/"):
      contentComponent = <AddInspection1Monthly />;
      break;
    case pathname === "/history":
      contentComponent = <HistoryList />;
      break;
    case pathname.includes("/history-6-monthly/edit/") :
      contentComponent = <UpdateInspection6Monthly />;
      break;
    case pathname.includes("/history-6-monthly/"):
      contentComponent = <HistoryInspection6Monthly />;
      break;
    case pathname.includes("/history-1-monthly/edit/"): 
      contentComponent = <UpdateInspection1Monthly />;
      break;
    case pathname.includes("/history-1-monthly/") :
      contentComponent = <HistoryInspection1Monthly />;
      break;
    case pathname === "/need-fix":
      contentComponent = <FixApar />;
      break;
    case pathname === "/notifications":
    contentComponent = <NotificationList notificationData={notificationData} handleNotificationClick={handleNotificationClick} handleReadAllNotification={handleReadAllNotification} />;
    break;
  }

  const fetchAparDsata = async () => {
    try {
      const response = await fetch(`${domainApi}/api/v1/notifications`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      if (response.ok) {
        const data = await response.json();
        setNotificationData(data.data);
      } else {
        console.error('Error fetching notifications data:', response.status);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  useEffect(() => {
    fetchAparDsata();
  }, []);
  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <AppHeader notificationData={notificationData.filter(notification => !notification.status_read)} handleNotificationClick={handleNotificationClick} />
          <div className="container-fluid" style={{ minHeight: "80vh" }}>
            {contentComponent}
          </div>
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;