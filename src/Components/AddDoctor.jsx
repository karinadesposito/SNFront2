import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    license: "",
    email: "",
    phone: "",
    specialityId: "",
  });

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/doctor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Doctor creado exitosamente");
        navigate("/admin");
      } else {
        const error = await response.json();
        alert("Error al crear doctor: " + (error.message || "Error desconocido"));
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center text-white mb-4">Agregar Profesional</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formFullName">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre completo"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formDni">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el DNI"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formLicense">
              <Form.Label>Matrícula</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la matrícula"
                name="license"
                value={formData.license}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formSpecialityId">
              <Form.Label>ID Especialidad</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el ID de especialidad"
                name="specialityId"
                value={formData.specialityId}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese el email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center">
          <Button variant="primary" type="submit">
            Crear Profesional
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddDoctor;