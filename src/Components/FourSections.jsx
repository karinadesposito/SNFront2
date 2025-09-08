// FourSections.jsx
import React from "react";
import { Link } from "react-router-dom";

const FourSections = () => {
  return (
    <>
      {/* Botón de acceso a Administración (en flujo normal, siempre visible) */}
      <div className="container my-2">
        <div className="d-flex justify-content-end">
          <Link to="/administracion" className="btn btn-primary btn-sm">
            Administración
          </Link>
        </div>
      </div>

      {/* Contenedor central con wrap para centrar verticalmente */}
      <div className="container home-wrap">
        {/* Usamos row-cols para forzar 3 columnas homogéneas en lg */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 justify-content-center">

          {/* STAFF */}
          <div className="col d-flex">
            <div
              className="card-custom w-100"
              style={{
                backgroundImage:
                  "url(https://media.istockphoto.com/id/872676342/es/foto/concepto-de-tecnolog%C3%ADa-m%C3%A9dica-registro-m%C3%A9dico-electr%C3%B3nico.jpg?s=612x612&w=0&k=20&c=_Zg00u1zKtFAeH2EiNaA8htvx8yDFsq568pMl3wpyC0=)",
              }}
            >
              <div className="card-inner">
                <Link to="/doctores" className="stretched-link">
                  <h2 className="card-title">STAFF</h2>
                </Link>
              </div>
            </div>
          </div>

          {/* TURNOS */}
          <div className="col d-flex">
            <div
              className="card-custom w-100"
              style={{
                backgroundImage:
                  "url(https://bancosdeimagenes.com/wp-content/uploads/2019/03/Getty-Medical-Category-768x443-1.jpg)",
              }}
            >
              <div className="card-inner">
                <Link to="/reservar-turno" className="stretched-link">
                  <h2 className="card-title">TURNOS</h2>
                </Link>
              </div>
            </div>
          </div>

          {/* CONTACTO */}
          <div className="col d-flex">
            <div
              className="card-custom w-100"
              style={{
                backgroundImage:
                  "url(https://img.freepik.com/fotos-premium/diversidad-atencion-medica-manos-medicos-asociacion-trabajo-equipo-exito-medicina-apoyo-motivacion-trabajadores-medicos-gesto-mano-mision-ayuda-solidaria-objetivos-colaboracion_590464-153584.jpg)",
              }}
            >
              <div className="card-inner">
                <Link to="/contacto" className="stretched-link">
                  <h2 className="card-title">CONTACTO</h2>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FourSections;

