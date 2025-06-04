// Performance monitoring middleware for development and optimization
import { StateCreator } from 'zustand'
import { AppState } from '@/types/store'
import { logger } from '@/modules'

export const performanceMiddleware = <T extends AppState>(
  config: StateCreator<T>
): StateCreator<T> => (set, get, api) => {
  const wrappedSet = (...args: Parameters<typeof set>) => {
    const start = performance.now()
    const result = set(...args)
    const duration = performance.now() - start
    
    // Log slow state updates (longer than one frame)
    if (duration > 16.67) {
      logger.warning(`Slow state update detected: ${duration.toFixed(2)}ms`)
      console.trace('Slow state update trace')
    }
    
    // Track state update frequency in development
    if (process.env.NODE_ENV === 'development') {
      const updateCount = (window as any).__zustand_update_count || 0
      (window as any).__zustand_update_count = updateCount + 1
      
      if (updateCount % 100 === 0) {
        logger.info(`State update count: ${updateCount}`)
      }
    }
    
    return result
  }
  
  return config(wrappedSet, get, api)
}
