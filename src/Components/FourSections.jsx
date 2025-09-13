// src/Components/FourSections.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import medicosGrupo from "../assets/medicos.jpg"; // <-- tu nombre real

export default function FourSections() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch(`${apiUrl}/speciality`)
      .then((r) => r.json())
      .then((d) => setSpecialties(d?.data || d || []))
      .catch(() => setSpecialties([]));

    fetch(`${apiUrl}/doctor/basic`)
      .then((r) => r.json())
      .then((d) => setDoctors(d?.data || d || []))
      .catch(() => setDoctors([]));
  }, [apiUrl]);

  // Navegación opcional al calendario filtrado por médico (si luego querés activarlo):
  const goToDoctor = (doctorId) => {
    // SUGERENCIA: cuando quieras, hacé que CalendarPatient lea ?doctorId=...
    // navigate(`/reservar-turno?doctorId=${doctorId}`);
    navigate(`/reservar-turno`);
  };

  return (
    <>
      {/* HERO ======================================================= */}
      <section
        id="home"
        className="home-bg"
        style={{ "--home-bg": "url(/JuarezSaludFachada.png)" }}
      >
        <div className="container home-wrap">
          <div className="row justify-content-start">
            <div className="col-12 col-lg-8">
              <h1 className="display-5 text-white fw-bold mb-2">
                Bienvenidos a Salud Net
              </h1>
              <p className="lead text-white-50 mb-0">
                Profesionales de la Salud en Benito Juárez
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ESPECIALIDADES (con fondo contrastado) ===================== */}
    <section id="especialidades" className="py-5 section-contrast">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h4 m-0">Especialidades</h2>
           <Link to="/reservar-turno" className="btn btn-sm btn-ghost-reserva">
              Reservar turno
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-5 g-3">
            {(specialties || []).map((s, idx) => {
              const name = typeof s === "string" ? s : (s?.name ?? "—");
              return (
                <div className="col" key={s?.id || idx}>
                  <div className="card-custom card-pill">
                    <div className="card-inner">
                      <h3 className="card-title">{name}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROFESIONALES: layout con foto grupal + mini-cards ========= */}
<section id="profesionales" className="py-5 section-contrast-alt">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h4 m-0">Profesionales</h2>
           <Link to="/reservar-turno" className="btn btn-sm btn-ghost-reserva">
              Reservar turno
            </Link>
          </div>

          <div className="row g-4 align-items-start">
      {/* Foto grupal a la izquierda */}
      <div className="col-12 col-lg-4">
        <img
          src={medicosGrupo}
          alt="Equipo médico"
          className="w-100 rounded-3 professional-group-photo"
        />
      </div>

            {/* Mini-cards a la derecha (grilla densa) */}
            <div className="col-12 col-lg-8">
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                {(doctors || []).map((d, idx) => {
                  const fullName = d?.fullName || "Profesional";
                  const speciality = d?.speciality?.name || "—";
                  const license = d?.license ? `Matrícula ${d.license}` : "";
                  return (
                    <div className="col" key={d?.id || idx}>
                      <div
                        className="card-custom card-pill card-mini"
                        role="button"
                        onClick={() => goToDoctor(d?.id)}
                        title="Ver turnos"
                      >
                        <div className="card-inner">
                          <div className="card-body p-0" style={{ padding: "0 .9rem .9rem .9rem" }}>
                            <h3 className="card-title">{fullName}</h3>
                            <p className="card-meta">{speciality}</p>
                            {license && <p className="card-meta">{license}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Nota: no hay botón de reservar por card.
                  Si luego activamos deep-link por médico, podemos volverlo <Link> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
