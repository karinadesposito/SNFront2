import React, { useState, useEffect } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

const TurnosReport = () => {
  const [estado, setEstado] = useState(""); // UI: minúsculas
  const [idDoctor, setIdDoctor] = useState(""); // guarda string desde <select>
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [patientDni, setPatientDni] = useState(""); // ✅ ahora DNI
  const [excludePast, setExcludePast] = useState(true); // excluir pasados por defecto
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedReports, setSelectedReports] = useState(new Set());

  // ====== NUEVO: edición en celda para monto cobrado ======
  const [editingId, setEditingId] = useState(null); // idSchedule en edición
  const [editingValue, setEditingValue] = useState(""); // string para el input
  const [savingMonto, setSavingMonto] = useState(false);

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

  const formatDateAR = (yyyyMmDd) => {
    if (!yyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return yyyyMmDd;
    const [y, m, d] = yyyyMmDd.split("-");
    return `${d}/${m}/${y}`;
  };

  // ====== NUEVO: helpers monto cobrado ======
  const getEstadoFila = (turno) => turno?.estado || turno?.state;

  const canEditMontoCobrado = (turno) =>
    getEstadoFila(turno) === "EJECUTADO" &&
    Number(turno?.vecesEditadoMontoCobrado ?? 0) < 2;

  const formatMoneyNoDecimals = (value) => {
    const n = Number(value ?? 0);
    const safe = Number.isFinite(n) ? Math.trunc(n) : 0;
    return safe.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const startEditMonto = (turno) => {
    if (!canEditMontoCobrado(turno)) return;
    setEditingId(turno.idSchedule);

    const current = Number(turno.montoCobrado ?? 0);
    const safe = Number.isFinite(current) ? String(Math.trunc(current)) : "0";
    setEditingValue(safe);
  };

  const cancelEditMonto = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveMontoCobrado = async (turno) => {
    if (!turno?.idSchedule) return;

    // Validación: entero >= 0
    if (editingValue === "" || editingValue == null) {
      Swal.fire({
        icon: "warning",
        title: "Monto inválido",
        text: "Ingresá un monto (0 si no cobró).",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const parsed = Number(editingValue);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      Swal.fire({
        icon: "warning",
        title: "Monto inválido",
        text: "El monto debe ser un número entero (sin decimales) y no puede ser negativo.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    try {
      setSavingMonto(true);

      const response = await fetch(`${apiUrl}/schedules/monto-cobrado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idSchedule: turno.idSchedule,
          montoCobrado: parsed,
        }),
      });

      if (!response.ok) {
        let msg = "No se pudo guardar el monto cobrado.";
        try {
          const err = await response.json();
          msg = err?.message || msg;
        } catch {}
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            typeof msg === "string"
              ? msg
              : "Error al guardar el monto cobrado.",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      const updated = await response.json();
      const updatedTurno = updated?.data ?? updated;

      // Actualiza el turno en memoria
      setData((prev) =>
        prev.map((t) =>
          t.idSchedule === turno.idSchedule
            ? {
                ...t,
                ...updatedTurno,
                montoCobrado:
                  updatedTurno?.montoCobrado ??
                  updatedTurno?.monto_cobrado ??
                  t.montoCobrado,
                vecesEditadoMontoCobrado:
                  updatedTurno?.vecesEditadoMontoCobrado ??
                  updatedTurno?.veces_editado_monto_cobrado ??
                  t.vecesEditadoMontoCobrado,
              }
            : t
        )
      );

      cancelEditMonto();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor para guardar el monto cobrado.",
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setSavingMonto(false);
    }
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
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Los datos de doctor no están en el formato esperado.",
            confirmButtonColor: "#0d6efd",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los doctores.",
          confirmButtonColor: "#0d6efd",
        });
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
    params.set("estado", "CONFIRMADO");
    params.set("startDate", todayStr());

    return params.toString(); 
  }

    let start = startDate;
  if (excludePast && !startDate) {
    start = todayStr();
  }

    if (start) params.set("startDate", start);
    if (endDate) params.set("endDate", endDate);

    return params.toString();
  };

  const fetchReports = async () => {
    // Validación de rango de fechas
    if (startDate && endDate && startDate > endDate) {
      Swal.fire({
        icon: "warning",
        title: "Rango de fechas inválido",
        text: "La fecha de inicio no puede ser mayor que la fecha de fin.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    // Validación de DNI (8 dígitos, sin 0 inicial)
    const dniRegex = /^[1-9]\d{7}$/;
    if (patientDni && !dniRegex.test(patientDni)) {
      Swal.fire({
        icon: "warning",
        title: "DNI inválido",
        text: "El DNI debe tener 8 dígitos, sin puntos ni 0 inicial.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const queryParams = buildQueryParams();
    const url = `${apiUrl}/schedules/report?${queryParams}`;

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
      cancelEditMonto();
    } catch (error) {
      setData([]);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudieron obtener los datos de los turnos.",
        confirmButtonColor: "#0d6efd",
      });
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
    if (selectedReports.size === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin selección",
        text: "Selecciona al menos un turno para actualizar.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "¿Confirmar acción?",
      text: `¿Deseas actualizar ${selectedReports.size} turno(s) a estado ${nuevoEstado}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
    });

    if (!confirmResult.isConfirmed) return;

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
        Swal.fire({
          icon: "warning",
          title: "Actualización parcial",
          html:
            "<b>Algunos turnos no pudieron actualizarse:</b><br><br>" +
            errores.join("<br>"),
          confirmButtonColor: "#0d6efd",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Actualización exitosa",
          text: "Los turnos fueron actualizados correctamente.",
          confirmButtonColor: "#0d6efd",
        });
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#0d6efd",
      });
    }
  };

  // ====== NUEVO: descargar rendición diaria (Excel) ======
  const canDownloadRendicion =
    !loading &&
    estado === "ejecutado" &&
    idDoctor &&
    startDate &&
    endDate &&
    startDate === endDate;

  const handleDescargarRendicion = async () => {
    // Validaciones claras (sin inventar flujos)
    if (estado !== "ejecutado") {
      Swal.fire({
        icon: "info",
        title: "Rendición diaria",
        text: "Para descargar la rendición, seleccioná estado EJECUTADO.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    if (!idDoctor) {
      Swal.fire({
        icon: "info",
        title: "Rendición diaria",
        text: "Seleccioná un doctor para descargar la rendición.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    if (!startDate || !endDate) {
      Swal.fire({
        icon: "info",
        title: "Rendición diaria",
        text: "Seleccioná un día (inicio y fin) para descargar la rendición.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    if (startDate !== endDate) {
      Swal.fire({
        icon: "info",
        title: "Rendición diaria",
        text: "La rendición se descarga por día. Elegí el mismo día en inicio y fin.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const day = startDate; // YYYY-MM-DD
    const numericDoctorId = Number(idDoctor);

    const url = `${apiUrl}/schedules/rendicion-diaria?idDoctor=${numericDoctorId}&day=${day}`;

    try {
      setLoading(true);

      const resp = await fetch(url);

      if (!resp.ok) {
        // Si no hay ejecutados: mensaje definido
        if (resp.status === 404) {
          let msg = "NO_EJECUTADOS";
          try {
            const err = await resp.json();
            msg = err?.message || msg;
          } catch {}

          if (msg === "NO_EJECUTADOS") {
            Swal.fire({
              icon: "info",
              title: "Sin pacientes",
              text: `El día ${formatDateAR(day)} no asistieron pacientes.`,
              confirmButtonColor: "#0d6efd",
            });
            return;
          }
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo descargar la rendición.",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      const blob = await resp.blob();
      const fileName = `rendicion_${day}_doctor_${numericDoctorId}.xlsx`;

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor para descargar la rendición.",
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setLoading(false);
    }
  };

  // ====== colSpan dinámico ======
  const totalCols = estado === "" ? 9 : 8;

  return (
    <div>
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
            {/* Izquierda: Obtener + Descargar rendición */}
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-warning"
                onClick={fetchReports}
                disabled={loading}
              >
                {loading ? "Cargando..." : "OBTENER REPORTE"}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDescargarRendicion}
              >
                DESCARGAR RENDICIÓN
              </button>
            </div>

            {/* Derecha: acciones masivas */}
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => updateSelectedReports("EJECUTADO")}
                disabled={selectedReports.size === 0}
              >
                ASISTIÓ
              </button>

              <button
                type="button"
                className="btn btn-info"
                onClick={() => updateSelectedReports("NO_ASISTIDO")}
                disabled={selectedReports.size === 0}
              >
                NO ASISTIÓ
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => updateSelectedReports("CANCELADO")}
                disabled={selectedReports.size === 0}
              >
                CANCELAR TURNO
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => updateSelectedReports("ELIMINADO")}
                disabled={selectedReports.size === 0}
              >
                ELIMINAR TURNO
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="turnos-table-wrapper">
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
                  checked={
                    selectedReports.size === data.length && data.length > 0
                  }
                />
              </th>
              <th>Doctor</th>
              <th>Fecha</th>
              <th>Hora Inicio</th>
              <th>Paciente</th>
              <th>Teléfono</th>
              <th>Obra Social</th>
              <th>Monto cobrado</th>
              {estado === "" && <th>Estado</th>}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="text-center">
                  No hay turnos para mostrar.
                </td>
              </tr>
            ) : (
              data.map((turno) => {
                const estadoFila = getEstadoFila(turno);
                const veces = Number(turno.vecesEditadoMontoCobrado ?? 0);

                const rowClass =
                  estadoFila === "EJECUTADO"
                    ? veces === 0
                      ? "turno-ejecutado-pendiente"
                      : "turno-ejecutado-ok"
                    : "";

                return (
                  <tr key={turno.idSchedule} className={rowClass}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedReports.has(turno.idSchedule)}
                        onChange={() => toggleReportSelection(turno.idSchedule)}
                      />
                    </td>

                    <td>{turno.doctor?.fullName || "Sin asignar"}</td>
                    <td>{turno.day}</td>
                    <td>
                      {(turno.startTime || turno.start_Time || "").slice(0, 5)}
                    </td>
                    <td>{turno.patient?.fullName || "Sin asignar"}</td>

                    <td>{turno.patient?.phone || "Sin asignar"}</td>

                    <td>{turno.coverage?.name || "—"}</td>

                    <td
                      style={{
                        cursor: canEditMontoCobrado(turno)
                          ? "pointer"
                          : "default",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => startEditMonto(turno)}
                    >
                      {editingId === turno.idSchedule ? (
                        <input
                          type="text"
                          value={editingValue}
                          inputMode="numeric"
                          className="form-control form-control-sm"
                          autoFocus
                          disabled={savingMonto}
                          onChange={(e) =>
                            setEditingValue(e.target.value.replace(/\D+/g, ""))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveMontoCobrado(turno);
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              cancelEditMonto();
                            }
                          }}
                          onBlur={() => {
                            cancelEditMonto();
                          }}
                          style={{ maxWidth: 120 }}
                        />
                      ) : (
                        <>
                          {formatMoneyNoDecimals(turno?.montoCobrado ?? 0)}{" "}
                          {canEditMontoCobrado(turno) && (
                            <span
                              title="Editar monto cobrado"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditMonto(turno);
                              }}
                              style={{ marginLeft: 6 }}
                            >
                              ✏️
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    {estado === "" && (
                      <td>{turno.estado || turno.state || "Sin estado"}</td>
                    )}
                  </tr>
                );
              })
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
  );
};

// --- Componente principal con Tabs ---
const Reports = () => {
  const [key, setKey] = useState("turnos");

  return (
    <Container className="reports-container">
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
