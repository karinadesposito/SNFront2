import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col, Form, Button, ListGroup, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from "react-select";

const teal = "#06475B";

const selectStyles = { /* ... (tus estilos de react-select de antes) ... */ };

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

  // NEW: controla el modal
  const [showForm, setShowForm] = useState(false);

  // === Altura sincronizada con el calendario
  const calWrapRef = useRef(null);
  const [calHeight, setCalHeight] = useState(0);
  useLayoutEffect(() => {
    const el = calWrapRef.current?.querySelector(".react-calendar");
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry?.contentRect?.height || el.getBoundingClientRect().height;
      setCalHeight(h);
    });
    ro.observe(el);
    setCalHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [selectedDoctor, selectedDate, availableDates]);

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
        setShowForm(false); // cerrar modal al confirmar
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

    // Dedup + orden
    const raw = (dayData?.timeSlots ?? []).map((s) => String(s).trim());
    const unique = Array.from(new Set(raw));
    const sorted = unique.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    setSlots(sorted);
  };

  const tileDisabled = ({ date }) => {
    const formatted = date.toISOString().slice(0, 10);
    return !availableDates.some((d) => d.date === formatted);
  };

  // react-select options (igual que antes)
  const doctorOptions = useMemo(
    () => doctors.map((doc) => ({
      value: doc.id,
      label: `${doc.fullName} - Matrícula ${doc.license}`,
      speciality: doc.speciality?.name || "",
    })), [doctors]
  );
  const specialityOptions = useMemo(
    () => specialities.map((s) => ({ value: s.name, label: s.name })), [specialities]
  );
  const filteredDoctorOptions = useMemo(
    () => selectedSpeciality
      ? doctorOptions.filter((d) => d.speciality === selectedSpeciality)
      : doctorOptions,
    [doctorOptions, selectedSpeciality]
  );

  const selectedDoctorOption = doctorOptions.find((o) => o.value === selectedDoctor) || null;
  const selectedSpecialityOption = specialityOptions.find((o) => o.value === selectedSpeciality) || null;

  return (
    <>
      <Container fluid="xl" className="calendar-container">
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

        {/* Buscar por MÉDICO */}
        {searchMode === "doctor" && (
          <Row className="mb-3 select-panel">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Seleccionar Médico</Form.Label>
                <Select
                  classNamePrefix="doc"
                  styles={selectStyles}
                  isClearable
                  placeholder="-- Seleccione --"
                  options={doctorOptions}
                  value={selectedDoctorOption}
                  onChange={(opt) => {
                    setSelectedDoctor(opt?.value ?? null);
                    setSelectedDate(null);
                    setAvailableDates([]);
                    setSlots([]);
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Buscar por ESPECIALIDAD */}
        {searchMode === "speciality" && (
          <>
            <Row className="mb-3 select-panel">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Seleccionar Especialidad</Form.Label>
                  <Select
                    classNamePrefix="doc"
                    styles={selectStyles}
                    isClearable
                    placeholder="-- Seleccione --"
                    options={specialityOptions}
                    value={selectedSpecialityOption}
                    onChange={(opt) => {
                      setSelectedSpeciality(opt?.value ?? "");
                      setSelectedDoctor(null);
                      setSelectedDate(null);
                      setAvailableDates([]);
                      setSlots([]);
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {selectedSpeciality && (
              <Row className="mb-3 select-panel">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Profesionales disponibles</Form.Label>
                    <Select
                      classNamePrefix="doc"
                      styles={selectStyles}
                      isClearable
                      placeholder="-- Seleccione --"
                      options={filteredDoctorOptions}
                      value={filteredDoctorOptions.find((o) => o.value === selectedDoctor) || null}
                      onChange={(opt) => {
                        setSelectedDoctor(opt?.value ?? null);
                        setSelectedDate(null);
                        setAvailableDates([]);
                        setSlots([]);
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Calendario + Horarios */}
        {selectedDoctor && (
          <Row className="mt-4 align-items-stretch">
            {/* Calendario */}
            <Col md={6} className="mb-4 mb-md-0">
              <div className="d-flex justify-content-center" ref={calWrapRef}>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileDisabled={tileDisabled}
                />
              </div>
            </Col>

            {/* Horarios */}
            <Col md={6}>
              {selectedDate && (
                <div className="slots-panel d-flex flex-column" style={{ height: calHeight || "auto" }}>
                  <h5 className="mb-3">
                    Horarios para el {selectedDate.toLocaleDateString()}
                  </h5>

                  <ListGroup className="list-group slot-grid flex-grow-1">
                    {slots.length > 0 ? (
                      slots.map((time, i) => (
                        <ListGroup.Item
                          key={i}
                          action
                          active={time === selectedSlot}
                          onClick={() => { setSelectedSlot(time); setShowForm(true); }}  // ⬅️ abre modal
                          className="slot-item"
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
      </Container>

      {/* ===== MODAL FORM ===== */}
      <Modal
        show={showForm}
        onHide={() => { setShowForm(false); setSelectedSlot(null); }}
        centered
        size="lg"
        backdrop
        backdropClassName="blurred-backdrop"      // ⬅️ desenfoque/oscurecido
        contentClassName="glass-modal"            // ⬅️ estilo del cuadro
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirmar turno — {selectedDate?.toLocaleDateString()} {selectedSlot ? `• ${selectedSlot}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={12} className="mb-3">
                <div className="text-muted small">
                  <strong>Médico:</strong>{" "}
                  {doctorOptions.find((d) => d.value === selectedDoctor)?.label || "—"}
                </div>
              </Col>
              <Col md={12}><h5 className="mb-3">Datos del Paciente</h5></Col>

              <Col md={12} className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  {...register("fullName", { required: true })}
                />
                {errors.fullName && <span className="text-danger">Este campo es obligatorio</span>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: 30111222"
                  {...register("dni", { required: true })}
                />
                {errors.dni && <span className="text-danger">Este campo es obligatorio</span>}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: 2215555555"
                  {...register("phone", { required: true })}
                />
                {errors.phone && <span className="text-danger">Este campo es obligatorio</span>}
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ej: paciente@email.com"
                  {...register("mail", { required: true })}
                />
                {errors.mail && <span className="text-danger">Este campo es obligatorio</span>}
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="outline-secondary" onClick={() => { setShowForm(false); setSelectedSlot(null); }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Confirmar Turno
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CalendarPatient;


