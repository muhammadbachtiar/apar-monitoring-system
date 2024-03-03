import Alert from 'react-bootstrap/Alert';

interface Props {
    show: boolean
    setShow: (showStatus:boolean) => void
    message: string
    }
    

function SuccessAlert(props : Props) {

  if (props.show) {
    return (
      <Alert variant="success" onClose={() => props.setShow(false)} dismissible>
        <Alert.Heading>Success</Alert.Heading>
        <p>
          {props.message}
        </p>
      </Alert>
    );
  }
}

export default SuccessAlert;