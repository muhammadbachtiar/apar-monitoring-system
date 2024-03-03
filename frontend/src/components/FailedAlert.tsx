import Alert from 'react-bootstrap/Alert';

interface Props {
    show: boolean
    setShow: (staticShow: boolean) => void
    message: string
    }
    

function FailedAlert(props : Props) {

  if (props.show) {
    return (
      <Alert variant="danger" onClose={() => props.setShow(false)} dismissible>
        <Alert.Heading>Failed</Alert.Heading>
        <p>
          {props.message}
        </p>
      </Alert>
    );
  }
}

export default FailedAlert;