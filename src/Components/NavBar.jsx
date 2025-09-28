import React, { useEffect, useRef, useState } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import logosaludnet from "../assets/logosaludnet.png";

export default function CustomNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const updateVars = () => {
      const h = navRef.current?.offsetHeight || 64;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
      document.body.classList.add("with-fixed-navbar");
    };
    const onScroll = () => setScrolled(window.scrollY > 4);

    updateVars();
    onScroll();

    window.addEventListener("resize", updateVars, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", updateVars);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Cierra el menú y navega
  const closeMenu = () => setExpanded(false);

  return (
    <Navbar
      ref={navRef}
      fixed="top"
      expand="lg"
      expanded={expanded}
      className={`app-navbar navbar-dark ${scrolled ? "is-scrolled" : ""}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={closeMenu}>
          <div className="navbar-logo-text">
            <img src={logosaludnet} alt="Logo SaludNet" id="logosaludnet" />
            <span className="saludnet-text">SALUD NET</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded((v) => !v)}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Enlaces que cierran el menú al seleccionarse (mobile) */}
            <Nav.Link href="/#especialidades" onClick={closeMenu}>
              Especialidades
            </Nav.Link>
            <Nav.Link href="/#profesionales" onClick={closeMenu}>
              Profesionales
            </Nav.Link>

            {/* MOBILE (dentro del collapse) */}
            <div className="d-lg-none w-100 mt-3 d-flex gap-2">
              <Button
                as={Link}
                to="/reservar-turno"
                variant="link"
                className="flex-fill btn-ghost-reserva"
                size="sm"
                onClick={closeMenu}
              >
                Reservar turnos
              </Button>
              <Button
                as={Link}
                to="/admin"
                variant="outline-light"
                className="flex-fill"
                size="sm"
                onClick={closeMenu}
              >
                Administración
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>

        {/* DESKTOP (derecha) */}
        <div className="d-none d-lg-inline-flex align-items-center">
          <Button
            as={Link}
            to="/reservar-turno"
            variant="link"
            className="btn-ghost-reserva me-2"
            size="sm"
          >
            Reservar turnos
          </Button>
          <Button as={Link} to="/admin" variant="outline-light" size="sm">
            Administración
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}



