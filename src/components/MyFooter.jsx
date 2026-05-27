import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const MyFooter = function () {
  return (
    <footer className="pv-footer py-4 mt-5">
      <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <Link to="/" className="pv-brand">
          Project<span className="pv-accent">Vault</span>
        </Link>

        <div className="d-flex flex-wrap justify-content-center gap-4">
          <span className="pv-footer-link">About</span>
          <span className="pv-footer-link">Privacy Policy</span>
          <span className="pv-footer-link">Terms of Service</span>
          <span className="pv-footer-link">Contact</span>
        </div>

        <span className="pv-footer-copy">© 2026 ProjectVault</span>
      </Container>
    </footer>
  );
};

export default MyFooter;
