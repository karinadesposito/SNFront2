import React from "react";
import fachada from "../assets/optimized/JuarezSaludFachada.webp";
import "../Styles/home.css";

export default function Home() {
  return (
    <section
      id="home"
      className="home-bg"
      style={{ "--home-bg": `url(${fachada})` }}
    >
      <div className="container home-wrap">
        <div className="row justify-content-start">
          <div className="col-12 col-lg-12">
            <h1 className="home-title display-3 fw-bold mb-2">
              Bienvenidos a Juárez Salud
            </h1>
            <p className="home-subtitle lead">
              Profesionales de la Salud en Benito Juárez
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
