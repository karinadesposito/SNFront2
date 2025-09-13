// src/Components/FourSections.jsx
import React from "react";
import { Link } from "react-router-dom";

const FourSections = () => {
  return (
    <div
      className="home-bg"
      style={{ "--home-bg": "url(/JuarezSaludFachada.png)" }}
    >
      <div className="container py-3 home-wrap">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 justify-content-center">

          {/* PROFESIONALES: baja a la sección en la misma página */}
          <div className="col d-flex">
            <div className="card-custom card-glass w-100">
              <div className="card-inner">
                <a href="#profesionales" className="stretched-link no-underline">
                  <h2 className="card-title">PROFESIONALES</h2>
                </a>
              </div>
            </div>
          </div>

          {/* TURNOS: ruta existente */}
          <div className="col d-flex">
            <div className="card-custom card-glass w-100">
              <div className="card-inner">
                <Link to="/reservar-turno" className="stretched-link no-underline">
                  <h2 className="card-title">TURNOS</h2>
                </Link>
              </div>
            </div>
          </div>

          {/* CONTACTO (si existe esa ruta) */}
          <div className="col d-flex">
            <div className="card-custom card-glass w-100">
              <div className="card-inner">
                <Link to="/contacto" className="stretched-link no-underline">
                  <h2 className="card-title">CONTACTO</h2>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FourSections;
