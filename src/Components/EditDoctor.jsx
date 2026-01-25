import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const ProfesionalTable = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // selección múltiple (como Reports)
  const [selectedIds, setSelectedIds] = useState(new Set());
  const isAllSelected =
    selectedIds.size === doctors.length && doctors.length > 0;

  const apiUrl = import.meta.env.VITE_API_URL;

  // ====== Fetch ======
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${apiUrl}/doctor/all-with-deleted`);
      const data = await response.json();
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      result.sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" })
      );
      setDoctors(result);
      setSelectedIds(new Set()); // limpiar selección
    } catch {
      Swal.fire({
        title: "❌ Error",
        text: "No se pudieron obtener los profesionales.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setDoctors([]);
      setSelectedIds(new Set());
    }
  };

  const fetchSpecialities = async () => {
    try {
      const response = await fetch(`${apiUrl}/speciality`);
      const data = await response.json();
      setSpecialities(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      Swal.fire({
        title: "❌ Error",
        text: "No se pudieron cargar las especialidades.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setSpecialities([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecialities();
  }, []);

  // ====== Selección ======
  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (checked) => {
    if (checked) setSelectedIds(new Set(doctors.map((d) => d.id)));
    else setSelectedIds(new Set());
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ====== Editar ======
  const handleEdit = (doctor) => {
    if (!doctor) return;
    setSelectedDoctor({
      ...doctor,
      specialityId: doctor.speciality?.id ?? "",
      alias: doctor.alias ?? "",
    });
    setShowModal(true);
  };

  const handleEditSelected = () => {
    if (selectedIds.size !== 1) return;
    const id = [...selectedIds][0];
    const doc = doctors.find((d) => d.id === id);
    if (doc) handleEdit(doc);
  };

  const handleSave = async () => {
    try {
      if (!selectedDoctor || !selectedDoctor.id) {
        await Swal.fire({
          title: "⚠️ Error",
          text: "No se seleccionó un profesional válido.",
          icon: "warning",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const updatedDoctor = {
        fullName: selectedDoctor.fullName,
        license: selectedDoctor.license,
        phone: selectedDoctor.phone,
       
        specialityId: selectedDoctor.specialityId || null,
        alias: (selectedDoctor.alias ?? "").trim() || null, // ✅
      };

      const response = await fetch(`${apiUrl}/doctor/${selectedDoctor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDoctor),
      });

      if (response.ok) {
        await Swal.fire({
          title: "✅ Datos actualizados",
          text: "El profesional fue actualizado correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        setShowModal(false);
        fetchDoctors();
      } else {
        const err = await response.json().catch(() => ({}));
        await Swal.fire({
          title: "⚠️ Error al actualizar",
          text: err.message || "No se pudo actualizar el profesional.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch {
      Swal.fire({
        title: "❌ Error de conexión",
        text: "No se pudo conectar con el servidor.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ====== Eliminar / Restaurar (bulk como Reports) ======
  const apiDelete = async (id) => {
    const resp = await fetch(`${apiUrl}/doctor/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || "No se pudo eliminar el profesional.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const confirm = await Swal.fire({
      title: "¿Eliminar profesional(es)?",
      text: "Esta acción no podrá deshacerse.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    if (!confirm.isConfirmed) return;

    try {
      for (const id of selectedIds) await apiDelete(id);
      await Swal.fire({
        title: "✅ Eliminado(s)",
        text: "Se procesaron las eliminaciones.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      fetchDoctors();
      clearSelection();
    } catch (error) {
      Swal.fire({
        title: "⚠️ Error",
        text: error.message || "No se pudo eliminar.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const apiRestore = async (id) => {
    const resp = await fetch(`${apiUrl}/doctor/restore/${id}`, {
      method: "PATCH",
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || "No se pudo restaurar el profesional.");
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedIds.size === 0) return;

    const confirm = await Swal.fire({
      title: "¿Reactivar profesional(es)?",
      text: "Volverán a estar disponibles.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
    });
    if (!confirm.isConfirmed) return;

    try {
      for (const id of selectedIds) await apiRestore(id);
      await Swal.fire({
        title: "✅ Restaurado(s)",
        text: "Se procesaron las restauraciones.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      fetchDoctors();
      clearSelection();
    } catch (error) {
      Swal.fire({
        title: "⚠️ Error",
        text: error.message || "No se pudo restaurar.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div>
      <div className="card-body">
        <form className="row g-3">
          <div className="col-md-9 d-flex align-items-center">
            <span>
              Aquí podés <strong>actualizar</strong> los datos de los doctores o
              <strong> eliminar</strong> los seleccionados. Usá los checkboxes
              de la lista.
            </span>
          </div>

          <div className="col-md-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleEditSelected}
              disabled={selectedIds.size !== 1}
              title={selectedIds.size !== 1 ? "Seleccioná exactamente 1" : ""}
            >
              Editar
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              title={selectedIds.size === 0 ? "Seleccioná al menos 1" : ""}
            >
              Eliminar
            </button>
          </div>
        </form>

        {/* === Tabla === */}
        <table className="table table-hover mt-3">
          <thead className="table-light">
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Seleccionar todos"
                />
              </th>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Matrícula</th>
              <th>DNI</th>  
              <th>Teléfono</th>
              <th className="col-alias">Alias</th>
          
              <th style={{ width: 120 }}>Restaurar</th>
            </tr>
          </thead>

          <tbody>
            {doctors.length > 0 ? (
              doctors.map((doc) => {
                const checked = selectedIds.has(doc.id);
                const isDeleted = !!doc.deletedAt;
                return (
                  <tr
                    key={doc.id}
                    className={isDeleted ? "table-secondary" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(doc.id)}
                        aria-label={`Seleccionar ${doc.fullName}`}
                      />
                    </td>

                    <td>{doc.fullName}</td>
                    <td>{doc.speciality?.name || "-"}</td>
                    <td>{doc.license}</td>
                     <td>{doc.dni}</td>
                    <td>{doc.phone || "-"}</td>
                    <td className="col-alias">{doc.alias || "-"}</td>
                  
                    <td>
                      {isDeleted ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={async () => {
                            try {
                              await apiRestore(doc.id);
                              await Swal.fire({
                                title: "✅ Restaurado",
                                text: "El profesional fue reactivado correctamente.",
                                icon: "success",
                                confirmButtonColor: "#3085d6",
                              });
                              fetchDoctors();
                            } catch (error) {
                              Swal.fire({
                                title: "⚠️ Error",
                                text: error.message || "No se pudo restaurar.",
                                icon: "error",
                                confirmButtonColor: "#d33",
                              });
                            }
                          }}
                        >
                          Restaurar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  No hay profesionales cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === Modal Editar === */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Profesional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={selectedDoctor.fullName}
                  onChange={(e) =>
                    setSelectedDoctor({
                      ...selectedDoctor,
                      fullName: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Matrícula</Form.Label>
                <Form.Control
                  type="text"
                  name="license"
                  value={selectedDoctor.license}
                  onChange={(e) =>
                    setSelectedDoctor({
                      ...selectedDoctor,
                      license: e.target.value,
                    })
                  }
                />
              </Form.Group>

<Form.Group className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={selectedDoctor.dni}
                  onChange={(e) =>
                    setSelectedDoctor({
                      ...selectedDoctor,
                      dni: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={selectedDoctor.phone || ""}
                  onChange={(e) =>
                    setSelectedDoctor({
                      ...selectedDoctor,
                      phone: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                  type="text"
                  name="alias"
                  value={selectedDoctor.alias || ""}
                  onChange={(e) =>
                    setSelectedDoctor({
                      ...selectedDoctor,
                      alias: e.target.value,
                    })
                  }
                />
              </Form.Group>



              <Form.Group>
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  name="specialityId"
                  value={selectedDoctor.specialityId}
                  onChange={(e) =>
                    setSelectedDoctor({
                      ...selectedDoctor,
                      specialityId: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccione una especialidad</option>
                  {specialities.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </button>
          <button className="btn btn-success" onClick={handleSave}>
            Guardar cambios
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfesionalTable;