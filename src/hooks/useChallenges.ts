import { useState, useCallback } from 'react';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  commands: string[];
  hints: string[];
  completed: boolean;
}

export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Navegación Básica',
    description: 'Navega al directorio /home/user/Documents y lista su contenido',
    difficulty: 'easy',
    commands: ['cd /home/user/Documents', 'ls'],
    hints: [
      'Usa cd para cambiar de directorio',
      'La ruta completa es /home/user/Documents',
      'Usa ls para ver el contenido',
    ],
    completed: false,
  },
  {
    id: 'challenge-2',
    title: 'Creador de Archivos',
    description: 'Crea un archivo llamado "test.txt" con el contenido "Hello World"',
    difficulty: 'easy',
    commands: ['echo "Hello World" > test.txt', 'cat test.txt'],
    hints: [
      'Usa echo para escribir texto',
      'El operador > redirige la salida a un archivo',
      'Verifica el contenido con cat',
    ],
    completed: false,
  },
  {
    id: 'challenge-3',
    title: 'Buscador de Patrones',
    description: 'Encuentra todas las líneas que contienen "error" en un archivo log',
    difficulty: 'medium',
    commands: ['grep "error" logfile.txt'],
    hints: [
      'grep busca patrones en archivos',
      'El formato es: grep "patrón" archivo',
      'Primero crea un archivo log de prueba',
    ],
    completed: false,
  },
  {
    id: 'challenge-4',
    title: 'Maestro de Pipes',
    description: 'Lista todos los archivos y cuenta cuántos hay usando pipes',
    difficulty: 'medium',
    commands: ['ls -la | wc -l'],
    hints: [
      'El pipe | conecta comandos',
      'ls -la lista todos los archivos con detalles',
      'wc -l cuenta las líneas',
    ],
    completed: false,
  },
  {
    id: 'challenge-5',
    title: 'Organización Total',
    description: 'Crea una estructura de directorios y mueve archivos',
    difficulty: 'hard',
    commands: [
      'mkdir -p projects/web',
      'touch index.html style.css script.js',
      'mv *.html projects/web/',
      'mv *.css projects/web/',
      'mv *.js projects/web/',
    ],
    hints: [
      'mkdir -p crea directorios anidados',
      'touch crea múltiples archivos',
      'mv mueve archivos con wildcards',
      'Los wildcards como *.html coinciden con patrones',
    ],
    completed: false,
  },
];

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const stored = localStorage.getItem('terminal-challenges');
    if (stored) {
      return JSON.parse(stored);
    }
    return DAILY_CHALLENGES.map(c => ({ ...c, completed: false }));
  });

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);

  const saveChallenges = useCallback((newChallenges: Challenge[]) => {
    localStorage.setItem('terminal-challenges', JSON.stringify(newChallenges));
    setChallenges(newChallenges);
  }, []);

  const completeChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => {
      const updated = prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, completed: true }
          : challenge
      );
      localStorage.setItem('terminal-challenges', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isChallengeCompleted = useCallback((challengeId: string): boolean => {
    const challenge = challenges.find(c => c.id === challengeId);
    return challenge?.completed || false;
  }, [challenges]);

  const getCurrentChallenge = useCallback((): Challenge | null => {
    return challenges[currentChallengeIndex] || null;
  }, [challenges, currentChallengeIndex]);

  const nextChallenge = useCallback(() => {
    setCurrentChallengeIndex(prev => 
      prev < challenges.length - 1 ? prev + 1 : prev
    );
    setShowHint(false);
    setHintIndex(0);
  }, [challenges.length]);

  const previousChallenge = useCallback(() => {
    setCurrentChallengeIndex(prev => prev > 0 ? prev - 1 : prev);
    setShowHint(false);
    setHintIndex(0);
  }, []);

  const showNextHint = useCallback(() => {
    const current = challenges[currentChallengeIndex];
    if (current && hintIndex < current.hints.length - 1) {
      setHintIndex(prev => prev + 1);
      setShowHint(true);
    } else if (current) {
      setShowHint(true);
    }
  }, [challenges, currentChallengeIndex, hintIndex]);

  const resetChallenges = useCallback(() => {
    const reset = DAILY_CHALLENGES.map(c => ({ ...c, completed: false }));
    saveChallenges(reset);
    setCurrentChallengeIndex(0);
    setShowHint(false);
    setHintIndex(0);
  }, [saveChallenges]);

  const getCompletedCount = useCallback((): number => {
    return challenges.filter(c => c.completed).length;
  }, [challenges]);

  const getTotalCount = useCallback((): number => {
    return challenges.length;
  }, [challenges]);

  const getProgressPercentage = useCallback((): number => {
    return (getCompletedCount() / getTotalCount()) * 100;
  }, [getCompletedCount, getTotalCount]);

  return {
    challenges,
    currentChallengeIndex,
    getCurrentChallenge,
    nextChallenge,
    previousChallenge,
    completeChallenge,
    isChallengeCompleted,
    showHint,
    showNextHint,
    hintIndex,
    resetChallenges,
    getCompletedCount,
    getTotalCount,
    getProgressPercentage,
  };
};
