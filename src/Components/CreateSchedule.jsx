import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, InputGroup } from "react-bootstrap";

const diasCastellano = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const CreateSchedule = () => {
  const [formData, setFormData] = useState({
    idDoctor: "",
    daysOfWeek: [],
    startDate: "",
    numberOfWeeks: 1,
    interval: 30,
    timeRanges: [{ start: "", end: "" }],
  });

  const [doctors, setDoctors] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/doctor`)
      .then((res) => res.json())
      .then((data) => {
        const doctorList = data?.data || data;
        if (Array.isArray(doctorList)) {
          setDoctors(doctorList);
        } else {
          console.error("El formato de doctores no es el esperado", data);
        }
      })
      .catch(() => alert("No se pudieron cargar los doctores"));
  }, [apiUrl]);

  const handleCheckboxChange = (dayKey) => {
    const updated = formData.daysOfWeek.includes(dayKey)
      ? formData.daysOfWeek.filter((d) => d !== dayKey)
      : [...formData.daysOfWeek, dayKey];
    setFormData({ ...formData, daysOfWeek: updated });
  };

  const handleTimeRangeChange = (index, field, value) => {
    const updatedRanges = [...formData.timeRanges];
    updatedRanges[index][field] = value;
    setFormData({ ...formData, timeRanges: updatedRanges });
  };

  const addTimeRange = () => {
    setFormData((prev) => ({
      ...prev,
      timeRanges: [...prev.timeRanges, { start: "", end: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/schedules/bulk-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          idDoctor: parseInt(formData.idDoctor),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Agenda generada correctamente");
        setFormData({
          idDoctor: "",
          daysOfWeek: [],
          startDate: "",
          numberOfWeeks: 1,
          interval: 30,
          timeRanges: [{ start: "", end: "" }],
        });
      } else {
        console.error("Error al crear la agenda:", result);
        alert("Error: " + (result.message || "No se pudo crear la agenda"));
      }
    } catch (err) {
      console.error("Error de conexión con el servidor:", err);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center text-white mb-4">Crear Agenda de Turnos</h2>

      {/* Marco con borde degradado + interior blanco (estilo unificado) */}
      <div className="form-panel">
        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="idDoctor">
                <Form.Label>Seleccionar Doctor</Form.Label>
                <Form.Select
                  name="idDoctor"
                  value={formData.idDoctor}
                  onChange={(e) =>
                    setFormData({ ...formData, idDoctor: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccione un doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName} - Matrícula {doctor.license}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="startDate">
                <Form.Label>Fecha de Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="numberOfWeeks">
                <Form.Label>Cantidad de Semanas</Form.Label>
                <Form.Control
                  type="number"
                  name="numberOfWeeks"
                  min={1}
                  value={formData.numberOfWeeks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfWeeks: parseInt(e.target.value || "1", 10),
                    })
                  }
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="interval">
                <Form.Label>Duración del Turno (minutos)</Form.Label>
                <Form.Control
                  type="number"
                  name="interval"
                  min={5}
                  step={5}
                  value={formData.interval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interval: parseInt(e.target.value || "30", 10),
                    })
                  }
                />
                <Form.Text muted>
                  Si lo dejás vacío o menor a 5, el backend usará 30 minutos por
                  defecto.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Días de Atención</Form.Label>
            <div className="d-flex flex-wrap">
              {diasCastellano.map((dia) => (
                <Form.Check
                  key={dia.key}
                  type="checkbox"
                  label={dia.label}
                  checked={formData.daysOfWeek.includes(dia.key)}
                  onChange={() => handleCheckboxChange(dia.key)}
                  className="me-3"
                />
              ))}
            </div>
            <Form.Text muted>
              Se envían en inglés: monday…sunday (lo manejamos automáticamente).
            </Form.Text>
          </Form.Group>

          <Form.Label>Rangos Horarios</Form.Label>
          {formData.timeRanges.map((range, index) => (
            <Row className="mb-3" key={index}>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>Desde</InputGroup.Text>
                  <Form.Control
                    type="time"
                    value={range.start}
                    onChange={(e) =>
                      handleTimeRangeChange(index, "start", e.target.value)
                    }
                    required
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>Hasta</InputGroup.Text>
                  <Form.Control
                    type="time"
                    value={range.end}
                    onChange={(e) =>
                      handleTimeRangeChange(index, "end", e.target.value)
                    }
                    required
                  />
                </InputGroup>
              </Col>
            </Row>
          ))}

          <Button variant="secondary" onClick={addTimeRange} className="mb-3">
            Agregar otro rango horario
          </Button>

          <div className="text-center">
            <Button type="submit" className="btn-admin sm">
              Crear Agenda
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default CreateSchedule;

