import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AutomataDiagram = ({ automata, type }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!automata) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 600;
        const nodeRadius = 25;

        // Подготовка данных
        const nodes = [
            ...automata.states.map(state => ({
                id: state,
                label: state,
                isInitial: automata.initialStates.includes(state),
                isFinal: automata.finalStates.includes(state),
            })),
            { id: 'S', label: 'S', isSpecial: true },
            { id: 'F', label: 'F', isSpecial: true },
        ];

        const links = [
            ...automata.initialStates.map(initial => ({
                source: 'S',
                target: initial,
                symbol: 'ε',
            })),
            ...automata.finalStates.map(final => ({
                source: final,
                target: 'F',
                symbol: 'ε',
            })),
            ...Object.entries(automata.transitions || {}).flatMap(([fromState, transitions]) =>
                Object.entries(transitions).map(([symbol, toState]) => ({
                    source: fromState,
                    target: toState,
                    symbol,
                }))
            ),
        ];

        // Группируем рёбра для множественных связей
        const multiEdges = new Map();
        links.forEach(link => {
            const key = `${link.source}-${link.target}`;
            if (!multiEdges.has(key)) {
                multiEdges.set(key, []);
            }
            multiEdges.get(key).push(link);
        });

        // Создание симуляции
        const simulation = d3
            .forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(200).strength(1))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide(nodeRadius * 2))
            .alphaDecay(0.03);

        // Добавление маркеров для стрелок
        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', nodeRadius)
            .attr('refY', 0)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#999');

        // Рисование рёбер
        const link = svg
            .append('g')
            .selectAll('path')
            .data(links)
            .enter()
            .append('path')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('d', d => {
                const key = `${d.source}-${d.target}`;
                const group = multiEdges.get(key) || []; // Защита от undefined
                const index = group.indexOf(d); // Проверяем, что group существует
                const curvature = group.length > 1 ? (index - (group.length - 1) / 2) * 0.3 : 0; // Изгиб только для множества рёбер
                if (!d.source || !d.target) return ''; // Проверка на наличие source и target
                if (d.source === d.target) {
                    // Петля
                    const x = d.source.x || 0;
                    const y = d.source.y || 0;
                    return `M ${x},${y} A 40,40 0 1,1 ${x + 0.01},${y}`;
                }
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${curvature > 0 ? 1 : 0} ${d.target.x},${d.target.y}`;
            });

        // Рисование узлов
        const node = svg
            .append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded));

        node.append('circle')
            .attr('r', nodeRadius)
            .attr('fill', d => (d.isSpecial ? '#FFD700' : d.isInitial ? '#4CAF50' : 'white'))
            .attr('stroke', d => (d.isFinal ? '#FF5722' : '#4CAF50'))
            .attr('stroke-width', d => (d.isFinal ? 3 : 2));

        node.append('text')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('fill', '#333')
            .attr('font-weight', 'bold');

        // Лейблы для рёбер
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
            .text(d => d.symbol);

        // Обновление позиций при каждом тике симуляции
        simulation.on('tick', () => {
            link.attr('d', d => {
                const key = `${d.source}-${d.target}`;
                const group = multiEdges.get(key) || [];
                const index = group.indexOf(d);
                const curvature = group.length > 1 ? (index - (group.length - 1) / 2) * 0.3 : 0;
                if (!d.source || !d.target) return '';
                if (d.source === d.target) {
                    const x = d.source.x || 0;
                    const y = d.source.y || 0;
                    return `M ${x},${y} A 40,40 0 1,1 ${x + 0.01},${y}`;
                }
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${curvature > 0 ? 1 : 0} ${d.target.x},${d.target.y}`;
            });

            node.attr('transform', d => `translate(${d.x},${d.y})`);

            edgeLabels.attr('transform', d => {
                const midX = (d.source.x + d.target.x) / 2;
                const midY = (d.source.y + d.target.y) / 2;
                return `translate(${midX},${midY})`;
            });
        });

        // Остановка симуляции через 10 секунд
        setTimeout(() => simulation.stop(), 10000);

        function dragStarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragEnded(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }, [automata]);

    return <svg ref={svgRef} style={styles.svg} />;
};

const styles = {
    svg: {
        width: '100%',
        height: '600px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        padding: '20px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        margin: '20px 0',
    },
};

export default AutomataDiagram;
