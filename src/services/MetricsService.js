// Simple metrics service for frontend monitoring
class MetricsService {
    constructor() {
        this.metrics = {
            transcriptionAttempts: 0,
            transcriptionSuccess: 0,
            transcriptionErrors: 0,
            averageTranscriptionTime: 0,
            totalTranscriptionTime: 0,
            fileTypes: {},
            fileSizes: []
        };
    }

    recordTranscriptionAttempt(fileType, fileSize) {
        this.metrics.transcriptionAttempts++;
        
        // Record file type
        this.metrics.fileTypes[fileType] = (this.metrics.fileTypes[fileType] || 0) + 1;
        
        // Record file size in MB
        this.metrics.fileSizes.push(fileSize / (1024 * 1024));
    }

    recordTranscriptionSuccess(duration) {
        this.metrics.transcriptionSuccess++;
        this.metrics.totalTranscriptionTime += duration;
        this.metrics.averageTranscriptionTime = 
            this.metrics.totalTranscriptionTime / this.metrics.transcriptionSuccess;
    }

    recordTranscriptionError() {
        this.metrics.transcriptionErrors++;
    }

    getSuccessRate() {
        if (this.metrics.transcriptionAttempts === 0) return 0;
        return (this.metrics.transcriptionSuccess / this.metrics.transcriptionAttempts) * 100;
    }

    getAverageTranscriptionTime() {
        return this.metrics.averageTranscriptionTime;
    }

    getMetricsSummary() {
        return {
            attempts: this.metrics.transcriptionAttempts,
            success: this.metrics.transcriptionSuccess,
            errors: this.metrics.transcriptionErrors,
            successRate: this.getSuccessRate(),
            avgTime: this.getAverageTranscriptionTime(),
            fileTypes: this.metrics.fileTypes,
            avgFileSize: this.metrics.fileSizes.length > 0 
                ? this.metrics.fileSizes.reduce((a, b) => a + b) / this.metrics.fileSizes.length 
                : 0
        };
    }
}

export const metricsService = new MetricsService(); 