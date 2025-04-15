import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graph = ({ matrix }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!matrix || matrix.length === 0) return;

        const svg = d3.select(svgRef.current);
        // Очистка предыдущего графа
        svg.selectAll('*').remove();

        const width = 400;
        const height = 400;

        const nodes = [];
        const links = [];

        // Создаем узлы
        for (let i = 0; i < matrix.length; i++) {
            nodes.push({ id: i });
        }

        // Создаем связи на основе матрицы смежности
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 1) {
                    links.push({ source: i, target: j });
                }
            }
        }

        // Настройка силового графа
        const simulation = d3
            .forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide(40))
            .alphaTarget(0.1)
            .on('tick', ticked);

        // Добавляем маркер для стрелок
        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 15)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999');

        // Рисуем рёбра
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
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 15)
            .attr('fill', '#4CAF50')
            .call(
                d3
                    .drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            );

        // Добавляем номера к узлам
        const text = svg
            .append('g')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .text(d => d.id + 1)
            .attr('font-size', 12)
            .attr('dx', -8)
            .attr('dy', 4);

        function ticked() {
            link.attr('d', d => {
                if (d.source === d.target) {
                    const x = d.source.x;
                    const y = d.source.y;
                    return `M ${x},${y} A 30,30 0 1,1 ${x + 0.01},${y}`;
                } else {
                    return `M ${d.source.x},${d.source.y} L ${d.target.x},${d.target.y}`;
                }
            });

            node.attr('cx', d => {
                d.x = Math.max(30, Math.min(width - 30, d.x));
                return d.x;
            }).attr('cy', d => {
                d.y = Math.max(30, Math.min(height - 30, d.y));
                return d.y;
            });

            text.attr('x', d => d.x).attr('y', d => d.y);
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }, [matrix]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg ref={svgRef} width="400" height="400" style={{ border: '1px solid #ccc', borderRadius: '8px' }}></svg>
        </div>
    );
};

export default Graph;