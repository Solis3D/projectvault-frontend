import { LogOut } from "lucide-react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const MyNavbar = function () {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const handleLogout = function () {
    logout();
    navigate("/");
  };

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

            {isAuthenticated && (
              <Nav.Link as={Link} to="/portfolio" className={location.pathname === "/portfolio" ? "pv-nav-link active" : "pv-nav-link"}>
                My Portfolio
              </Nav.Link>
            )}

            {currentUser?.role === "ADMIN" && (
              <Nav.Link as={Link} to="/admin" className={location.pathname === "/admin" ? "pv-nav-link active" : "pv-nav-link"}>
                Admin
              </Nav.Link>
            )}
          </Nav>

          <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mt-3 mt-md-0">
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <>
                <span className="pv-navbar-user">{currentUser?.username}</span>

                <Button type="button" className="pv-btn-secondary rounded-0 px-3 py-2" onClick={handleLogout}>
                  <LogOut size={17} className="me-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
