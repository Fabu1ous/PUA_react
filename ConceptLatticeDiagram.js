import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ConceptLatticeDiagram = ({ diagram }) => {
    const svgRef = useRef();

    // Упрощенная функция для удаления транзитивных связей
    const removeTransitiveLinks = (links) => {
        const result = [];
        const seen = new Set();

        for (const link of links) {
            const sourceStr = JSON.stringify(link.source.id);
            const targetStr = JSON.stringify(link.target.id);
            const linkKey = `${sourceStr}->${targetStr}`;

            if (!seen.has(linkKey)) {
                result.push(link);
                seen.add(linkKey);
            }
        }

        return result;
    };

    useEffect(() => {
        console.log('Diagram data:', diagram);
        if (!diagram || !diagram.levels || diagram.levels.length === 0) {
            console.error("Диаграмма некорректна: отсутствуют уровни или атрибуты.");
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 800;
        const height = 600;
        const padding = 50;

        // Создаем узлы
        const nodes = [];
        const levelHeight = (height - 2 * padding) / (diagram.levels.length - 1);

        diagram.levels.forEach((level, levelIndex) => {
            const y = padding + levelHeight * levelIndex;
            const levelWidth = width - 2 * padding;
            const xStep = level.length > 1 ? levelWidth / (level.length - 1) : levelWidth / 2;

            level.forEach((node, nodeIndex) => {
                const x = level.length > 1 
                    ? padding + xStep * nodeIndex 
                    : width / 2;
                nodes.push({
                    id: node,
                    x,
                    y,
                    level: levelIndex
                });
            });
        });

        // Создаем связи
        const links = [];
        diagram.links.forEach(({ source, target }) => {
            const sourceNode = nodes.find(n => 
                JSON.stringify(n.id.objects) === JSON.stringify(source.objects) && 
                JSON.stringify(n.id.attributes) === JSON.stringify(source.attributes)
            );
            const targetNode = nodes.find(n => 
                JSON.stringify(n.id.objects) === JSON.stringify(target.objects) && 
                JSON.stringify(n.id.attributes) === JSON.stringify(target.attributes)
            );

            if (sourceNode && targetNode) {
                links.push({
                    source: sourceNode,
                    target: targetNode
                });
            }
        });

        console.log('Created nodes:', nodes);
        console.log('Created links:', links);

        // Рисуем связи
        svg.selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', '#999')
            .attr('stroke-width', 2);

        // Создаем группу для узлов
        const nodeGroup = svg.append('g');

        // Рисуем узлы
        const nodeElements = nodeGroup.selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Добавляем круги
        nodeElements.append('circle')
            .attr('r', 25)
            .attr('fill', '#4CAF50')
            .attr('stroke', '#2E7D32')
            .attr('stroke-width', 2);

        // Добавляем текст для объектов
        nodeElements.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', -35)
            .text(d => `G:{${d.id.objects?.join(',') || '∅'}}`)
            .attr('font-size', '12px')
            .attr('fill', '#333');

        // Добавляем текст для атрибутов
        nodeElements.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 35)
            .text(d => `M:{${d.id.attributes?.join(',') || '∅'}}`)
            .attr('font-size', '12px')
            .attr('fill', '#333');

    }, [diagram]);

    return (
        <svg 
            ref={svgRef} 
            width={800} 
            height={600} 
            style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        ></svg>
    );
};

export default ConceptLatticeDiagram;
