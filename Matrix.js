import React, { useState } from 'react';
import Graph from './Graph';

const Matrix = ({ size, matrix: initialMatrix }) => {
    const [matrix, setMatrix] = useState(initialMatrix || Array.from({ length: size }, () => Array(size).fill(0)));
    const [result, setResult] = useState('');

    // Обработка клика по ячейке матрицы
    const handleCellClick = (i, j) => {
        const newMatrix = [...matrix];
        newMatrix[i][j] = newMatrix[i][j] === 0 ? 1 : 0;
        setMatrix(newMatrix);
        updateResults(newMatrix); // Обновление результатов при изменении матрицы
    };

    // Проверка рефлексивности
    const isReflexive = (matrix) => matrix.every((row, i) => row[i] === 1);

    // Проверка симметричности
    const isSymmetric = (matrix) =>
        matrix.every((row, i) => row.every((cell, j) => cell === matrix[j][i]));

    // Проверка транзитивности
    const isTransitive = (matrix) =>
        matrix.every((row, i) =>
            row.every((cell, j) =>
                !cell || matrix[j].every((_, k) => !matrix[j][k] || matrix[i][k])
            )
        );

    // Проверка антисимметричности
    const isAntisymmetric = (matrix) =>
        matrix.every((row, i) =>
            row.every((cell, j) => !(cell && matrix[j][i]) || i === j)
        );

    // Поиск классов эквивалентности
    const findEquivalenceClasses = (matrix) => {
        const classes = [];
        for (let i = 0; i < matrix.length; i++) {
            const class_i = matrix[i]
                .map((value, j) => (value ? j + 1 : null))
                .filter((value) => value !== null);
            if (
                !classes.some((cls) =>
                    cls.length === class_i.length && cls.every((v, idx) => v === class_i[idx])
                )
            ) {
                classes.push(class_i);
            }
        }
        return classes;
    };

    // Формирование фактор-множества и полной системы представителей
    const generateFactorSetAndRepresentatives = (classes) => {
        const factorSet = classes.map((cls, index) => `Класс ${index + 1}: ${cls}`);
        const representatives = classes.map((cls, index) => `Представитель класса ${index + 1}: ${cls[0]}`);
        return { factorSet, representatives };
    };

    // Обновление результатов
    const updateResults = (matrix) => {
        const reflexive = isReflexive(matrix);
        const symmetric = isSymmetric(matrix);
        const transitive = isTransitive(matrix);
        const antisymmetric = isAntisymmetric(matrix);
        const equivalence = reflexive && symmetric && transitive;

        let resultText = (
            `Рефлексивность: ${reflexive ? 'Да' : 'Нет'}\n` +
            `Симметричность: ${symmetric ? 'Да' : 'Нет'}\n` +
            `Транзитивность: ${transitive ? 'Да' : 'Нет'}\n` +
            `Антисимметричность: ${antisymmetric ? 'Да' : 'Нет'}\n` +
            `Эквивалентность: ${equivalence ? 'Да' : 'Нет'}\n`
        );

        if (equivalence) {
            const classes = findEquivalenceClasses(matrix);
            const { factorSet, representatives } = generateFactorSetAndRepresentatives(classes);

            resultText += '\nКлассы эквивалентности:\n';
            classes.forEach((cls, index) => {
                resultText += `Класс ${index + 1}: ${cls.join(', ')}\n`;
            });

            resultText += '\nФактор-множество:\n';
            factorSet.forEach((cls) => {
                resultText += `${cls}\n`;
            });

            resultText += '\nПолная система представителей:\n';
            representatives.forEach((rep) => {
                resultText += `${rep}\n`;
            });
        }

        setResult(resultText);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            {/* Матрица */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Матрица</h3>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 40px)` }}>
                    {matrix.map((row, i) =>
                        row.map((cell, j) => (
                            <div
                                key={`${i}-${j}`}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid black',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: cell === 1 ? '#4CAF50' : '#FF5722',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleCellClick(i, j)}
                            >
                                {cell}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Граф */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Граф</h3>
                <Graph matrix={matrix} />
            </div>

            {/* Результаты */}
            <div>
                <h3>Результаты</h3>
                <pre>{result}</pre>
            </div>
        </div>
    );
};

export default Matrix;