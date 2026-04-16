import { useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockDate?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-command',
    title: 'Primeros Pasos',
    description: 'Ejecuta tu primer comando',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'file-master',
    title: 'Maestro de Archivos',
    description: 'Crea, edita y elimina 10 archivos',
    icon: '📁',
    unlocked: false,
  },
  {
    id: 'directory-explorer',
    title: 'Explorador',
    description: 'Navega por 5 directorios diferentes',
    icon: '🗺️',
    unlocked: false,
  },
  {
    id: 'grep-wizard',
    title: 'Mago de Grep',
    description: 'Usa grep exitosamente 5 veces',
    icon: '🔍',
    unlocked: false,
  },
  {
    id: 'pipe-master',
    title: 'Maestro de Pipes',
    description: 'Usa pipes (|) en comandos',
    icon: '🔗',
    unlocked: false,
  },
  {
    id: 'docker-captain',
    title: 'Capitán Docker',
    description: 'Gestiona contenedores Docker',
    icon: '🐳',
    unlocked: false,
  },
  {
    id: 'vim-user',
    title: 'Usuario Vim',
    description: 'Abre un archivo con vim',
    icon: '📝',
    unlocked: false,
  },
  {
    id: 'help-seeker',
    title: 'Buscador de Ayuda',
    description: 'Usa el comando help o man',
    icon: '❓',
    unlocked: false,
  },
  {
    id: 'clear-freak',
    title: 'Limpieza Total',
    description: 'Limpia la terminal 10 veces',
    icon: '🧹',
    unlocked: false,
  },
  {
    id: 'linux-zen',
    title: 'Zen Linux',
    description: 'Completa todas las lecciones de Linux',
    icon: '🧘',
    unlocked: false,
  },
];

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const stored = localStorage.getItem('terminal-achievements');
    if (stored) {
      return JSON.parse(stored);
    }
    return ACHIEVEMENTS;
  });

  const [streak, setStreak] = useState<number>(() => {
    const stored = localStorage.getItem('terminal-streak');
    return stored ? parseInt(stored, 10) : 0;
  });

  const [lastVisit, setLastVisit] = useState<string>(() => {
    const stored = localStorage.getItem('terminal-last-visit');
    return stored || '';
  });

  useEffect(() => {
    localStorage.setItem('terminal-achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('terminal-streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('terminal-last-visit', lastVisit);
  }, [lastVisit]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === id && !achievement.unlocked
          ? { ...achievement, unlocked: true, unlockDate: new Date() }
          : achievement
      )
    );
  };

  const checkAchievement = (id: string): boolean => {
    const achievement = achievements.find(a => a.id === id);
    return achievement?.unlocked || false;
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastVisit === today) {
      // Already visited today
      return;
    } else if (lastVisit === yesterday) {
      // Consecutive day
      setStreak(prev => prev + 1);
    } else {
      // Streak broken
      setStreak(1);
    }
    
    setLastVisit(today);
  };

  const getUnlockedCount = (): number => {
    return achievements.filter(a => a.unlocked).length;
  };

  const getTotalCount = (): number => {
    return achievements.length;
  };

  const getProgressPercentage = (): number => {
    return (getUnlockedCount() / getTotalCount()) * 100;
  };

  return {
    achievements,
    streak,
    unlockAchievement,
    checkAchievement,
    updateStreak,
    getUnlockedCount,
    getTotalCount,
    getProgressPercentage,
  };
};
