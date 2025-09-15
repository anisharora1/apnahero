import { useState, useCallback, useRef, useEffect } from 'react'

// Debounce hook
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

// Throttle hook
export const useThrottle = (callback, delay = 300) => {
    const lastRun = useRef(Date.now())
    const timeout = useRef()

    return useCallback((...args) => {
        const now = Date.now()

        if (now - lastRun.current >= delay) {
            callback(...args)
            lastRun.current = now
        } else {
            clearTimeout(timeout.current)
            timeout.current = setTimeout(() => {
                callback(...args)
                lastRun.current = Date.now()
            }, delay)
        }
    }, [callback, delay])
}

// Cache hook with LRU (Least Recently Used) implementation
export const useCache = (maxSize = 100) => {
    const cache = useRef(new Map())

    const set = useCallback((key, value) => {
        if (cache.current.size >= maxSize) {
            // Remove oldest entry
            const firstKey = cache.current.keys().next().value
            cache.current.delete(firstKey)
        }
        cache.current.set(key, {
            value,
            timestamp: Date.now()
        })
    }, [maxSize])

    const get = useCallback((key) => {
        const item = cache.current.get(key)
        if (item) {
            // Update timestamp on access
            item.timestamp = Date.now()
            return item.value
        }
        return null
    }, [])

    const clear = useCallback(() => {
        cache.current.clear()
    }, [])

    return { set, get, clear }
}

// Event listener hook with cleanup
export const useEventListener = (eventName, handler, element = window) => {
    const savedHandler = useRef()

    useEffect(() => {
        savedHandler.current = handler
    }, [handler])

    useEffect(() => {
        const isSupported = element && element.addEventListener
        if (!isSupported) return

        const eventListener = (event) => savedHandler.current(event)
        element.addEventListener(eventName, eventListener)

        return () => {
            element.removeEventListener(eventName, eventListener)
        }
    }, [eventName, element])
}

// Local storage hook with JSON parsing
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(error)
            return initialValue
        }
    })

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error(error)
        }
    }, [key, storedValue])

    return [storedValue, setValue]
}

// Performance measurement hook
export const usePerformance = (label) => {
    const startTime = useRef()

    const start = useCallback(() => {
        startTime.current = performance.now()
    }, [])

    const end = useCallback(() => {
        if (startTime.current) {
            const endTime = performance.now()
            const duration = endTime - startTime.current
            console.log(`${label} took ${duration.toFixed(2)}ms`)
            startTime.current = null
            return duration
        }
        return 0
    }, [label])

    return { start, end }
}