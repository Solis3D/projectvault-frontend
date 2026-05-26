import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const MyNavbar = function () {
  const location = useLocation();

  return (
    <Navbar expand="md" data-bs-theme="dark" className="pv-navbar border-bottom py-3">
      <Container fluid className="px-4 px-md-5">
        <Navbar.Brand as={Link} to="/" className="pv-brand">
          Project<span className="pv-accent">Vault</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="projectvault-navbar" />

        <Navbar.Collapse id="projectvault-navbar">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/gallery" className={location.pathname === "/gallery" ? "pv-nav-link active" : "pv-nav-link"}>
              Gallery
            </Nav.Link>
          </Nav>

          <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mt-3 mt-md-0">
            <Nav.Link as={Link} to="/login" className={location.pathname === "/login" ? "pv-nav-link active" : "pv-nav-link"}>
              Login
            </Nav.Link>

            <Button
              as={Link}
              to="/register"
              className={
                location.pathname === "/register" ? "pv-btn-primary active border-0 rounded-0 px-4 py-2" : "pv-btn-primary border-0 rounded-0 px-4 py-2"
              }
            >
              Register
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
