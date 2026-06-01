import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import MyFooter from "./MyFooter";
import MyNavbar from "./MyNavbar";

const Register = function () {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = function (event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setFieldErrors({
      ...fieldErrors,
      [name]: "",
    });
  };

  const getFieldFromError = function (errorMessage) {
    const message = errorMessage.toLowerCase();

    if (message.includes("password")) return "password";
    if (message.includes("email")) return "email";
    if (message.includes("username")) return "username";
    if (message.includes("nome")) return "firstName";
    if (message.includes("cognome")) return "lastName";

    return null;
  };

  const handleSubmit = async function (event) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");
      setFieldErrors({});

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.errors) {
          const newFieldErrors = {};

          errorData.errors.forEach((errorMessage) => {
            const field = getFieldFromError(errorMessage);

            if (field) {
              newFieldErrors[field] = errorMessage;
            }
          });

          setFieldErrors(newFieldErrors);
          throw new Error(errorData.errors.join(" "));
        }

        throw new Error(errorData.message || "Registrazione non riuscita. Controlla i dati inseriti!");
      }

      setSuccessMessage("Account created successfully. You can now sign in!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
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
            <Col xs={12} md={10} lg={7}>
              <div className="pv-auth-panel p-4 p-md-5">
                <p className="pv-label mb-2">Join ProjectVault</p>
                <h1 className="mb-3">Create Account</h1>
                <p className="mb-4">Start building your digital art portfolio and organize your creative workflow.</p>

                {error && (
                  <Alert variant="danger" className="rounded-0">
                    {error}
                  </Alert>
                )}

                {successMessage && (
                  <Alert variant="success" className="rounded-0">
                    {successMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerFirstName">
                        <Form.Label>First name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Ugo"
                          className="pv-form-control rounded-0"
                          isInvalid={Boolean(fieldErrors.firstName)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{fieldErrors.firstName}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="registerLastName">
                        <Form.Label>Last name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Sacco"
                          className="pv-form-control rounded-0"
                          isInvalid={Boolean(fieldErrors.lastName)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{fieldErrors.lastName}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="registerUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="ugo.sacco"
                      className="pv-form-control rounded-0"
                      isInvalid={Boolean(fieldErrors.username)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.username}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="registerEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="artist@projectvault.com"
                      className="pv-form-control rounded-0"
                      isInvalid={Boolean(fieldErrors.email)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="registerPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 chars, upper, number, special"
                      className="pv-form-control rounded-0"
                      isInvalid={Boolean(fieldErrors.password)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
                  </Form.Group>

                  <Button type="submit" className="pv-btn-primary border-0 rounded-0 w-100 py-3" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Form>

                <p className="text-center mt-4 mb-0">
                  Already have an account?{" "}
                  <Link to="/login" className="pv-inline-link">
                    Sign in
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

export default Register;
