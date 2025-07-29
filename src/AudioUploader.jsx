import { useState, useEffect } from "react";
import axios from 'axios';
import './App.css';
import Particles from './Particles';
import { metricsService } from './services/MetricsService';

const AudioUploader = () => {
    useEffect(() => {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) {
            console.warn('Particles container not found');
            return;
        }
        
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
    const [transcriptionResult, setTranscriptionResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            console.log('File selected:', selectedFile.name, selectedFile.type, selectedFile.size);
            
            // Check file size (limit to 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (selectedFile.size > maxSize) {
                setError(`File too large. Please select a file smaller than 10MB. Current file: ${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB`);
                setFile(null);
                return;
            }
            
            const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'audio/webm'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError(`Unsupported file type: ${selectedFile.type}. Please select a WAV, MP3, M4A, OGG, or WebM file.`);
                setFile(null);
                return;
            }
            
            setFile(selectedFile);
            setError(null);
            setTranscriptionResult(null); 
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

        console.log('Starting transcription for file:', file.name);
        const startTime = Date.now();
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);
        setError(null);

        try {
            // Use backend URL directly for production, proxy for development
            const baseURL = import.meta.env.PROD 
                ? 'https://audio-transcriber-backend-3.onrender.com'
                : '';
            const apiURL = `${baseURL}/api/transcribe`;
            
            console.log('Sending request to:', apiURL);
            const response = await axios.post(apiURL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, 
            });
            
            console.log('Response received:', response.status, response.data);
            
            let transcriptionText = '';
            if (typeof response.data === 'string') {
                transcriptionText = response.data;
            } else if (response.data && response.data.transcription) {
                transcriptionText = response.data.transcription;
            } else if (response.data && response.data.text) {
                transcriptionText = response.data.text;
            } else if (response.data && response.data.result) {
                transcriptionText = response.data.result;
            } else {
                transcriptionText = JSON.stringify(response.data);
            }
            
            setTranscriptionResult(transcriptionText);
            metricsService.recordTranscriptionSuccess((Date.now() - startTime) / 1000);
            console.log('Transcription successful:', transcriptionText);
        } catch (error) {
            console.error("Transcription error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            
            let errorMessage = "Failed to transcribe audio.";
            
            if (error.response?.status === 413) {
                errorMessage = "File too large for server. The backend has file size restrictions. Try compressing your audio file or using a shorter recording.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(`Error: ${errorMessage}`);
            metricsService.recordTranscriptionError();
        } finally {
            setLoading(false);
            setMetrics(metricsService.getMetricsSummary());
        }
    };

    let displayContent = null;
    if (loading) {
        displayContent = (
            <div className="text-center">
                <div className="animate-pulse">Processing audio file...</div>
                <div className="text-sm text-gray-400 mt-2">This may take a moment</div>
            </div>
        );
    } else if (error) {
        displayContent = <div className="text-center text-red-400">{error}</div>;
    } else if (!transcriptionResult) {
        displayContent = <div className="text-center">Upload an audio file and click transcribe to see results...</div>;
    } else {
        displayContent = (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-300">Transcription:</h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <p className="text-white leading-relaxed">{transcriptionResult}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-300">Summary:</h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <p className="text-white leading-relaxed">No summary available.</p>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div className="flex flex-col items-center gap-4">
                        <input
                            type="file"
                            accept="audio/wav,audio/mp3,audio/mpeg,audio/m4a,audio/ogg,audio/webm"
                            onChange={handleFileChange}
                            className="w-80 h-14 text-lg bg-white text-gray-800 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <div className="text-sm text-gray-400 text-center">
                            Supported: WAV, MP3, M4A, OGG, WebM • Max size: 10MB
                            {file && (
                                <div className="mt-1 text-blue-300">
                                    Selected: {file.name} ({file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)}MB` : `${(file.size / 1024).toFixed(0)}KB`})
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        onClick={handleTranscription}
                        disabled={loading}
                        className={`btn text-lg px-8 py-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Transcribe'}
                    </button>

                    <button
                        onClick={() => window.open('https://document-chat-pro.streamlit.app', '_blank')}
                        className="btn"
                        style={{ marginTop: '10px', marginLeft: '10px' }}
                    >
                        Access DocuChat Pro
                    </button>
                </div>

                <div className="content-container mt-10">
                    <p className="text-xl font-semibold text-center">Transcription Result</p>
                    <div className="bg-black/70 border border-gray-300 rounded-lg p-6 min-h-[200px] shadow-md">
                        {displayContent}
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
