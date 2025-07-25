import { useState, useEffect } from "react";
import axios from 'axios';
import './App.css';
import Particles from './Particles';
import { metricsService } from './services/MetricsService';

const AudioUploader = () => {
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

    const [file, setFile] = useState(null);
    const [transcription, setTranscription] = useState("result will appear here...");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        setError(null);
            metricsService.recordTranscriptionAttempt(
                selectedFile.type,
                selectedFile.size
            );
        }
    };

    const handleTranscription = async () => {
        if (!file) {
            setError("Please upload an audio file before transcribing.");
            return;
        }

        const startTime = Date.now();
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:8080/api/transcribe",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            setTranscription(response.data);
            metricsService.recordTranscriptionSuccess((Date.now() - startTime) / 1000);
        } catch (error) {
            setError("Failed to transcribe audio.");
            metricsService.recordTranscriptionError();
        } finally {
            setLoading(false);
            setMetrics(metricsService.getMetricsSummary());
        }
    };

    let displayedTranscription = "";
    if (loading) displayedTranscription = "Loading...";
    else if (error) displayedTranscription = error;
    else if (transcription) displayedTranscription = transcription;
    if (!transcription) displayedTranscription = "No audio to transcribe";

    return (
        <div className="w-full">
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
            </div>
            <div className="content-container">
                <h1>Audio to Text Transcriber</h1>

                <div className="flex flex-col items-center gap-16"> 
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="w-80 h-14 text-lg bg-white text-gray-800 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        type="submit"
                        onClick={handleTranscription}
                        className="btn text-lg px-8 py-3"
                    >
                        Transcribe
                    </button>
                </div>


                <div className="content-container">
                    <p className="text-xl font-semibold text-center">Transcription Result</p>
                    <div className="bg-black/70 text-white-700 border border-gray-300 rounded-lg p-4 flex items-center justify-center text-center min-h-[200px] whitespace-pre-wrap shadow-md">
                        {displayedTranscription}
                    </div>
                </div>

                {metrics && (
                    <div className="mt-8 p-4 bg-black/70 rounded-lg text-white">
                        <h2 className="text-lg font-semibold mb-4">Transcription Metrics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p>Total Attempts: {metrics.attempts}</p>
                                <p>Successful: {metrics.success}</p>
                                <p>Errors: {metrics.errors}</p>
                            </div>
                            <div>
                                <p>Success Rate: {metrics.successRate.toFixed(1)}%</p>
                                <p>Avg. Time: {metrics.avgTime.toFixed(2)}s</p>
                                <p>Avg. File Size: {metrics.avgFileSize.toFixed(2)}MB</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioUploader;

