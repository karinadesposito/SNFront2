import React from "react";
import { Link } from "react-router-dom";
import "../Styles/fourSection.css";

// Imágenes optimizadas locales
import profesionalesImg from "../assets/optimized/profesionales.webp";
import turnosImg from "../assets/optimized/turnos.webp";

const FourSectionsAdmin = () => {
  return (
    <div className="admin-page">
      {/* container-xxl para achicar márgenes laterales */}
      <div className="admin-container container-xxl">
        <div className="row g-4 justify-content-center">
          {/* PROFESIONALES */}
          <div className="col-12 col-md-6 d-flex justify-content-center">
            <div
              className="card-box admin-card w-100"
              style={{ "--card-bg": `url(${profesionalesImg})` }}
            >
              <div className="card-layer card-title-only">
                <h2 className="card-title">PROFESIONALES</h2>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap text-center">
                  <h3 className="info-title mb-2">Gestionar profesionales</h3>

                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Link to="/AgregarProfesional" className="btn-admin sm">
                      Agregar
                    </Link>
                    <Link to="/EditarProfesional" className="btn-admin sm">
                      Administrar
                    </Link>
                    {/*<Link to="/EliminarProfesional" className="btn-admin sm">
                      Eliminar
                    </Link>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AGENDA */}
          <div className="col-12 col-md-6 d-flex justify-content-center">
            <div
              className="card-box admin-card w-100"
              style={{
                "--card-bg":
                  "url(https://www.shutterstock.com/image-illustration/top-view-medical-stethoscope-icon-600nw-2075382679.jpg)",
              }}
            >
              <div className="card-layer card-title-only">
                <h2 className="card-title">AGENDA</h2>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap text-center">
                  <h3 className="info-title mb-2">Administrar agenda</h3>

                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Link to="/crear-agenda" className="btn-admin sm">
                      Crear agenda
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESERVAR TURNOS — título clickeable, sin botón */}
          <div className="col-12 col-md-6 d-flex justify-content-center">
            <div
              className="card-box admin-card w-100"
              style={{ "--card-bg": `url(${turnosImg})` }}
            >
              <div className="card-layer card-title-only">
                <Link to="/reservar-turno" className="card-link">
                  <h2 className="card-title">RESERVAR TURNOS</h2>
                </Link>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap text-center">
                  <h3 className="info-title mb-2">Reservar turnos</h3>

                  <span className="info-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <Link to="/reservar-turno" className="stretched-link" />
              </div>
            </div>
          </div>

          {/* REPORTES */}
          <div className="col-12 col-md-6 d-flex justify-content-center">
            <div
              className="card-box admin-card w-100"
              style={{
                "--card-bg":
                  "url(https://economia3.com/wp-content/uploads/2021/02/informes_1.jpg)",
              }}
            >
              <div className="card-layer card-title-only">
                <h2 className="card-title">REPORTES</h2>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap text-center">
                  <h3 className="info-title mb-2">Ver reportes</h3>
                  <span className="info-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <Link to="/reportes" className="stretched-link" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourSectionsAdmin;
