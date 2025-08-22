import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Container,
  Form,
  ListGroup,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const CalendarPatient = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [searchMode, setSearchMode] = useState("doctor");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${apiUrl}/schedules/bulk-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          scheduleDate: selectedDate.toISOString().slice(0, 10),
          doctorId: selectedDoctor,
          time: selectedSlot,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire("¡Turno confirmado!", "", "success");
        reset();
        setSelectedDate(null);
        setSelectedSlot(null);
      } else {
        throw new Error(result.message || "Error al reservar turno");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/doctor/basic`)
      .then((res) => res.json())
      .then((data) => setDoctors(data?.data || data));

    fetch(`${apiUrl}/speciality`)
      .then((res) => res.json())
      .then((data) => setSpecialities(data?.data || data));
  }, [apiUrl]);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetch(`${apiUrl}/schedules/available/by-doctor/${selectedDoctor}`)
      .then((res) => res.json())
      .then((data) => setAvailableDates(data));
  }, [selectedDoctor]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    const formatted = date.toISOString().slice(0, 10);
    const dayData = availableDates.find((item) => item.date === formatted);
    setSlots(dayData ? dayData.timeSlots : []);
  };

  const tileDisabled = ({ date }) => {
    const formatted = date.toISOString().slice(0, 10);
    return !availableDates.some((d) => d.date === formatted);
  };

  return (
    <Container className="calendar-container">
      <h2 className="calendar-title">Reservar Turno</h2>

      {/* Radios */}
      <Form className="mb-3">
        <Form.Check
          inline
          label="Buscar por médico"
          type="radio"
          id="by-doctor"
          checked={searchMode === "doctor"}
          onChange={() => setSearchMode("doctor")}
        />
        <Form.Check
          inline
          label="Buscar por especialidad"
          type="radio"
          id="by-speciality"
          checked={searchMode === "speciality"}
          onChange={() => setSearchMode("speciality")}
        />
      </Form>

      {/* Doctor Select */}
      {searchMode === "doctor" && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Seleccionar Médico</Form.Label>
              <Form.Select
                value={selectedDoctor || ""}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  setSelectedDate(null);
                  setAvailableDates([]);
                  setSlots([]);
                }}
              >
                <option value="">-- Seleccione --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fullName} - Matrícula {doc.license}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Especialidad y lista de doctores */}
      {searchMode === "speciality" && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Seleccionar Especialidad</Form.Label>
                <Form.Select
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                >
                  <option value="">-- Seleccione --</option>
                  {specialities.map((spec) => (
                    <option key={spec.id} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {selectedSpeciality && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profesionales disponibles</Form.Label>
                  <Form.Select
                    value={selectedDoctor || ""}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value);
                      setSelectedDate(null);
                      setAvailableDates([]);
                      setSlots([]);
                    }}
                  >
                    <option value="">-- Seleccione --</option>
                    {doctors
                      .filter((doc) => doc.speciality?.name === selectedSpeciality)
                      .map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fullName} - Matrícula {doc.license}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Calendario */}
      {selectedDoctor && (
        <Row className="mt-4">
          <Col md={6} className="mb-4 mb-md-0">
            <div className="d-flex justify-content-center">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileDisabled={tileDisabled}
              />
            </div>
          </Col>
          <Col md={6}>
            {selectedDate && (
              <div>
                <h5>Horarios para el {selectedDate.toLocaleDateString()}</h5>
                <ListGroup>
                  {slots.length > 0 ? (
                    slots.map((time, i) => (
                      <ListGroup.Item
                        key={i}
                        action
                        active={time === selectedSlot}
                        onClick={() => setSelectedSlot(time)}
                      >
                        {time}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No hay turnos disponibles.</ListGroup.Item>
                  )}
                </ListGroup>
              </div>
            )}
          </Col>
        </Row>
      )}

      {/* Formulario */}
      {selectedSlot && (
        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-light p-4 mt-4 rounded"
        >
          <h4>Datos del Paciente</h4>

          <Form.Group className="mb-3">
            <Form.Label>Nombre completo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Juan Pérez"
              {...register("fullName", { required: true })}
            />
            {errors.fullName && (
              <span className="text-danger">Este campo es obligatorio</span>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>DNI</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: 30111222"
              {...register("dni", { required: true })}
            />
            {errors.dni && (
              <span className="text-danger">Este campo es obligatorio</span>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ej: paciente@email.com"
              {...register("mail", { required: true })}
            />
            {errors.mail && (
              <span className="text-danger">Este campo es obligatorio</span>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: 2215555555"
              {...register("phone", { required: true })}
            />
            {errors.phone && (
              <span className="text-danger">Este campo es obligatorio</span>
            )}
          </Form.Group>

          <Button type="submit" variant="primary">
            Confirmar Turno
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default CalendarPatient;
