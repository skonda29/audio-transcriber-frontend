import { useEffect } from 'react';
import './App.css';
import Particles from './Particles';

export default function Welcome({ onContinue }) {
    useEffect(() => {
            const particlesContainer = document.getElementById('particles-container');
            const particleCount = 80;
    
            for (let i = 0; i < particleCount; i++) {
            createParticle();
            }
    
            function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
    
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
    
            resetParticle(particle);
            particlesContainer.appendChild(particle);
            animateParticle(particle);
            }
    
            function resetParticle(particle) {
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
    
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.opacity = '0';
    
            return { x: posX, y: posY };
            }
    
            function animateParticle(particle) {
            const pos = resetParticle(particle);
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
    
            setTimeout(() => {
                particle.style.transition = `all ${duration}s linear`;
                particle.style.opacity = Math.random() * 0.3 + 0.1;
    
                const moveX = pos.x + (Math.random() * 20 - 10);
                const moveY = pos.y - Math.random() * 30;
    
                particle.style.left = `${moveX}%`;
                particle.style.top = `${moveY}%`;
    
                setTimeout(() => {
                animateParticle(particle);
                }, duration * 1000);
            }, delay * 1000);
            }
    
            const handleMouseMove = (e) => {
            const mouseX = (e.clientX / window.innerWidth) * 100;
            const mouseY = (e.clientY / window.innerHeight) * 100;
    
            const particle = document.createElement('div');
            particle.className = 'particle';
    
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${mouseX}%`;
            particle.style.top = `${mouseY}%`;
            particle.style.opacity = '0.6';
    
            particlesContainer.appendChild(particle);
    
            setTimeout(() => {
                particle.style.transition = 'all 2s ease-out';
                particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
                particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
                particle.style.opacity = '0';
    
                setTimeout(() => {
                particle.remove();
                }, 2000);
            }, 10);
            };
    
            document.addEventListener('mousemove', handleMouseMove);
            return () => document.removeEventListener('mousemove', handleMouseMove);
        }, []);

    return (
        <div>
            <div className="gradient-background">
            <div className="gradient-sphere sphere-1"></div>
            <div className="gradient-sphere sphere-2"></div>
            <div className="gradient-sphere sphere-3"></div>
            <div className="glow"></div>
            <div className="grid-overlay"></div>
            <div className="noise-overlay"></div>
            <div className="particles-container" id="particles-container"></div>
        </div>

        {/* Overlay Text */}
        <div className="content-container" >
            <h1>
            Welcome to AudioTranscriber
            </h1>
            
            <p>
            Automatically turn spoken words into clear, editable notes. Perfect for class, meetings, or ideas.
            </p>
            <button
            onClick={onContinue}
            className="btn"
            >
            Continue
            </button>
        </div>
        </div>
    );
}
