import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CayleyGraph = ({ semigroup, matrices }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!semigroup || semigroup.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 600;
        const radius = Math.min(width, height) / 3;

        // Создаем узлы для каждой матрицы в полугруппе
        const nodes = semigroup.map((_, index) => ({
            id: index,
            label: index < matrices.length ? 
                (index === 0 ? "F" : index === 1 ? "g" : `f${index + 1}`) :
                `${matrices.length + index}`
        }));

        // Создаем связи на основе таблицы Кэли
        const links = [];
        for (let i = 0; i < semigroup.length; i++) {
            for (let j = 0; j < semigroup.length; j++) {
                const composition = JSON.stringify(compositionMatrix(semigroup[i], semigroup[j]));
                const targetIndex = semigroup.findIndex(m => JSON.stringify(m) === composition);
                links.push({
                    source: i,
                    target: targetIndex,
                    label: nodes[j].label
                });
            }
        }

        // Настройка силового графа
        const simulation = d3
            .forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-1000))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide(30))
            .alphaTarget(0.1)
            .on('tick', ticked);

        // Добавляем маркер для стрелок
        svg.append('defs')
            .selectAll('marker')
            .data(['end'])
            .enter()
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 28)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#666');

        // Рисуем связи
        const link = svg
            .append('g')
            .selectAll('g')
            .data(links)
            .enter()
            .append('g');

        // Линии связей
        link.append('path')
            .attr('class', 'link')
            .attr('stroke', '#666')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead)');

        // Метки на связях
        link.append('text')
            .attr('class', 'link-label')
            .attr('font-size', '12px')
            .attr('fill', '#666')
            .text(d => d.label);

        // Рисуем узлы
        const node = svg
            .append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Круги узлов
        node.append('circle')
            .attr('r', 20)
            .attr('fill', d => d.id < matrices.length ? '#cedd6d' : '#f1bfa4')
            .attr('stroke', '#666')
            .attr('stroke-width', 2);

        // Метки узлов
        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('fill', '#000')
            .text(d => d.label);

        function ticked() {
            // Обновление позиций связей
            link.select('path').attr('d', d => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                
                if (d.source === d.target) {
                    // Петля
                    const x = d.source.x;
                    const y = d.source.y;
                    return `M ${x},${y} C ${x-40},${y-40} ${x+40},${y-40} ${x},${y}`;
                }
                
                return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
            });

            // Обновление позиций меток связей
            link.select('text')
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);

            // Обновление позиций узлов
            node.attr('transform', d => {
                d.x = Math.max(30, Math.min(width - 30, d.x));
                d.y = Math.max(30, Math.min(height - 30, d.y));
                return `translate(${d.x},${d.y})`;
            });
        }

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }, [semigroup, matrices]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <h3>Граф Кэли</h3>
            <svg 
                ref={svgRef} 
                width="600" 
                height="600" 
                style={{ 
                    border: '1px solid #ccc', 
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            ></svg>
        </div>
    );
};

// Вспомогательная функция для композиции матриц
const compositionMatrix = (M1, M2) => {
    const n = M1.length;
    const result = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                result[i][j] |= M1[i][k] & M2[k][j];
            }
        }
    }
    return result;
};

export default CayleyGraph; 