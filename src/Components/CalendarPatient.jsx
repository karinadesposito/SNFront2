import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from "react-select";

const selectStyles = {
  control: (base) => ({ ...base, borderRadius: 10 }),
  menu: (base) => ({ ...base, borderRadius: 10 }),
};

// Helper: formatea "YYYY-MM-DD" a "DD/MM/YYYY" SIN crear Date (evita problema de zona)
const formatDayLocal = (dayStr /* "YYYY-MM-DD" */) => {
  if (!dayStr) return "";
  const [y, m, d] = dayStr.split("-");
  return `${d}/${m}/${y}`;
};

const CalendarPatient = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  const [searchMode, setSearchMode] = useState("doctor"); // "doctor" | "speciality"
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");

  // [{ date: 'YYYY-MM-DD', timeSlots: [{idSchedule, time}] }]
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // [{ idSchedule, time }]
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cola para abrir Swal después de cerrar el Modal (evita conflicto de foco/aria-hidden)
  const [queuedSwal, setQueuedSwal] = useState(null);

  // Ajuste de altura para panel de horarios
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

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ====== RESERVA ======
  const onSubmit = async (data) => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      Swal.fire(
        "Faltan datos",
        "Seleccioná profesional, día y horario",
        "info"
      );
      return;
    }

    // 🔔 Confirmación antes de enviar
    const result = await Swal.fire({
      title: "¿Confirmar turno?",
      html: `
      <strong>Fecha:</strong> ${selectedDate?.toLocaleDateString()} <br/>
      <strong>Hora:</strong> ${selectedSlot?.time ?? "—"} <br/>
      <strong>Médico:</strong> ${
        doctors.find((d) => d.id === selectedDoctor)?.fullName ?? "—"
      } <br/>
      <strong>Paciente:</strong> ${data.fullName} <br/>
      <strong>DNI:</strong> ${data.dni} <br/>
      <strong>Teléfono:</strong> ${data.phone} <br/>
      <strong>Email:</strong> ${data.email}
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reservar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const payload = {
        idSchedule: selectedSlot.idSchedule,
        patient: {
          fullName: data.fullName,
          dni: data.dni,
          phone: data.phone,
          email: data.email,
        },
      };

      const response = await fetch(`${apiUrl}/schedules/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.message || "Error al reservar turno");

      // Guardamos datos crudos para el 2º Swal (evita desfase por timezone)
      const doctorName = result?.schedule?.doctor?.fullName || "el profesional";
      const dayStr = result?.schedule?.day; // "YYYY-MM-DD"
      const timeStr = result?.schedule?.start_Time; // "HH:mm"
      setQueuedSwal({ doctorName, dayStr, timeStr });

      // Actualizamos UI y cerramos modal
      setSlots((prev) =>
        prev.filter((t) => t.idSchedule !== selectedSlot.idSchedule)
      );
      setSelectedSlot(null);
      setShowForm(false);
      reset();

      // Refrescar disponibilidad del médico
      fetch(`${apiUrl}/schedules/available/by-doctor/${selectedDoctor}`)
        .then((res) => res.json())
        .then((result) => {
          const schedules = result?.data?.schedules || [];
          setAvailableDates(schedules);
        })
        .catch(() => setAvailableDates([]))
        .finally(() => setLoading(false));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Error inesperado", "error");
      setLoading(false);
    }
  };

  // ====== ERRORES DE FORMULARIO ======
  const onError = (errors) => {
    const messages = Object.values(errors).map((err) => `- ${err.message}`);

    Swal.fire({
      icon: "error",
      title: "Errores en el formulario",
      html: messages.join("<br/>"),
      confirmButtonText: "OK",
    });
  };
  // Carga inicial
  useEffect(() => {
    fetch(`${apiUrl}/doctor`)
      .then((res) => res.json())
      .then((data) => setDoctors(data?.data || data))
      .catch(() => setDoctors([]));

    fetch(`${apiUrl}/speciality`)
      .then((res) => res.json())
      .then((data) => setSpecialities(data?.data || data))
      .catch(() => setSpecialities([]));
  }, [apiUrl]);

  // Cargar agenda disponible por médico
  useEffect(() => {
    if (!selectedDoctor) return;
    setSelectedDate(null);
    setSlots([]);
    setAvailableDates([]);
    setLoading(true);
    fetch(`${apiUrl}/schedules/available/by-doctor/${selectedDoctor}`)
      .then((res) => res.json())
      .then((data) => {
        // Normalizamos: puede venir en data.data.schedules o directamente en data (por back distintos handlers)
        const schedules =
          // caso estándar: { message, data: { doctor, schedules: [...] }, statusCode }
          data?.data?.schedules ??
          // en caso raro: { doctor, schedules: [...] }
          data?.schedules ??
          // o si el backend ya devolvió directamente un array (compatibilidad)
          (Array.isArray(data) ? data : []);

        setAvailableDates(schedules);
      })
      .catch((err) => {
        console.error("Error al cargar disponibilidad:", err);
        setAvailableDates([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDoctor, apiUrl]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);

    const formatted = date.toISOString().slice(0, 10);
    const dayData = availableDates.find((item) => item.date === formatted);

    // Ya esperamos objetos con idSchedule y time
    const slotsArr = dayData?.timeSlots ?? [];
    setSlots(slotsArr);
  };

  const tileDisabled = ({ date }) => {
    const formatted = date.toISOString().slice(0, 10);
    return !availableDates.some((d) => d.date === formatted);
  };

  // Selects
  const doctorOptions = useMemo(
    () =>
      (doctors || []).map((doc) => ({
        value: doc.id,
        label: `${doc.fullName} - Matrícula ${doc.license}`,
        speciality: doc.speciality?.name || "",
      })),
    [doctors]
  );

  const specialityOptions = useMemo(
    () => (specialities || []).map((s) => ({ value: s.name, label: s.name })),
    [specialities]
  );

  const filteredDoctorOptions = useMemo(
    () =>
      selectedSpeciality
        ? doctorOptions.filter((d) => d.speciality === selectedSpeciality)
        : doctorOptions,
    [doctorOptions, selectedSpeciality]
  );

  const selectedDoctorOption =
    doctorOptions.find((o) => o.value === selectedDoctor) || null;

  const selectedSpecialityOption =
    specialityOptions.find((o) => o.value === selectedSpeciality) || null;

  return (
    <>
      <Container fluid="xl" className="calendar-container">
        <h2 className="calendar-title">Reservar Turno</h2>

        <Form className="mb-3">
          <Form.Check
            inline
            label="Buscar por médico"
            type="radio"
            id="by-doctor"
            checked={searchMode === "doctor"}
            onChange={() => {
              setSearchMode("doctor");
              setSelectedSpeciality("");
              setSelectedDoctor(null);
              setSelectedDate(null);
              setAvailableDates([]);
              setSlots([]);
            }}
          />
          <Form.Check
            inline
            label="Buscar por especialidad"
            type="radio"
            id="by-speciality"
            checked={searchMode === "speciality"}
            onChange={() => {
              setSearchMode("speciality");
              setSelectedDoctor(null);
              setSelectedDate(null);
              setAvailableDates([]);
              setSlots([]);
            }}
          />
        </Form>

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
                    setSelectedSpeciality("");
                    setSelectedDate(null);
                    setAvailableDates([]);
                    setSlots([]);
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

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
                      value={
                        filteredDoctorOptions.find(
                          (o) => o.value === selectedDoctor
                        ) || null
                      }
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

        {selectedDoctor && (
          <Row className="mt-4 align-items-stretch">
            <Col md={6} className="mb-4 mb-md-0">
              <div className="d-flex justify-content-center" ref={calWrapRef}>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileDisabled={tileDisabled}
                />
              </div>
              {loading && (
                <div className="mt-2 small text-muted">
                  Cargando disponibilidad…
                </div>
              )}
            </Col>

            <Col md={6}>
              {selectedDate && (
                <div
                  className="slots-panel d-flex flex-column"
                  style={{ height: calHeight || "auto" }}
                >
                  <h5 className="mb-3">
                    Horarios para el {selectedDate.toLocaleDateString()}
                  </h5>

                  <ListGroup className="slot-grid">
                    {slots.length > 0 ? (
                      slots.map((slot) => (
                        <ListGroup.Item
                          key={slot.idSchedule}
                          action
                          active={selectedSlot?.idSchedule === slot.idSchedule}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowForm(true);
                          }}
                        >
                          {slot.time}
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>
                        No hay turnos disponibles.
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </div>
              )}
            </Col>
          </Row>
        )}
      </Container>

      <Modal
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedSlot(null);
        }}
        onExited={() => {
          if (queuedSwal) {
            const { doctorName, dayStr, timeStr } = queuedSwal;
            const fecha = formatDayLocal(dayStr);

            // 1) Swal simple (como estaba antes)
            Swal.fire("¡Turno confirmado!", "", "success").then(() => {
              // 2) Detalle con doctor + fecha + hora (sin desfase)
              Swal.fire({
                icon: "info",
                title: "Detalle del turno",
                html: `Con <b>${doctorName}</b> el <b>${fecha}</b> a las <b>${timeStr}</b>`,
                timer: 6000,
                showConfirmButton: false,
                timerProgressBar: true,
              });
            });

            setQueuedSwal(null);
          }
        }}
        enforceFocus={false}
        restoreFocus={false}
        centered
        size="lg"
        backdrop
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirmar turno — {selectedDate?.toLocaleDateString()}{" "}
            {selectedSlot ? `• ${selectedSlot.time}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit, onError)}>
            <Row>
              <Col md={12} className="mb-3">
                <div className="text-muted small">
                  <strong>Médico:</strong>{" "}
                  {doctors?.length
                    ? doctors.find((d) => d.id === selectedDoctor)?.fullName ||
                      "—"
                    : selectedDoctor ?? "—"}
                </div>
              </Col>

              <Col md={12}>
                <h5 className="mb-3">Datos del Paciente</h5>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  {...register("fullName", {
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 3,
                      message: "Debe tener al menos 3 caracteres",
                    },
                    maxLength: {
                      value: 30,
                      message: "No puede superar los 30 caracteres",
                    },
                  })}
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: 30111222"
                  {...register("dni", {
                    required: "El DNI es obligatorio",
                    pattern: {
                      value: /^[1-9]\d{7}$/,
                      message:
                        "El DNI debe tener 8 dígitos sin ceros iniciales",
                    },
                  })}
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: 2215555555"
                  {...register("phone", {
                    required: "El teléfono es obligatorio",
                    pattern: {
                      value: /^[1-9]\d{9}$/,
                      message:
                        "El teléfono debe tener 10 dígitos sin 0 inicial ni guiones",
                    },
                  })}
                />
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ej: paciente@email.com"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Debe ser un correo válido",
                    },
                  })}
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedSlot(null);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Confirmando..." : "Confirmar Turno"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CalendarPatient;
