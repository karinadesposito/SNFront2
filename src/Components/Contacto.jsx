import React, { useState } from "react";
import { Button } from "react-bootstrap"; 

export default function Contacto() {
  const [mapLoaded, setMapLoaded] = useState(false);

  // Dirección más precisa para el embed (sin key)
  const MAP_QUERY = encodeURIComponent(
    "Zibecchi 74, Benito Juárez, Buenos Aires, Argentina"
  );
  const MAP_EMBED_URL = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;

  return (
    <section id="contacto" className="contact-wrap">
      <div className="container">
        <div className="row g-5 align-items-stretch">
          {/* Columna izquierda: texto + formulario */}
          <div className="col-12 col-lg-7">
            <h2 className="contact-title display-6">Contáctanos</h2>
            <p className="contact-lead">
              Ante cualquier duda o consulta, podés usar el formulario. Si
              necesitás una respuesta inmediata, te pedimos que visites nuestro
              centro médico o te comuniques telefónicamente.
            </p>

            <form
              className="contact-form mt-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="mb-3">
                <label
                  htmlFor="cf-nombre"
                  className="form-label visually-hidden"
                >
                  Nombre y apellido
                </label>
                <input
                  id="cf-nombre"
                  type="text"
                  className="form-control"
                  placeholder="Nombre y apellido *"
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="cf-telefono"
                  className="form-label visually-hidden"
                >
                  Teléfono
                </label>
                <input
                  id="cf-telefono"
                  type="tel"
                  className="form-control"
                  placeholder="Teléfono *"
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="cf-email"
                  className="form-label visually-hidden"
                >
                  Email
                </label>
                <input
                  id="cf-email"
                  type="email"
                  className="form-control"
                  placeholder="Email *"
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="cf-consulta"
                  className="form-label visually-hidden"
                >
                  Consulta
                </label>
                <textarea
                  id="cf-consulta"
                  className="form-control"
                  rows="5"
                  placeholder="Consulta *"
                  required
                />
              </div>

                <Button type="submit" bsPrefix="btn-admin" className="sm">
                ENVIAR
                </Button>
            </form>
          </div>

          {/* Columna derecha: panel con datos + mapa */}
          <div className="col-12 col-lg-5">
            <div className="contact-panel h-100">
              {/* Dirección */}
              <div className="mb-4">
                <div className="contact-item">
                  <svg
                    className="contact-ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 21s7-6.307 7-11A7 7 0 1 0 5 10c0 4.693 7 11 7 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <div>
                    <div className="contact-h6">Dirección</div>
                    <div>Zibecchi 74 - B. Juárez</div>
                  </div>
                </div>
              </div>

              {/* Teléfonos */}
              <div className="mb-4">
                <div className="contact-item">
                  <svg
                    className="contact-ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M22 16.92v2a2 2 0 0 1-2.18 2 19.77 19.77 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.77 19.77 0 0 1 2.92 4.18 2 2 0 0 1 4.86 2h2a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.58a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57A2 2 0 0 1 22 16.92Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <div>
                    <div className="contact-h6">Teléfonos</div>
                    <div>0249 - 4440129</div>
                    <div>0249 - 4446762</div>
                    <div>02292 - 453793</div>
                    <div>0800 - 666 - 2343</div>
                    <div>FAX: 0249 - 4440129</div>
                  </div>
                </div>
              </div>

              {/* Correo */}
              <div className="mb-3">
                <div className="contact-item">
                  <svg
                    className="contact-ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="m22 8-10 7L2 8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <div>
                    <div className="contact-h6">Correo</div>
                    <div>cdm@centrodm.com.ar</div>
                  </div>
                </div>
              </div>

              {/* Mapa (carga bajo demanda) */}
              <div className="map-box" aria-label="Mapa de ubicación">
                {mapLoaded ? (
                  <iframe
                    src={MAP_EMBED_URL}
                    title="Mapa de ubicación"
                    className="map-iframe"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="map-placeholder">
                    <svg
                      className="map-ico"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 21s7-6.307 7-11A7 7 0 1 0 5 10c0 4.693 7 11 7 11Z"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    </svg>
                    <button
                      className="map-btn"
                      onClick={() => setMapLoaded(true)}
                    
                    >
                      Ver mapa
                    </button>
                  </div>
                )}
              </div>
              {/* /map-box */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
