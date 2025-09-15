import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const OptimizedImage = ({
    src,
    alt,
    className = '',
    width = 'auto',
    height = 'auto',
    placeholder = 'blur'
}) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        )

        if (imgRef.current) {
            observer.observe(imgRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const handleLoad = () => {
        setIsLoaded(true)
    }

    // Generate a tiny placeholder
    const placeholderSrc = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Placeholder */}
            {placeholder === 'blur' && !isLoaded && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    style={{ backdropFilter: 'blur(8px)' }}
                />
            )}

            {/* Main image */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={handleLoad}
                    className={`
            transition-opacity duration-300 ease-in-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
                    style={{
                        width,
                        height,
                        objectFit: 'cover'
                    }}
                />
            )}

            {/* Tiny placeholder image */}
            {!isLoaded && (
                <img
                    src={placeholderSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                    aria-hidden="true"
                />
            )}
        </div>
    )
}

OptimizedImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeholder: PropTypes.oneOf(['blur', 'none'])
}

export default OptimizedImage