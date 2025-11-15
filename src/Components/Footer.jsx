import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./../Styles/footer.css";
import pixeliaBlanco from "../assets/pixeliaBlanco.png";

function SocialIcon({ href, label, children }) {
  return (
    <a
      className="social-icon"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <Row className="align-items-center gy-0">
          <Col xs={12} md={2} className="d-flex justify-content-center mb-2 mb-md-0">
            <div className="social">
              <SocialIcon href="#" label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 22v-9h3l1-4h-4V7a1 1 0 0 1 1-1h3V2h-3a5 5 0 0 0-5 5v2H6v4h3v9h4z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="X/Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 4h-3l-4 5-4-5H6l6 8-6 8h3l4-5 4 5h3l-6-8 6-8z" />
                </svg>
              </SocialIcon>
            </div>
          </Col>

          <Col xs={12} md={6} className="mb-2 mb-md-0">
            <div className="d-flex align-items-center">
              <span className="brand-first ms-2">
                Zibecchi 74, Benito Juárez, Buenos Aires. cel: 2281-570849
              </span>
            </div>
          </Col>

          <Col xs={12} md={4} className="d-flex justify-content-center justify-content-md-end">
            {/* <img src={pixeliaBlanco} alt="Pixelia" id="pixeliaBlanco" /> */}
           <span className="brand-first ms-2">
                Developed by JuarezDevs
              </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
