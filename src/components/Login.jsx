import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import useAuth from "../hooks/useAuth";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";

const Login = function () {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = function (event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async function (event) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!loginResponse.ok) {
        throw new Error("Email o password non validi.");
      }

      const loginData = await loginResponse.json();

      const userResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Impossibile recuperare il profilo utente!");
      }

      const userData = await userResponse.json();

      login(loginData.token, userData);
      navigate("/portfolio");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MyNavbar />

      <section className="pv-auth-page py-5">
        <Container className="py-md-5">
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={5}>
              <div className="pv-auth-panel p-4 p-md-5">
                <p className="pv-label mb-2">Welcome Back</p>
                <h1 className="mb-3">Login</h1>
                <p className="mb-4">Sign in to manage your portfolio and publish your projects</p>

                {error && (
                  <Alert variant="danger" className="rounded-0">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="artist@projectvault.com"
                      className="pv-form-control rounded-0"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="..."
                      className="pv-form-control rounded-0"
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="pv-btn-primary border-0 rounded-0 w-100 py-3" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>

                <p className="text-center mt-4 mb-0">
                  New to ProjectVault?{" "}
                  <Link to="/register" className="pv-inline-link">
                    Create an account
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <MyFooter />
    </>
  );
};

export default Login;
