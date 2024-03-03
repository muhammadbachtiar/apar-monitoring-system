import React from 'react';
import { Container } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light py-3" >
      <Container className="my-auto">
        <div className="copyright text-center my-auto">
          <span>Copyright &copy; Sistem Informasi Manajemen APAR 2024</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
