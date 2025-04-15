import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EggBoxDiagram = ({ egg_box }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!egg_box) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 50, right: 60, bottom: 40, left: 120 };
        const boxWidth = 50;
        const boxHeight = 50;
        const boxSpacing = 20;

        // Получаем все уникальные L и R классы
        const uniqueLClasses = new Set();
        const uniqueRClasses = new Set();

        Object.values(egg_box).forEach(dClass => {
            Object.entries(dClass).forEach(([rClass, hClasses]) => {
                uniqueRClasses.add(rClass);
                hClasses.forEach(hClass => {
                    uniqueLClasses.add(hClass.join(','));
                });
            });
        });

        const lClassesList = Array.from(uniqueLClasses);
        const rClassesList = Array.from(uniqueRClasses);

        // Создаем основной контейнер
        const container = svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Добавляем метки L-классов
        lClassesList.forEach((lClass, i) => {
            const lLabel = container
                .append("g")
                .attr("transform", `translate(${i * (boxWidth + boxSpacing) + boxWidth/2}, -20)`);

            lLabel
                .append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "bold")
                .text("L");

            lLabel
                .append("text")
                .attr("x", 10)
                .attr("y", 0)
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "12px")
                .text(lClass);
        });

        // Добавляем метку R слева
        rClassesList.forEach((rClass, i) => {
            const rLabel = container
                .append("g")
                .attr("transform", `translate(-50, ${i * (boxHeight + boxSpacing) + boxHeight/2})`);

            rLabel
                .append("text")
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "bold")
                .text("R");

            rLabel
                .append("text")
                .attr("x", 10)
                .attr("y", 0)
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "12px")
                .text(rClass);
        });

        // Создаем ячейки
        Object.entries(egg_box).forEach(([dClass, rClasses]) => {
            Object.entries(rClasses).forEach(([rClass, hClasses]) => {
                const rIndex = rClassesList.indexOf(rClass);
                
                hClasses.forEach(hClass => {
                    const lIndex = lClassesList.indexOf(hClass.join(','));
                    
                    const cellGroup = container
                        .append("g")
                        .attr("transform", 
                            `translate(${lIndex * (boxWidth + boxSpacing)}, 
                                     ${rIndex * (boxHeight + boxSpacing)})`);

                    // Добавляем прямоугольник
                    cellGroup
                        .append("rect")
                        .attr("width", boxWidth)
                        .attr("height", boxHeight)
                        .attr("rx", 4)
                        .attr("ry", 4)
                        .attr("fill", "#f8f9fa")
                        .attr("stroke", "#6c757d")
                        .attr("stroke-width", 1.5);

                    // Добавляем элементы внутри ячейки
                    cellGroup
                        .append("text")
                        .attr("x", boxWidth / 2)
                        .attr("y", boxHeight / 2)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle")
                        .attr("font-size", "14px")
                        .text(hClass.join(','));
                });
            });
        });

        // Устанавливаем размеры SVG
        const totalWidth = lClassesList.length * (boxWidth + boxSpacing) - boxSpacing + margin.left + margin.right;
        const totalHeight = rClassesList.length * (boxHeight + boxSpacing) - boxSpacing + margin.top + margin.bottom;

        svg
            .attr("width", totalWidth)
            .attr("height", totalHeight)
            .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

    }, [egg_box]);

    return (
        <svg 
            ref={svgRef} 
            style={{ 
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                backgroundColor: "#fff",
                width: "100%",
                height: "auto",
                maxWidth: "1200px",
                margin: "20px auto",
                display: "block",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
        />
    );
};

export default EggBoxDiagram; 