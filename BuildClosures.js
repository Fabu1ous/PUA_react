// BuildClosures.js
import React, { useState } from 'react';
import Graph from './Graph';
import { useNavigate } from 'react-router-dom';

const BuildClosures = () => {
    const [matrixSize, setMatrixSize] = useState('');
    const [matrix, setMatrix] = useState([]);
    const [result, setResult] = useState('');
    const [graphs, setGraphs] = useState({});
    const navigate = useNavigate();

    const handleCreateMatrix = () => {
        const size = parseInt(matrixSize, 10);
        if (isNaN(size) || size <= 0) {
            alert('Некорректный размер матрицы');
            return;
        }
        const initialMatrix = Array.from({ length: size }, () => Array(size).fill(0));
        setMatrix(initialMatrix);
        setResult('');
        setGraphs({});
    };

    const handleMatrixChange = (i, j) => {
        const newMatrix = [...matrix];
        newMatrix[i][j] = newMatrix[i][j] === 0 ? 1 : 0;
        setMatrix(newMatrix);
    };

    const handleCalculate = () => {
        const reflexive = reflexiveClosure(matrix);
        const symmetric = symmetricClosure(matrix);
        const transitive = transitiveClosure(matrix);
        const equivalence = equivalenceClosure(matrix);

        setResult({
            reflexive: reflexive,
            symmetric: symmetric,
            transitive: transitive,
            equivalence: equivalence,
        });

        setGraphs({
            reflexive: reflexive,
            symmetric: symmetric,
            transitive: transitive,
            equivalence: equivalence,
        });
    };

    const reflexiveClosure = (matrix) => {
        const closure = matrix.map((row) => [...row]);
        for (let i = 0; i < closure.length; i++) {
            closure[i][i] = 1;
        }
        return closure;
    };

    const symmetricClosure = (matrix) => {
        const closure = matrix.map((row) => [...row]);
        for (let i = 0; i < closure.length; i++) {
            for (let j = 0; j < closure.length; j++) {
                if (closure[i][j]) {
                    closure[j][i] = 1;
                }
            }
        }
        return closure;
    };

    const transitiveClosure = (matrix) => {
        const closure = matrix.map((row) => [...row]);
        for (let k = 0; k < closure.length; k++) {
            for (let i = 0; i < closure.length; i++) {
                for (let j = 0; j < closure.length; j++) {
                    closure[i][j] = closure[i][j] || (closure[i][k] && closure[k][j]);
                }
            }
        }
        return closure;
    };

    const equivalenceClosure = (matrix) => {
        const reflexive = reflexiveClosure(matrix);
        const symmetric = symmetricClosure(reflexive);
        const transitive = transitiveClosure(symmetric);
        return transitive;
    };

    const renderMatrix = (matrix, title) => (
        <div style={{ marginBottom: '20px' }}>
            <h3>{title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrix.length}, 40px)`, gap: '2px', justifyContent: 'center' }}>
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
                                cursor: 'default',
                                transition: 'background-color 0.2s ease',
                                borderRadius: '4px',
                            }}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
            {/* Кнопка возврата */}
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#FF5722',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                }}
            >
                ← Главное меню
            </button>

            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Построение замыканий</h1>

            {/* Ввод размера матрицы */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <label style={{ marginRight: '10px', fontSize: '18px', color: '#333' }}>Размер матрицы:</label>
                <input
                    type="number"
                    value={matrixSize}
                    onChange={(e) => setMatrixSize(e.target.value)}
                    style={{
                        padding: '8px',
                        fontSize: '16px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        width: '100px',
                    }}
                />
                <button
                    onClick={handleCreateMatrix}
                    style={{
                        marginLeft: '10px',
                        padding: '8px 15px',
                        fontSize: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Создать матрицу
                </button>
            </div>

            {/* Отображение матрицы */}
            {matrix.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Матрица</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrix.length}, 40px)`, gap: '2px', justifyContent: 'center' }}>
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
                                        transition: 'background-color 0.2s ease',
                                        borderRadius: '4px',
                                    }}
                                    onClick={() => handleMatrixChange(i, j)}
                                >
                                    {cell}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Кнопка "Рассчитать" */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                    onClick={handleCalculate}
                    style={{
                        padding: '8px 15px',
                        fontSize: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Рассчитать
                </button>
            </div>

            {/* Отображение результатов */}
            {result && (
                <div>
                    <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Результаты</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Рефлексивное замыкание */}
                        <div>
                            {renderMatrix(result.reflexive, 'Рефлексивное замыкание')}
                            <Graph matrix={graphs.reflexive} />
                        </div>

                        {/* Симметричное замыкание */}
                        <div>
                            {renderMatrix(result.symmetric, 'Симметричное замыкание')}
                            <Graph matrix={graphs.symmetric} />
                        </div>

                        {/* Транзитивное замыкание */}
                        <div>
                            {renderMatrix(result.transitive, 'Транзитивное замыкание')}
                            <Graph matrix={graphs.transitive} />
                        </div>

                        {/* Эквивалентное замыкание */}
                        <div>
                            {renderMatrix(result.equivalence, 'Эквивалентное замыкание')}
                            <Graph matrix={graphs.equivalence} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildClosures;