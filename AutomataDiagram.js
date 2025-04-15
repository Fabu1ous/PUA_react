import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AutomataDiagram = ({ automata }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!automata) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 600;
        const height = 500;
        const nodeRadius = 25;
        const padding = 5;

        // Настройка SVG
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // Находим двунаправленные рёбра
        const bidirectionalLinks = new Map();
        const links = [];
        
        Object.entries(automata.transitions || {}).forEach(([fromState, transitions]) => {
            Object.entries(transitions).forEach(([symbol, toState]) => {
                links.push({
                    source: fromState,
                    target: toState,
                    symbol: symbol
                });
                
                // Добавляем в карту двунаправленных рёбер
                const sourceId = fromState;
                const targetId = toState;
                const key = [sourceId, targetId].sort().join('-');
                bidirectionalLinks.set(key, (bidirectionalLinks.get(key) || 0) + 1);
            });
        });

        // Подготавливаем данные
        const nodes = automata.states.map(state => ({
            id: state,
            label: state,
            isInitial: automata.initialStates?.includes(state) || false,
            isFinal: automata.finalStates?.includes(state) || false
        }));

        // Создаем силовую симуляцию для расположения узлов
        const simulation = d3
            .forceSimulation(nodes)
            .force('link', d3.forceLink(links)
                .id(d => d.id)
                .distance(100)
                .strength(1)
            )
            .force('charge', d3.forceManyBody()
                .strength(-800)
                .distanceMin(50)
                .distanceMax(200)
            )
            .force('center', d3.forceCenter(width / 2, height / 2).strength(1))
            .force('collision', d3.forceCollide(nodeRadius * 2).strength(1))
            .force('x', d3.forceX(width / 2).strength(0.1))
            .force('y', d3.forceY(height / 2).strength(0.1))
            .alphaDecay(0.05)
            .alphaMin(0.001)
            .velocityDecay(0.4);

        // Обновляем маркер для стрелок
        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', nodeRadius - 3)
            .attr('refY', 0)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#999');

        // Создаем маркер для начальных состояний
        svg.append('defs')
            .append('marker')
            .attr('id', 'initialArrow')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 7)
            .attr('refY', 0)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#4CAF50');

        // Рисуем связи
        const link = svg
            .append('g')
            .selectAll('path')
            .data(links)
            .enter()
            .append('path')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead)');

        // Рисуем узлы
        const node = svg
            .append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g');

        // Добавляем круги для состояний
        node.append('circle')
            .attr('r', nodeRadius)
            .attr('fill', d => d.isInitial ? '#4CAF50' : 'white')
            .attr('stroke', d => d.isFinal ? '#FF5722' : '#4CAF50')
            .attr('stroke-width', d => d.isFinal ? 3 : 2);

        // Если состояние конечное, добавляем внутренний круг
        node.filter(d => d.isFinal)
            .append('circle')
            .attr('r', nodeRadius - 4)
            .attr('fill', 'none')
            .attr('stroke', '#FF5722')
            .attr('stroke-width', 2);

        // Добавляем подписи к узлам
        node.append('text')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('fill', d => d.isInitial ? 'white' : '#333')
            .attr('font-weight', 'bold');

        // Добавляем стрелки для начальных состояний
        const initialArrows = svg
            .append('g')
            .selectAll('line')
            .data(nodes.filter(d => d.isInitial))
            .enter()
            .append('line')
            .attr('stroke', '#4CAF50')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#initialArrow)');

        // Добавляем подписи к рёбрам
        const edgeLabels = svg
            .append('g')
            .selectAll('text')
            .data(links)
            .enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', -5)
            .attr('fill', '#333')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('background', 'white')
            .text(d => d.symbol);

        // Обновляем позиции при каждом тике симуляции
        simulation.on('tick', () => {
            // Ограничиваем координаты узлов
            nodes.forEach(node => {
                node.x = Math.max(nodeRadius + padding, Math.min(width - nodeRadius - padding, node.x));
                node.y = Math.max(nodeRadius + padding, Math.min(height - nodeRadius - padding, node.y));
            });

            // Добавляем проверку на NaN
            const isValidNumber = n => typeof n === 'number' && !isNaN(n);
            const offset = 5; // Определяем смещение для петель

            link.attr('d', d => {
                if (!isValidNumber(d.source.x) || !isValidNumber(d.source.y) || 
                    !isValidNumber(d.target.x) || !isValidNumber(d.target.y)) {
                    return '';
                }

                if (d.source.id === d.target.id) {
                    // Петля
                    const x = d.source.x;
                    const y = d.source.y;
                    return `M ${x + offset},${y} A 30,30 0 1,1 ${x + offset + 0.01},${y}`;
                } else {
                    const sourceId = d.source.id;
                    const targetId = d.target.id;
                    const key = [sourceId, targetId].sort().join('-');
                    
                    // Проверяем наличие двунаправленного ребра
                    if (bidirectionalLinks.get(key) > 1) {
                        // Если есть двунаправленное ребро, делаем изгиб
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
                        
                        if (d.source.id < d.target.id) {
                            return `M ${d.source.x},${d.source.y} A ${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
                        } else {
                            return `M ${d.source.x},${d.source.y} A ${dr},${dr} 0 0,0 ${d.target.x},${d.target.y}`;
                        }
                    } else {
                        // Прямая линия
                        return `M ${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`;
                    }
                }
            });

            // Обновляем позиции узлов
            node.attr('transform', d => 
                isValidNumber(d.x) && isValidNumber(d.y) ? 
                `translate(${d.x},${d.y})` : '');

            // Обновляем позиции стрелок для начальных состояний
            initialArrows
                .attr('x1', d => isValidNumber(d.x) ? d.x - 50 : 0)
                .attr('y1', d => isValidNumber(d.y) ? d.y : 0)
                .attr('x2', d => isValidNumber(d.x) ? d.x - nodeRadius - 3 : 0)
                .attr('y2', d => isValidNumber(d.y) ? d.y : 0);

            // Обновляем позиции меток рёбер
            edgeLabels.attr('transform', d => {
                if (!isValidNumber(d.source.x) || !isValidNumber(d.source.y) || 
                    !isValidNumber(d.target.x) || !isValidNumber(d.target.y)) {
                    return '';
                }

                if (d.source.id === d.target.id) {
                    // Метка для петли
                    return `translate(${d.source.x + offset},${d.source.y - 45})`;
                } else {
                    const sourceId = d.source.id;
                    const targetId = d.target.id;
                    const key = [sourceId, targetId].sort().join('-');
                    
                    if (bidirectionalLinks.get(key) > 1) {
                        // Для изогнутых рёбер размещаем метку над дугой
                        const midX = (d.source.x + d.target.x) / 2;
                        const midY = (d.source.y + d.target.y) / 2;
                        const dx = d.target.x - d.source.x;
                        const dy = d.target.y - d.source.y;
                        
                        // Смещение для метки
                        const offset = 0;
                        const angle = Math.atan2(dy, dx);
                        
                        // Выбираем направление смещения в зависимости от порядка идентификаторов
                        let perpX, perpY;
                        if (d.source.id < d.target.id) {
                            perpX = -Math.sin(angle) * offset;
                            perpY = Math.cos(angle) * offset;
                        } else {
                            perpX = Math.sin(angle) * offset;
                            perpY = -Math.cos(angle) * offset;
                        }
                        
                        return `translate(${midX + perpX},${midY + perpY})`;
                    } else {
                        // Для прямых рёбер - по центру
                        const midX = (d.source.x + d.target.x) / 2;
                        const midY = (d.source.y + d.target.y) / 2;
                        return `translate(${midX},${midY - 10})`;
                    }
                }
            });
        });

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
            event.subject.fx = Math.max(nodeRadius + padding, Math.min(width - nodeRadius - padding, event.x));
            event.subject.fy = Math.max(nodeRadius + padding, Math.min(height - nodeRadius - padding, event.y));
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // Останавливаем симуляцию через некоторое время
        setTimeout(() => {
            simulation.stop();
        }, 5000);

    }, [automata]);

    return (
        <svg 
            ref={svgRef}
            style={styles.svg}
        />
    );
};

const styles = {
    svg: {
        width: '100%',
        height: '500px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        padding: '20px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        margin: '20px 0',
    },
};

export default AutomataDiagram; 