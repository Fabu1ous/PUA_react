import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HasseDiagram = ({ diagram }) => {
    const svgRef = useRef();

    // Функция для удаления транзитивных связей
    const removeTransitiveLinks = (links) => {
        const nodes = new Set();
        links.forEach(link => {
            nodes.add(link.source);
            nodes.add(link.target);
        });
        const nodeArray = Array.from(nodes);
        const adjacency = {};

        // Инициализация матрицы смежности
        nodeArray.forEach(a => {
            adjacency[a] = {};
            nodeArray.forEach(b => {
                adjacency[a][b] = false;
            });
        });

        // Заполнение матрицы прямыми связями
        links.forEach(({ source, target }) => {
            adjacency[source][target] = true;
        });

        // Алгоритм Флойда-Уоршелла для транзитивного замыкания
        nodeArray.forEach(k => {
            nodeArray.forEach(i => {
                nodeArray.forEach(j => {
                    if (adjacency[i][k] && adjacency[k][j]) {
                        adjacency[i][j] = true;
                    }
                });
            });
        });

        // Фильтрация транзитивных связей
        return links.filter(({ source, target }) => {
            // Проверка, есть ли промежуточный узел
            return !nodeArray.some(k => 
                k !== source && k !== target &&
                adjacency[source][k] && adjacency[k][target]
            );
        });
    };

    useEffect(() => {
        if (!diagram || !diagram.levels || diagram.levels.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 400;

        const nodes = [];
        const links = [];

        // Распределение узлов по уровням
        diagram.levels.forEach((level, levelIndex) => {
            const levelHeight = height / (diagram.levels.length + 1);
            const y = (diagram.levels.length - levelIndex) * levelHeight;

            level.forEach((node, nodeIndex) => {
                const x = (width / (level.length + 1)) * (nodeIndex + 1);
                nodes.push({ id: node, x, y });
            });
        });

        // Предварительная фильтрация связей
        const filteredLinks = removeTransitiveLinks(diagram.links);

        // Создание связей на основе отфильтрованных данных
        diagram.levels.forEach((level, levelIndex) => {
            level.forEach(node => {
                diagram.levels.slice(levelIndex + 1).forEach(nextLevel => {
                    nextLevel.forEach(nextNode => {
                        if (filteredLinks.some(link => 
                            link.source === node && link.target === nextNode
                        )) {
                            links.push({ source: node, target: nextNode });
                        }
                    });
                });
            });
        });

        // Отрисовка уровней, связей и узлов аналогично предыдущим версиям...

        // Рисуем горизонтальные линии для уровней
        diagram.levels.forEach((level, levelIndex) => {
            const levelHeight = height / (diagram.levels.length + 1);
            const y = (diagram.levels.length - levelIndex) * levelHeight;

            svg.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
                .attr('stroke', '#ccc')
                .attr('stroke-dasharray', '5,5');

            svg.append('text')
                .attr('x', 10)
                .attr('y', y - 5)
                .text(`Уровень ${levelIndex + 1}`)
                .attr('font-size', 12)
                .attr('fill', '#333');
        });

        // Рисуем связи между узлами
        const link = svg
            .append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-width', 2);

        // Рисуем узлы
        const node = svg
            .append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 15)
            .attr('fill', '#4CAF50');

        // Добавляем текстовые метки к узлам
        const text = svg
            .append('g')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .text(d => d.id)
            .attr('font-size', 12)
            .attr('dx', -8)
            .attr('dy', 4);

        // Обновляем позиции
        function updatePositions() {
            link.attr('x1', d => nodes.find(n => n.id === d.source).x)
                .attr('y1', d => nodes.find(n => n.id === d.source).y)
                .attr('x2', d => nodes.find(n => n.id === d.target).x)
                .attr('y2', d => nodes.find(n => n.id === d.target).y);

            node.attr('cx', d => d.x)
                .attr('cy', d => d.y);

            text.attr('x', d => d.x)
                .attr('y', d => d.y);
        }

        updatePositions();
    }, [diagram]);

    return <svg ref={svgRef} width={600} height={400}></svg>;
};

export default HasseDiagram;