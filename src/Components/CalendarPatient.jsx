import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { Container, Row, Col, Form, ListGroup, Modal } from "react-bootstrap";
import Select from "react-select";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import Swal from "sweetalert2";
// import ReCAPTCHA from "react-google-recaptcha"; // ⬅️ Comentado temporalmente

const selectStyles = {
  control: (base) => ({ ...base, borderRadius: 10 }),
  menu: (base) => ({ ...base, borderRadius: 10 }),
};

// YYYY-MM-DD local (sin toISOString para evitar desfase horario)
const toYMDLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Helper: formatea "YYYY-MM-DD" a "DD/MM/YYYY" SIN crear Date
const formatDayLocal = (dayStr) => {
  if (!dayStr) return "";
  const [y, m, d] = dayStr.split("-");
  return `${d}/${m}/${y}`;
};

const CalendarPatient = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // // ⚠️ Clave de sitio NO-Enterprise (consola normal de reCAPTCHA)
  // const recaptchaSiteKey =
  //   import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  //   "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // fallback SOLO dev
  // console.info("reCAPTCHA SITE KEY ►", recaptchaSiteKey);

  // // reCAPTCHA
  // const recaptchaRef = useRef(null);
  // const [captchaToken, setCaptchaToken] = useState(null);

  // // Handlers del captcha
  // const handleCaptchaChange = (token) => setCaptchaToken(token || null);
  // const handleCaptchaExpired = () => setCaptchaToken(null);

  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  const [searchMode, setSearchMode] = useState("doctor"); // "doctor" | "speciality"
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");

  const [availableDates, setAvailableDates] = useState([]);
  const availableDateSet = useMemo(() => {
    const s = new Set();
    for (const it of availableDates || []) if (it?.date) s.add(it.date);
    return s;
  }, [availableDates]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]); // [{ idSchedule, time:'HH:mm' }]
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [queuedSwal, setQueuedSwal] = useState(null); // si luego querés usar el flujo en onExited

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

  // ====== Form (con autocompletado por DNI) ======
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
    control,
  } = useForm();

  const dniRegex = /^[1-9]\d{7}$/; // 8 dígitos, sin 0 inicial
  const dniValue = useWatch({ control, name: "dni", defaultValue: "" });
  const [findingPatient, setFindingPatient] = useState(false);
  const [patientFound, setPatientFound] = useState(null);
  const dniAbortRef = useRef(null);
  const dniInputRef = useRef(null);

  // Foco al abrir el modal (DNI primero)
  useEffect(() => {
    if (showForm) {
      setTimeout(() => dniInputRef.current?.focus(), 50);
    }
  }, [showForm]);

  // Debounce búsqueda de paciente por DNI
  useEffect(() => {
    if (!dniValue || dniValue.length < 8 || !dniRegex.test(dniValue)) {
      setFindingPatient(false);
      setPatientFound(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setFindingPatient(true);
        setPatientFound(null);

        if (dniAbortRef.current) dniAbortRef.current.abort();
        const controller = new AbortController();
        dniAbortRef.current = controller;

        const res = await fetch(`${apiUrl}/patient/by-dni/${dniValue}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const json = await res.json();
          const payload = json?.data || json;
          if (payload) {
            setPatientFound(payload);
            setValue("fullName", payload.fullName || "");
            setValue("phone", payload.phone || "");
            setValue("email", payload.email || "");
            clearErrors(["fullName", "phone", "email"]);
          }
        } else if (res.status === 404) {
          setPatientFound(null);
        } else {
          setPatientFound(null);
        }
      } catch {
        setPatientFound(null);
      } finally {
        setFindingPatient(false);
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dniValue, apiUrl]);

  // ====== RESERVA ======
  const onSubmit = async (data) => {
    try {
      if (!selectedDoctor || !selectedDate || !selectedSlot) {
        Swal.fire({
          title: "⚠️ Faltan datos",
          text: "Seleccioná un profesional, una fecha y un horario antes de continuar.",
          icon: "info",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const dniClean = String(data.dni || "").replace(/\D+/g, "");
      if (!dniRegex.test(dniClean)) {
        setError("dni", { type: "manual", message: "DNI inválido (8 dígitos, sin 0 inicial)" });
        Swal.fire({
          title: "DNI inválido",
          text: "El DNI debe tener 8 dígitos numéricos sin ceros iniciales.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // // reCAPTCHA requerido
      // if (!captchaToken) {
      //   Swal.fire({
      //     title: "Verificación requerida",
      //     text: "Por favor completá el reCAPTCHA antes de confirmar el turno.",
      //     icon: "warning",
      //     confirmButtonColor: "#3085d6",
      //   });
      //   return;
      // }

      try {
        Swal.fire({
          title: "Procesando reserva...",
          text: "Por favor esperá unos segundos.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const payload = {
          idSchedule: selectedSlot.idSchedule,
          // recaptchaToken: captchaToken, // ⬅️ comentado temporalmente
          patient: {
            fullName: data.fullName,
            dni: dniClean,
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
        if (!response.ok) throw new Error(result?.message || "Error al reservar turno");

        Swal.close();

        const saved = result?.data || result;
        const doctorName = saved?.doctor?.fullName || "el profesional";
        const dayStr = saved?.day;
        const timeStr = (saved?.startTime || saved?.start_Time || "").slice(0, 5);
        Swal.fire({
          title: "✅ ¡Turno confirmado!",
          html: `
            <p><b>Profesional:</b> ${doctorName}</p>
            <p><b>Fecha:</b> ${dayStr}</p>
            <p><b>Hora:</b> ${timeStr}</p>
          `,
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
        });

        setSlots((prev) => prev.filter((t) => t.idSchedule !== selectedSlot.idSchedule));
        setSelectedSlot(null);
        setShowForm(false);
        reset();
        setFindingPatient(false);
        setPatientFound(null);
      } catch (error) {
        Swal.close();
        Swal.fire({
          title: "❌ Error al reservar turno",
          text: error.message || "Ocurrió un error inesperado. Intentalo nuevamente.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
        // // reset del captcha tras cada intento
        // recaptchaRef.current?.reset();
        // setCaptchaToken(null);

        if (selectedDoctor) {
          fetch(`${apiUrl}/schedules/available/by-doctor/${selectedDoctor}`)
            .then((res) => res.json())
            .then((data) => {
              const payload = data?.data || data;
              setAvailableDates(Array.isArray(payload) ? payload : []);
            })
            .catch(() => {});
        }
      }
    } catch (outerError) {
      console.error("Error inesperado en onSubmit:", outerError);
      Swal.fire({
        title: "❌ Error inesperado",
        text: "Ocurrió un error al procesar la reserva. Intentalo nuevamente.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Carga inicial de catálogos
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
        const payload = data?.data || data;
        setAvailableDates(Array.isArray(payload) ? payload : []);
      })
      .catch(() => setAvailableDates([]))
      .finally(() => setLoading(false));
  }, [selectedDoctor, apiUrl]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);

    const formatted = toYMDLocal(date);
    const dayData = availableDates.find((item) => item.date === formatted);
    if (!dayData) {
      setSlots([]);
      return;
    }

    /*fetch(
      `${apiUrl}/schedules/report/DISPONIBLE?idDoctor=${selectedDoctor}&startDate=${formatted}&endDate=${formatted}`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data || data;
        const slotsArr = Array.isArray(list)
          ? list.map((s) => ({
              idSchedule: s.idSchedule,
              time: (s.startTime || s.start_Time || "").slice(0, 5),
            }))
          : [];
        setSlots(slotsArr);
      })
      .catch(() => setSlots([]));
  };*/

  const params = new URLSearchParams({
  estado: "DISPONIBLE",
  idDoctor: selectedDoctor,
  startDate: formatted,
  endDate: formatted,
});

fetch(`${apiUrl}/schedules/report?${params.toString()}`)
  .then((res) => res.json())
  .then((data) => {
    const list = data?.data || [];
    const slotsArr = Array.isArray(list)
      ? list.map((s) => ({
          idSchedule: s.idSchedule,
          time: (s.startTime || s.start_Time || "").slice(0, 5),
        }))
      : [];
    setSlots(slotsArr);
  })
  .catch(() => setSlots([]));
};


  const tileDisabled = ({ date }) => {
    const formatted = toYMDLocal(date);
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

        <div className="form-panel">
          <Form className="mb-3" noValidate>
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
                    tileClassName={({ date, view }) =>
                      view === "month" && availableDateSet.has(toYMDLocal(date))
                        ? "has-slots"
                        : undefined
                    }
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
        </div>
      </Container>

      <Modal
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedSlot(null);
          // recaptchaRef.current?.reset();
          // setCaptchaToken(null);
        }}
        onExited={() => {
          if (queuedSwal) {
            const { doctorName, dayStr, timeStr } = queuedSwal;
            const fecha = formatDayLocal(dayStr);

            Swal.fire("¡Turno confirmado!", "", "success").then(() => {
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
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Row>
              <Col md={12} className="mb-3">
                <div className="text-muted small">
                  <strong>Médico:</strong>{" "}
                  {doctors?.length
                    ? doctors.find((d) => d.id === selectedDoctor)?.fullName || "—"
                    : selectedDoctor ?? "—"}
                </div>
              </Col>

              <Col md={12}>
                <h5 className="mb-3">Datos del Paciente</h5>
              </Col>

              {/* DNI */}
              <Col md={6} className="mb-3">
                <Form.Label>DNI</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    ref={dniInputRef}
                    autoFocus
                    type="text"
                    placeholder="Ej: 30111222"
                    inputMode="numeric"
                    maxLength={8}
                    {...register("dni", {
                      required: "El DNI es obligatorio",
                      onChange: (e) => {
                        const clean = e.target.value.replace(/\D+/g, "");
                        setValue("dni", clean, { shouldValidate: true });
                        if (clean.length < 8) setPatientFound(null);
                      },
                      validate: (v) =>
                        !v || dniRegex.test(v) || "Debe tener 8 dígitos (sin 0 inicial)",
                    })}
                  />
                  {findingPatient && (
                    <span className="small text-muted d-inline-flex align-items-center">
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                      />
                      Buscando…
                    </span>
                  )}
                  {!findingPatient && dniValue?.length === 8 && (
                    <span className={`badge ${patientFound ? "bg-success" : "bg-secondary"}`}>
                      {patientFound ? "Encontrado" : "No encontrado"}
                    </span>
                  )}
                </div>
                {errors.dni && (
                  <span className="text-danger small">{errors.dni.message}</span>
                )}
              </Col>

              {/* NOMBRE */}
              <Col md={6} className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  {...register("fullName", { required: "El nombre es obligatorio" })}
                />
                {errors.fullName && (
                  <span className="text-danger small">{errors.fullName.message}</span>
                )}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: 2215555555"
                  inputMode="tel"
                  {...register("phone", { required: "El teléfono es obligatorio" })}
                />
                {errors.phone && (
                  <span className="text-danger small">{errors.phone.message}</span>
                )}
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ej: paciente@email.com"
                  {...register("email", { required: "El correo es obligatorio" })}
                />
                {errors.email && (
                  <span className="text-danger small">{errors.email.message}</span>
                )}
              </Col>
            </Row>

            {/* reCAPTCHA — totalmente comentado
            <div className="mt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={recaptchaSiteKey}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
                onErrored={() => setCaptchaToken(null)}
              />
              {recaptchaSiteKey.includes("6LeIxAcT") && (
                <div className="text-muted small">Usando clave de prueba (solo dev).</div>
              )}
            </div>
            */}

            <div className="d-flex justify-content-end gap-2 mt-2">
              <button
                type="button"
                className="btn-admin sm"
                onClick={() => {
                  setShowForm(false);
                  setSelectedSlot(null);
                  // recaptchaRef.current?.reset();
                  // setCaptchaToken(null);
                }}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-admin sm"
                disabled={loading}
              >
                {loading ? "Confirmando..." : "Confirmar Turno"}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CalendarPatient;
