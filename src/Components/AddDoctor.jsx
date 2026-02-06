import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const AddDoctor = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    license: "",
  
    phone: "",
    specialityId: "",
    alias:"",
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
        Swal.fire({
          text: "No se pudo obtener la lista de especialidades",
          icon: "error",
          confirmButtonColor: "#3085d6"
        });
        setSpecialities([]);
      }
    };
    fetchSpecialities();
  }, [apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      fullName: formData.fullName.trim(),
      dni: formData.dni.trim(),
      license: formData.license.trim().toUpperCase(), // 2 letras + 1–6 dígitos
    
      phone: formData.phone.trim(), // + opcional, 7–15 dígitos
      specialityId: formData.specialityId,
       ...(formData.alias.trim() ? { alias: formData.alias.trim() } : {}), // ✅ nuevo (no envía si está vacío)
};
   

    try {
      const response = await fetch(`${apiUrl}/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        Swal.fire({
          title: "✅ Profesional creado",
          text: "El profesional fue agregado exitosamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
        }).then(() => navigate("/admin"));
      } else {
        let errorMessage = "Error al crear el profesional.";

    if (response.status === 409) {
      if (data.message?.toLowerCase().includes("matricula")) {
        errorMessage = "Ya existe un profesional con esa matrícula.";
      } else if (data.message?.toLowerCase().includes("dni")) {
        errorMessage = "Ya existe un profesional con ese DNI.";
      } else {
        errorMessage = data.message || "Conflicto: el profesional ya existe.";
      }
    } else if (response.status === 404) {
      errorMessage = data.message || "No se encontró la especialidad seleccionada.";
    } else {
      errorMessage = data.message || "Error desconocido del servidor.";
    }

    await Swal.fire({
      title: "⚠️ No se pudo crear el profesional",
      text: errorMessage,
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
  } catch {
    await Swal.fire({
      title: "❌ Error de conexión",
      text: "No se pudo conectar con el servidor.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
}

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
                  pattern="^(?:MP|MN)-?\d{1,6}$"
                  title="Formato válido: MP12, MP-12, MP000012 o MP-000012"
                />
                <Form.Text muted>
                 Ejemplos válidos: MP12, MP-12, MP000012. Se guardará como MP-000012.
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
    <Form.Group controlId="formAlias">
      <Form.Label>Alias</Form.Label>
      <Form.Control
        type="text"
        name="alias"
        value={formData.alias}
        onChange={handleChange}
      />
      <Form.Text muted>Opcional.</Form.Text>
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