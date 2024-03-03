import { Card } from 'react-bootstrap';
  
interface Notification {
    id: string
    id_user: string
    title: string
    message: string
    status_read: boolean
    notification_type: string
    timestamp: string
}

interface NotificationListProps {
    notificationData: Notification[];
    handleNotificationClick: (notificationId: string) => Promise<void>;
    handleReadAllNotification: () => Promise<void>;
  }

  const NotificationList: React.FC<NotificationListProps> = ({ notificationData, handleReadAllNotification, handleNotificationClick}) => {
  return (
    <div className='bg-light-subtle p-3 my-2' style={{ minHeight: "80vh" }}>
        <h1>Notifikasi</h1>
        <hr />
        <div className='row'>
            <div className='col-12 col-lg-2'>
                <button className='btn btn-primary' onClick={() => handleReadAllNotification()}>Tandai semua sudah dibaca</button>
            </div>
            <div className='col-12 col-lg-10'>
                <div className='row'>
                {notificationData.map((notification) => (
                    <div className='py-1 col-12 col-md-6' key={notification.id}>
                        <Card
                            border={notification.status_read ? "secondary" : "primary"}
                            className={notification.status_read ? 'fw-normal text-body-secondary' : 'fw-medium not-readed-notification'}
                            onClick={() => handleNotificationClick(notification.id)}
                        >
                        <Card.Body>
                            <Card.Title>{notification.title}</Card.Title>
                            <Card.Text>{notification.message}</Card.Text>
                            <p className="text-end text-dark m-0">{new Date(notification.timestamp).toLocaleDateString('id-ID', {day: 'numeric',month: 'long',year: 'numeric',})}</p>

                        </Card.Body>
                        </Card>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

export default NotificationList;