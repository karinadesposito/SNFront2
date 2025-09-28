import React, { useState, useEffect } from "react";
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

  const [specialities, setSpecialities] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const response = await fetch(`${apiUrl}/speciality`);
        const data = await response.json();
        setSpecialities(Array.isArray(data) ? data : (data?.data ?? []));
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
        setSpecialities([]);
      }
    };
    fetchSpecialities();
  }, [apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Dejo al usuario escribir libre; normalizo en el submit
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      fullName: formData.fullName.trim(),
      dni: formData.dni.trim(),
      license: formData.license.trim().toUpperCase(), // 2 letras + 1–6 dígitos
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(), // + opcional, 7–15 dígitos
      specialityId: formData.specialityId,
    };

    try {
      const response = await fetch(`${apiUrl}/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Profesional creado exitosamente");
        navigate("/admin");
      } else {
        const error = await response.json().catch(() => ({}));
        const msg = Array.isArray(error?.message)
          ? error.message.join(" | ")
          : error?.message || "Error desconocido";
        alert("Error al crear profesional: " + msg);
      }
    } catch {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center text-white mb-4">Agregar Profesional</h2>

      {/* Marco con borde degradado + interior blanco */}
      <div className="adddoctor-frame">
        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formFullName">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
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
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
                <Form.Text muted>Solo números, sin puntos ni espacios.</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formLicense">
                <Form.Label>Matrícula</Form.Label>
                <Form.Control
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  required
                  // 2 letras (MP/MN mayús. o minús.) + 1–6 dígitos, sin espacios ni guiones
                  pattern="^(?:[Mm][Pp]|[Mm][Nn])\d{1,6}$"
                  title="Use 2 letras (MP o MN) seguidas de 1 a 6 números, sin espacios ni guiones."
                />
                <Form.Text muted>
                  Formato: 2 letras (MP o MN) + 1–6 dígitos, sin espacios ni guiones.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formSpeciality">
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  name="specialityId"
                  value={formData.specialityId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una especialidad</option>
                  {(specialities ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPhone">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  // + opcional al inicio, 7–15 dígitos
                  pattern="^\+?\d{7,15}$"
                  title="Solo números, con + opcional al inicio, entre 7 y 15 dígitos."
                />
                <Form.Text muted>
                  Solo números (con + opcional al inicio), 7–15 dígitos.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

       <div className="text-center">
  <Button type="submit" bsPrefix="btn-admin" className="sm">
    Crear Profesional
  </Button>
</div>

        </Form>
      </div>
    </Container>
  );
};

export default AddDoctor;
