import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const VirtualScroll = ({
    items,
    height = '400px',
    itemHeight = 50,
    renderItem,
    overscan = 3,
    className = ''
}) => {
    const [start, setStart] = useState(0)
    const [visibleItems, setVisibleItems] = useState([])
    const containerRef = useRef(null)

    const visibleCount = Math.ceil(parseInt(height) / itemHeight) + overscan * 2

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollTop = containerRef.current.scrollTop
                const newStart = Math.floor(scrollTop / itemHeight)
                setStart(Math.max(0, newStart - overscan))
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [itemHeight, overscan])

    useEffect(() => {
        const end = Math.min(start + visibleCount, items.length)
        setVisibleItems(items.slice(start, end))
    }, [start, items, visibleCount])

    const totalHeight = items.length * itemHeight
    const offsetY = start * itemHeight

    return (
        <div
            ref={containerRef}
            style={{ height, overflow: 'auto' }}
            className={className}
        >
            <div style={{ height: totalHeight + 'px', position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div key={start + index} style={{ height: itemHeight + 'px' }}>
                            {renderItem(item, start + index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

VirtualScroll.propTypes = {
    items: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    itemHeight: PropTypes.number,
    renderItem: PropTypes.func.isRequired,
    overscan: PropTypes.number,
    className: PropTypes.string
}

export default VirtualScroll