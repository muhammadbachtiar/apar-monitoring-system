import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface Props {
show: boolean
onHide: () => void
onDelete: (e: { preventDefault: () => void }) => Promise<void>
infoData: {id: string, name: string}
}

function DeleteModal(props : Props) {
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Hapus Data !
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Apakah anda yakin ?</h4>
        <p>
          Anda akan menghapus data {props.infoData.name}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={props.onHide}>Batal</Button>
        <Button type="submit" onClick={props.onDelete} >Hapus</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteModal