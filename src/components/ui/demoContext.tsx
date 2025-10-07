// src/contexts/DemoContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type RolId = 'ciudadano' | 'policia' | 'custom';

type CustomPersona = {
  nombre: string;
  apellidos: string;
  posicion: RolId;
  dni?: string;
  placa?: string;
};

type DemoState = {
  rol: RolId | null;
  customPersona: CustomPersona | null;
  casosCompletados: string[];
  credencialesEmitidas: string[];
};

type DemoContextType = {
  state: DemoState;
  setRol: (rol: RolId) => void;
  setCustomPersona: (persona: CustomPersona) => void;
  marcarCasoCompletado: (casoId: string) => void;
  agregarCredencialEmitida: (schema: string) => void;
  resetDemo: () => void;
};

const initialState: DemoState = {
  rol: null,
  customPersona: null,
  casosCompletados: [],
  credencialesEmitidas: []
};

const DemoContext = createContext<DemoContextType | null>(null);

const STORAGE_KEY = 'demo_vehiculos_state';

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error cargando estado:', error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error guardando estado:', error);
      }
    }
  }, [state, isClient]);

  const setRol = (rol: RolId) => {
    setState(s => ({ ...s, rol }));
  };

  const setCustomPersona = (persona: CustomPersona) => {
    setState(s => ({ ...s, customPersona: persona, rol: 'custom' }));
  };

  const marcarCasoCompletado = (casoId: string) => {
    setState(s => ({
      ...s,
      casosCompletados: [...s.casosCompletados, casoId]
    }));
  };

  const agregarCredencialEmitida = (schema: string) => {
    setState(s => ({
      ...s,
      credencialesEmitidas: [...s.credencialesEmitidas, schema]
    }));
  };

  const resetDemo = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!isClient) {
    return null;
  }

  return (
    <DemoContext.Provider
      value={{
        state,
        setRol,
        setCustomPersona,
        marcarCasoCompletado,
        agregarCredencialEmitida,
        resetDemo
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo debe usarse dentro de DemoProvider');
  }
  return context;
}

export function getRolData(rol: RolId | null, custom: CustomPersona | null) {
  if (rol === 'custom' && custom) {
    return {
      nombre: custom.nombre,
      apellidos: custom.apellidos,
      dni: custom.dni,
      placa: custom.placa
    };
  }
  
  const defaults = {
    ciudadano: {
      nombre: 'Clara',
      apellidos: 'González Pérez',
      dni: '12345678A'
    },
    policia: {
      nombre: 'Carlos',
      apellidos: 'Martínez López',
      placa: 'PL12345'
    }
  };
  
  if (rol === 'custom') {
    return null;
  }
  return rol ? defaults[rol] : null;
}