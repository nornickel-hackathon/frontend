import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { FactoryId } from '@/contracts.ts'
import { FACTORY_ORDER } from '@/lib/domain.ts'

const STORAGE_KEY = 'hf-factory'

interface FactoryContextValue {
  factory: FactoryId
  setFactory: (factory: FactoryId) => void
}

const FactoryContext = createContext<FactoryContextValue | null>(null)

function readStored(): FactoryId {
  const stored = localStorage.getItem(STORAGE_KEY)
  return FACTORY_ORDER.includes(stored as FactoryId) ? (stored as FactoryId) : 'kgmk'
}

export function FactoryProvider({ children }: { children: ReactNode }) {
  const [factory, setFactoryState] = useState<FactoryId>(readStored)

  const value = useMemo<FactoryContextValue>(
    () => ({
      factory,
      setFactory: (next) => {
        localStorage.setItem(STORAGE_KEY, next)
        setFactoryState(next)
      },
    }),
    [factory],
  )

  return <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>
}

export function useFactory(): FactoryContextValue {
  const ctx = useContext(FactoryContext)
  if (ctx === null) {
    throw new Error('useFactory must be used within FactoryProvider')
  }
  return ctx
}
