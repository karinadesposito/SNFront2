// Home.jsx
import heroLogo from "../assets/JuarezSaludFachada.png";

export default function Home() {
  return (
    <section id="home" className="home-bg">
      <img src={heroLogo} alt="Juárez Salud" className="home-hero-logo" />
    </section>
  );
}

