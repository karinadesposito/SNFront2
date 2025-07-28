import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Container,
  Form,
  ListGroup,
  Row,
  Col,
} from "react-bootstrap";

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
    const formatted = date.toISOString().slice(0, 10);
    const dayData = availableDates.find((item) => item.date === formatted);
    setSlots(dayData ? dayData.timeSlots : []);
  };

  const tileDisabled = ({ date }) => {
    const formatted = date.toISOString().slice(0, 10);
    return !availableDates.some((d) => d.date === formatted);
  };

  return (
    <Container className="my-4">
      <h2 className="text-center text-white">Reservar Turno</h2>

      <Form className="text-white mb-3">
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

      {searchMode === "doctor" && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-white">Seleccionar Médico</Form.Label>
              <Form.Select
                value={selectedDoctor || ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  setSelectedDoctor(selected);
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

      {searchMode === "speciality" && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-white">Seleccionar Especialidad</Form.Label>
                <Form.Select
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                >
                  <option value="">-- Seleccione --</option>
                  {specialities.map((spec) => (
                    <option key={spec.id} value={spec.name}>{spec.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {selectedSpeciality && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">Profesionales disponibles</Form.Label>
                  <Form.Select
                    value={selectedDoctor || ""}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setSelectedDoctor(selected);
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

      {selectedDoctor && (
        <>
          <div className="d-flex justify-content-center">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileDisabled={tileDisabled}
            />
          </div>

          {selectedDate && (
            <div className="mt-4">
              <h5 className="text-white">
                Horarios para el {selectedDate.toLocaleDateString()}
              </h5>
              <ListGroup>
                {slots.length > 0 ? (
                  slots.map((time, i) => <ListGroup.Item key={i}>{time}</ListGroup.Item>)
                ) : (
                  <ListGroup.Item>No hay turnos disponibles.</ListGroup.Item>
                )}
              </ListGroup>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default CalendarPatient;

