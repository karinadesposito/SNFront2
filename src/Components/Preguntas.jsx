// src/Components/Preguntas.jsx
import React from "react";
import { Link } from "react-router-dom";
import Accordion from "react-bootstrap/Accordion";

export default function Preguntas() {
  return (
    <section id="preguntas" className="py-5">
      <div className="container">
        <div className="row g-5 align-items-start">
          {/* FAQ */}
          <div className="col-12 col-lg-7">
            <h2 className="display-6 mb-3">Preguntas frecuentes</h2>
            <p className="lead text-muted mb-4">
              Respondemos las dudas más comunes sobre turnos, coberturas y horarios.
            </p>

            <Accordion alwaysOpen>
              <Accordion.Item eventKey="0">
                <Accordion.Header>¿Cómo solicito un turno?</Accordion.Header>
                <Accordion.Body>
                  Desde la sección <Link to="/reservar-turno">Turnos</Link> podés reservar online
                  o comunicarte telefónicamente con recepción.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>¿Qué obras sociales aceptan?</Accordion.Header>
                <Accordion.Body>
                  El listado se actualiza periódicamente. Consultalo en recepción o por WhatsApp de la institución.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>¿Cómo reprogramo o cancelo un turno?</Accordion.Header>
                <Accordion.Body>
                  Ingresá a tu turno y elegí reprogramar o cancelar hasta 24&nbsp;h antes. Si necesitás ayuda,
                  comunicate con recepción.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>¿Cuáles son los horarios de atención?</Accordion.Header>
                <Accordion.Body>
                  Lunes a viernes de 8:00 a 20:00. Sábados de 8:00 a 12:00. Consultá feriados por nuestros canales oficiales.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          {/* Panel lateral reutilizando Contacto */}
          <div className="col-12 col-lg-5">
            <div className="contact-panel h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="contact-h6">¿No encontrás tu respuesta?</div>
                <p className="mb-4">
                  Escribinos por el formulario de <Link to="/" className="text-white">Contacto</Link> o llamanos.
                </p>

                <div className="mb-3">
                  <div className="contact-h6">Teléfonos</div>
                  <div>0249 - 4440129</div>
                  <div>0249 - 4446762</div>
                </div>

                <div className="mb-4">
                  <div className="contact-h6">Correo</div>
                  <div>cdm@centrodm.com.ar</div>
                </div>
              </div>

              <div>
                <Link to="/reservar-turno" className="btn btn-light fw-semibold px-4 rounded-pill">
                  Reservar un turno
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
