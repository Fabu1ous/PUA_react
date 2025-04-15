import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SemigroupGraph = ({ data, title }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        console.log('Graph data:', data);

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 400;
        const height = 400;
        const nodeRadius = 20;
        const padding = 5;

        // Находим двунаправленные рёбра
        const bidirectionalLinks = new Map(); // ключ: "меньшийId-большийId", значение: количество рёбер
        data.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            const key = [sourceId, targetId].sort().join('-');
            bidirectionalLinks.set(key, (bidirectionalLinks.get(key) || 0) + 1);
        });

        // Настройка силового графа
        const simulation = d3
            .forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links)
                .id(d => d.id)
                .distance(100) // Уменьшим расстояние между узлами
                .strength(1) // Увеличим силу связей
            )
            .force('charge', d3.forceManyBody()
                .strength(-800) // Увеличим силу отталкивания
                .distanceMin(50) // Минимальное расстояние действия силы
                .distanceMax(200) // Максимальное расстояние действия силы
            )
            .force('center', d3.forceCenter(width / 2, height / 2).strength(1))
            .force('collision', d3.forceCollide(nodeRadius * 2).strength(1))
            .force('x', d3.forceX(width / 2).strength(0.1))
            .force('y', d3.forceY(height / 2).strength(0.1))
            .alphaDecay(0.05) // Замедлим скорость затухания симуляции
            .alphaMin(0.001) // Увеличим минимальное значение альфа
            .velocityDecay(0.4); // Увеличим затухание скорости

        // Обновляем маркер для стрелок
        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', nodeRadius) // Уменьшаем значение, чтобы стрелка касалась вершины
            .attr('refY', 0)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#999');

        // Рисуем связи
        const link = svg
            .append('g')
            .selectAll('path')
            .data(data.links)
            .enter()
            .append('path')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead)'); // Добавляем маркер ко всем рёбрам

        // Рисуем узлы
        const node = svg
            .append('g')
            .selectAll('circle')
            .data(data.nodes)
            .enter()
            .append('circle')
            .attr('r', nodeRadius)
            .attr('fill', '#4CAF50');

        // Добавляем подписи к узлам
        const labels = svg
            .append('g')
            .selectAll('text')
            .data(data.nodes)
            .enter()
            .append('text')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('fill', 'white');

        // Обновляем создание меток на рёбрах
        const edgeLabels = svg
            .append('g')
            .selectAll('text')
            .data(data.links)
            .enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', -5)
            .text(d => {
                console.log('Edge data:', d); // Для отладки
                return d.labels ? d.labels.join(', ') : '';
            });

        // Обновляем функцию tick для более стабильного поведения
        simulation.on('tick', () => {
            // Ограничиваем координаты узлов
            data.nodes.forEach(node => {
                node.x = Math.max(nodeRadius + padding, Math.min(width - nodeRadius - padding, node.x));
                node.y = Math.max(nodeRadius + padding, Math.min(height - nodeRadius - padding, node.y));
            });

            // Добавляем проверку на NaN
            const isValidNumber = n => typeof n === 'number' && !isNaN(n);

            link.attr('d', d => {
                if (!isValidNumber(d.source.x) || !isValidNumber(d.source.y) || 
                    !isValidNumber(d.target.x) || !isValidNumber(d.target.y)) {
                    return '';
                }

                if (d.source === d.target) {
                    // Петля
                    const x = d.source.x;
                    const y = d.source.y;
                    return `M ${x},${y} A 30,30 0 1,1 ${x + 0.01},${y}`;
                } else {
                    const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                    const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                    
                    // Проверяем наличие обратного ребра
                    const reverseLink = data.links.find(l => 
                        (typeof l.source === 'object' ? l.source.id : l.source) === targetId && 
                        (typeof l.target === 'object' ? l.target.id : l.target) === sourceId
                    );
                    
                    if (reverseLink) {
                        // Если есть обратное ребро, делаем изгиб вправо
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
                        
                        // Вычисляем точку окончания пути немного не доходя до узла,
                        // чтобы стрелка корректно отображалась
                        const endX = d.target.x;
                        const endY = d.target.y;
                        
                        return `M ${d.source.x},${d.source.y} A ${dr},${dr} 0 0,0 ${endX},${endY}`;
                    } else {
                        // Прямая линия
                        return `M ${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`;
                    }
                }
            });

            // Обновляем позиции узлов и меток только если координаты валидны
            node
                .attr('cx', d => isValidNumber(d.x) ? d.x : 0)
                .attr('cy', d => isValidNumber(d.y) ? d.y : 0);

            labels
                .attr('x', d => isValidNumber(d.x) ? d.x : 0)
                .attr('y', d => isValidNumber(d.y) ? d.y : 0);

            edgeLabels
                .attr('transform', d => {
                    if (!isValidNumber(d.source.x) || !isValidNumber(d.source.y) || 
                        !isValidNumber(d.target.x) || !isValidNumber(d.target.y)) {
                        return '';
                    }

                    if (d.source === d.target) {
                        // Метка для петли
                        return `translate(${d.source.x},${d.source.y - 45})`;
                    } else {
                        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                        
                        // Проверяем наличие обратного ребра
                        const reverseLink = data.links.find(l => 
                            (typeof l.source === 'object' ? l.source.id : l.source) === targetId && 
                            (typeof l.target === 'object' ? l.target.id : l.target) === sourceId
                        );
                        
                        if (reverseLink) {
                            // Для изогнутых рёбер размещаем метку над дугой
                            const midX = (d.source.x + d.target.x) / 2;
                            const midY = (d.source.y + d.target.y) / 2;
                            const dx = d.target.x - d.source.x;
                            const dy = d.target.y - d.source.y;
                            
                            // Всегда смещаем метку вправо от линии
                            const offset = 20;
                            
                            // Смещаем метку перпендикулярно линии
                            const angle = Math.atan2(dy, dx);
                            const perpX = -Math.sin(angle) * offset;
                            const perpY = Math.cos(angle) * offset;
                            
                            return `translate(${midX + perpX},${midY + perpY})`;
                        } else {
                            // Для прямых рёбер - по центру
                            const midX = (d.source.x + d.target.x) / 2;
                            const midY = (d.source.y + d.target.y) / 2;
                            return `translate(${midX},${midY - 10})`;
                        }
                    }
                })
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle');
        });

        // Добавляем ограничение на количество итераций
        setTimeout(() => {
            simulation.stop();
        }, 5000); // Останавливаем симуляцию через 5 секунд, если она не стабилизировалась

        // Добавляем возможность перетаскивания узлов
        node.call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            // Ограничиваем перетаскивание
            event.subject.fx = Math.max(nodeRadius + padding, Math.min(width - nodeRadius - padding, event.x));
            event.subject.fy = Math.max(nodeRadius + padding, Math.min(height - nodeRadius - padding, event.y));
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }, [data]);

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>{title}</h3>
            <svg ref={svgRef} width="400" height="400" style={styles.svg}></svg>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    title: {
        color: '#2c3e50',
        marginBottom: '25px',
        fontSize: '1.5em',
        fontWeight: '600',
        textAlign: 'center',
    },
    svg: {
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        padding: '20px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
        },
    },
};

export default SemigroupGraph; 