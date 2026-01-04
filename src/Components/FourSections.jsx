// src/Components/FourSections.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../Styles/fourSection.css";

// Imágenes optimizadas (src/assets/optimized/)
import profesionalesImg from "../assets/optimized/profesionales.webp";
import turnosImg from "../assets/optimized/turnos.webp";
import preguntasImg from "../assets/optimized/preguntas.webp";

const FourSections = () => {
  return (
    <>
      <div className="container fs-wrap">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 fs-row">
          {/* PROFESIONALES */}
          <div className="col d-flex justify-content-center">
            <div className="card-box" style={{ "--card-bg": `url(${profesionalesImg})` }}>
              <div className="card-layer card-title-only">
                <h2 className="card-title">PROFESIONALES</h2>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap">
                  <h3 className="info-title">Conocé al equipo</h3>
                  <p className="info-text">Especialidades, experiencia y horarios de atención.</p>
                  <span className="info-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <Link to="/profesionales" className="stretched-link" />
              </div>
            </div>
          </div>

          {/* TURNOS */}
          <div className="col d-flex justify-content-center">
            <div className="card-box" style={{ "--card-bg": `url(${turnosImg})` }}>
              <div className="card-layer card-title-only">
                <h2 className="card-title">TURNOS</h2>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap">
                  <h3 className="info-title">Solicitar turno</h3>
                  <p className="info-text">Reservá tu turno online de forma rápida y segura.</p>
                  <span className="info-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <Link to="/reservar-turno" className="stretched-link" />
              </div>
            </div>
          </div>

          {/* PREGUNTAS */}
          <div className="col d-flex justify-content-center">
            <div className="card-box" style={{ "--card-bg": `url(${preguntasImg})` }}>
              <div className="card-layer card-title-only">
                <h2 className="card-title">PREGUNTAS</h2>
              </div>
              <div className="card-layer card-hover">
                <div className="info-wrap">
                  <h3 className="info-title">Preguntas frecuentes</h3>
                  <p className="info-text">Respondemos tus dudas más comunes.</p>
                  <span className="info-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <Link to="/preguntas" className="stretched-link" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FourSections;
