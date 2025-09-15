import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const LazyLoad = ({
    children,
    height = '200px',
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = null
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold,
                rootMargin
            }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [threshold, rootMargin])

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: !isVisible ? height : 'auto',
                position: 'relative'
            }}
        >
            {!isVisible && placeholder}
            {isVisible && children}
        </div>
    )
}

LazyLoad.propTypes = {
    children: PropTypes.node.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    threshold: PropTypes.number,
    rootMargin: PropTypes.string,
    placeholder: PropTypes.node
}

export default LazyLoad