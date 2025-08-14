import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      try {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        setMousePosition({ x, y });
      } catch (error) {
        console.log('Mouse move error:', error);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Refined animated line pattern - much smaller and elegant
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawLines = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 120; // Much larger grid spacing
      const lineLength = 15; // Much shorter lines
      const maxDistance = 180; // Smaller interaction area
      
      // Draw refined grid lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const centerX = x + gridSize / 2;
          const centerY = y + gridSize / 2;
          
          // Calculate distance from mouse
          const mouseX = (mousePosition.x + 1) * canvas.width / 2;
          const mouseY = (mousePosition.y + 1) * canvas.height / 2;
          const distance = Math.sqrt((centerX - mouseX) ** 2 + (centerY - mouseY) ** 2);
          
          if (distance < maxDistance) {
            const intensity = 1 - (distance / maxDistance);
            const alpha = Math.max(0.05, intensity * 0.6); // More subtle opacity
            const lineWidth = Math.max(0.5, intensity * 1.5); // Thinner lines
            
            // Create subtle gradient effect for lines
            const gradient = ctx.createLinearGradient(
              centerX - lineLength/2, centerY - lineLength/2,
              centerX + lineLength/2, centerY + lineLength/2
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.3})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            
            // Subtle glow effect
            ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
            ctx.shadowBlur = intensity * 5; // Reduced glow
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - lineLength / 2);
            ctx.lineTo(centerX, centerY + lineLength / 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX - lineLength / 2, centerY);
            ctx.lineTo(centerX + lineLength / 2, centerY);
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
          }
        }
      }
      
      animationId = requestAnimationFrame(drawLines);
    };

    drawLines();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mousePosition]);

  // Elegant floating particles
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.hue = Math.random() * 40 + 220;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        const dx = this.x - ((mousePosition.x + 1) * canvas.width / 2);
        const dy = this.y - ((mousePosition.y + 1) * canvas.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const force = (200 - distance) / 200;
          this.x += dx * force * 0.01;
          this.y += dy * force * 0.01;
        }
      }

      draw() {
        ctx.fillStyle = `hsla(${this.hue}, 60%, 70%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 60 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mousePosition]);

  // Set loading to false after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Clean Animated Background */}
      <div className="animated-background">
        <div className="gradient-layer"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Floating Particles Canvas */}
      <canvas 
        ref={particlesRef}
        className="particles-canvas"
        style={{ zIndex: 0 }}
      />
      
      {/* Refined Animated Line Pattern Canvas */}
      <canvas 
        ref={canvasRef}
        className="animated-lines"
        style={{ zIndex: 1 }}
      />
      
      {/* Professional Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">Igloo</span>
            <span className="logo-dot">.</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home" className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="#about" className={activeSection === 'about' ? 'active' : ''}>About</a></li>
            <li><a href="#services" className={activeSection === 'services' ? 'active' : ''}>Services</a></li>
            <li><a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>Contact</a></li>
          </ul>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Building the Future
              <span className="title-accent"> Together</span>
            </h1>
            <p className="hero-subtitle">
              We create innovative digital experiences that transform businesses and delight users. 
              Our team of experts crafts solutions that drive growth and innovation.
            </p>
            <div className="hero-cta">
              <button className="cta-button primary">Start Your Project</button>
              <button className="cta-button secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-graphic">
              <div className="graphic-element element-1"></div>
              <div className="graphic-element element-2"></div>
              <div className="graphic-element element-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">About Igloo</h2>
            <p className="section-subtitle">We're a team of passionate innovators, designers, and developers</p>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <div className="card-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To create digital solutions that empower businesses and enhance human experiences through innovative technology.</p>
            </div>
            <div className="about-card">
              <div className="card-icon">💡</div>
              <h3>Our Vision</h3>
              <p>To be the leading force in digital transformation, setting new standards for innovation and user experience.</p>
            </div>
            <div className="about-card">
              <div className="card-icon">🚀</div>
              <h3>Our Values</h3>
              <p>Innovation, excellence, collaboration, and a relentless focus on delivering exceptional results for our clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Comprehensive digital solutions for modern businesses</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💻</div>
              <h3>Web Development</h3>
              <p>Custom websites and web applications built with cutting-edge technologies and best practices.</p>
              <div className="service-features">
                <span>React</span>
                <span>Node.js</span>
                <span>Python</span>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Mobile Apps</h3>
              <p>Native and cross-platform mobile applications that deliver exceptional user experiences.</p>
              <div className="service-features">
                <span>iOS</span>
                <span>Android</span>
                <span>React Native</span>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">🎨</div>
              <h3>UI/UX Design</h3>
              <p>User-centered design solutions that create intuitive and engaging digital experiences.</p>
              <div className="service-features">
                <span>Figma</span>
                <span>Sketch</span>
                <span>Prototyping</span>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">☁️</div>
              <h3>Cloud Solutions</h3>
              <p>Scalable cloud infrastructure and DevOps solutions for modern applications.</p>
              <div className="service-features">
                <span>AWS</span>
                <span>Azure</span>
                <span>Docker</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">Ready to start your next project? Let's talk!</p>
          </div>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Location</h4>
                  <p>San Francisco, CA</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <p>hello@igloo.inc</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📱</div>
                <div>
                  <h4>Phone</h4>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className="submit-button">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-text">Igloo</span>
              <span className="logo-dot">.</span>
            </div>
            <p className="footer-tagline">Building the future, one project at a time.</p>
            <div className="footer-social">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">GitHub</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Igloo.inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
