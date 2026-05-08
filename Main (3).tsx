import React, { useState, useRef } from 'react';
import { Mic, Square, AlertCircle } from 'lucide-react';
import { usePixelTracking } from '../hooks/usePixelTracking';

const AudioRecorder: React.FC = () => {
  usePixelTracking();

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permissionStatus.state;
    } catch (err) {
      // Fallback for browsers that don't support permission query
      return 'prompt';
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta gravação de áudio');
      }

      const permissionState = await checkMicrophonePermission();
      
      if (permissionState === 'denied') {
        throw new Error('Permissão do microfone negada. Por favor, habilite o acesso ao microfone nas configurações do seu navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(err instanceof Error ? err.message : 'Erro ao acessar o microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-5 flex flex-col items-end gap-2">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg shadow-lg flex items-start gap-2 max-w-xs">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1351B4] hover:bg-[#1351B4]/90'
        } text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors`}
        aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
      >
        {isRecording ? <Square size={20} /> : <Mic size={20} />}
      </button>
    </div>
  );
};

export default AudioRecorder;