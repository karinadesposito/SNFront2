import React, { useState, useEffect } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// --- Subcomponente para Turnos ---
const TurnosReport = () => {
  const [estado, setEstado] = useState("");                  // UI: minúsculas
  const [idDoctor, setIdDoctor] = useState("");              // guarda string desde <select>
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [patientDni, setPatientDni] = useState("");          // ✅ ahora DNI
  const [excludePast, setExcludePast] = useState(true);      // excluir pasados por defecto
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedReports, setSelectedReports] = useState(new Set());

  const estadosEnum = [
    "disponible",
    "confirmado",
    "cancelado",
    "eliminado",
    "ejecutado",
    "no_asistido",
    "no_reservado",
  ];

  const apiUrl = import.meta.env.VITE_API_URL;

  // util: hoy YYYY-MM-DD
  const todayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Carga doctores
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${apiUrl}/doctor`);
        const result = await response.json();
        if (result?.data && Array.isArray(result.data)) {
          setDoctors(result.data);
        } else if (Array.isArray(result)) {
          setDoctors(result);
        } else {
          console.error("Los datos de doctor no están en el formato esperado");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };
    fetchDoctors();
  }, [apiUrl]);

  // Helper: arma query params solo con valores presentes
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    // idDoctor debe viajar como número si existe
    if (idDoctor && !Number.isNaN(Number(idDoctor))) {
      params.set("idDoctor", String(Number(idDoctor)));
    }

    // DNI (8 dígitos, sin 0 inicial)
    if (patientDni) {
      params.set("patientDni", patientDni);
    }

    // Fechas
    let start = startDate;
    const end = endDate;

    // Excluir pasados por defecto: si no hay startDate, forzar hoy
    if (excludePast && !start) {
      start = todayStr();
    }
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);

    return params.toString();
  };

  const fetchReports = async () => {
    // Validación de rango de fechas
    if (startDate && endDate && startDate > endDate) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin.");
      return;
    }

    // Validación de DNI (8 dígitos, sin 0 inicial)
    const dniRegex = /^[1-9]\d{7}$/;
    if (patientDni && !dniRegex.test(patientDni)) {
      alert("El DNI debe tener 8 dígitos, sin puntos ni 0 inicial.");
      return;
    }

    const estadoApi = estado ? estado.toUpperCase() : ""; // backend espera MAYÚSCULAS
    const queryParams = buildQueryParams();

    const url = !estadoApi
      ? `${apiUrl}/schedules?${queryParams}`
      : `${apiUrl}/schedules/report/${estadoApi}?${queryParams}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      const result = await response.json();

      const arrayTurnos = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];

      // Filtro extra en front si excludePast
      let filtered = arrayTurnos;
      if (excludePast) {
        const hoy = todayStr();
        filtered = arrayTurnos.filter((t) => (t?.day ?? "") >= hoy);
      }

      setData(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReportSelection = (id) => {
    const updated = new Set(selectedReports);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedReports(updated);
  };

  const updateSelectedReports = async (nuevoEstado) => {
    if (selectedReports.size === 0) return;

    const errores = [];
    try {
      await Promise.all(
        Array.from(selectedReports).map(async (idSchedule) => {
          const body = {
            estado: nuevoEstado,
            ...(nuevoEstado === "ELIMINADO" && {
              deletionReason: "Turno eliminado por administración",
            }),
          };

          const response = await fetch(
            `${apiUrl}/schedules/${idSchedule}/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) {
            let errorMsg = `Turno ${idSchedule}: `;
            try {
              const error = await response.json();
              errorMsg += error?.message || JSON.stringify(error);
            } catch {
              errorMsg += "Error desconocido";
            }
            errores.push(errorMsg);
          }
        })
      );

      setSelectedReports(new Set());
      fetchReports();

      if (errores.length > 0) {
        alert(
          "Algunos turnos no pudieron actualizarse:\n\n" + errores.join("\n")
        );
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4 text-white">Reportes de Turnos</h2>

      <div className="adddoctor-frame">
        <form className="row g-3">
          <div className="col-md-3">
            <label htmlFor="estado" className="form-label">
              Estado
            </label>
            <select
              id="estado"
              className="form-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {estadosEnum.map((op) => (
                <option key={op} value={op}>
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="doctor" className="form-label">
              Doctor
            </label>
            <select
              id="doctor"
              className="form-select"
              value={idDoctor}
              onChange={(e) => setIdDoctor(e.target.value)}
            >
              <option value="">Seleccione un doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="startDate" className="form-label">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="startDate"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="endDate" className="form-label">
              Fecha de Fin
            </label>
            <input
              type="date"
              id="endDate"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="patientDni" className="form-label">
              Paciente (DNI)
            </label>
            <input
              type="text"
              id="patientDni"
              className="form-control"
              value={patientDni}
              onChange={(e) =>
                setPatientDni(e.target.value.replace(/\D+/g, ""))
              }
              placeholder="DNI sin puntos"
              inputMode="numeric"
              maxLength={8}
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <div className="form-check">
              <input
                id="excludePast"
                className="form-check-input"
                type="checkbox"
                checked={excludePast}
                onChange={(e) => setExcludePast(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="excludePast">
                Excluir turnos pasados
              </label>
            </div>
          </div>

          <div className="col-md-12 d-flex gap-2 justify-content-between">
            <button
              type="button"
              className="btn btn-warning"
              onClick={fetchReports}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Obtener Reportes"}
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => updateSelectedReports("EJECUTADO")}
                disabled={selectedReports.size === 0}
              >
                Pacientes confirmados
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => updateSelectedReports("ELIMINADO")}
                disabled={selectedReports.size === 0}
              >
                Eliminar Seleccionados
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="adddoctor-frame">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const newSelection = isChecked
                      ? new Set(data.map((turno) => turno.idSchedule))
                      : new Set();
                    setSelectedReports(newSelection);
                  }}
                  checked={selectedReports.size === data.length && data.length > 0}
                />
              </th>
              <th>Doctor</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Paciente</th>
              <th>Teléfono</th>
              {estado === "" && <th>Estado</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={estado === "" ? 7 : 6} className="text-center">
                  No hay turnos para mostrar.
                </td>
              </tr>
            ) : (
              data.map((turno) => (
                <tr key={turno.idSchedule}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReports.has(turno.idSchedule)}
                      onChange={() => toggleReportSelection(turno.idSchedule)}
                    />
                  </td>
                  <td>{turno.doctor?.fullName || "Sin asignar"}</td>
                  <td>{turno.day}</td>
                  <td>{(turno.startTime || turno.start_Time || "").slice(0, 5)}</td>
                  <td>{turno.patient?.fullName || "Sin asignar"}</td>
                  <td>{turno.patient?.phone || "Sin asignar"}</td>
                  {estado === "" && (
                    <td>{turno.estado || turno.state || "Sin estado"}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Subcomponente para Doctores ---
const DoctoresReport = () => {
  const [doctores, setDoctores] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctores = async () => {
      try {
        const response = await fetch(`${apiUrl}/doctor`);
        const result = await response.json();
        if (result?.data && Array.isArray(result.data)) {
          setDoctores(result.data);
        } else if (Array.isArray(result)) {
          setDoctores(result);
        } else {
          console.error("Los datos de doctor no están en el formato esperado");
        }
      } catch (error) {
        console.error("Error al obtener doctor:", error);
      }
    };
    fetchDoctores();
  }, [apiUrl]);

  return (
    <div>
      <h3 className="mb-3">Listado de Doctores</h3>
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Matrícula</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Especialidad</th>
              </tr>
            </thead>
            <tbody>
              {doctores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    No hay doctores para mostrar.
                  </td>
                </tr>
              ) : (
                doctores.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.fullName}</td>
                    <td>{doc.dni}</td>
                    <td>{doc.license}</td>
                    <td>{doc.email}</td>
                    <td>{doc.phone}</td>
                    <td>{doc.speciality?.name || "Sin asignar"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Componente principal con Tabs ---
const Reports = () => {
  const [key, setKey] = useState("turnos");

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4 text-white">Reportes</h2>
      <Tabs
        id="reports-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
        justify
      >
        <Tab eventKey="turnos" title="Turnos">
          <TurnosReport />
        </Tab>
        <Tab eventKey="doctores" title="Doctores">
          <DoctoresReport />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Reports;

