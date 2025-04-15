import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Matrix from './Matrix';
import Graph from './Graph';
import HasseDiagram from './HasseDiagram';
import {
    buildComparisonMatrix,
    buildDivMatrix,
    findMinElementsIndexes,
    findMaxElementsIndexes,
    buildCoverMatrix,
    buildHasseDiagramNumbers,
} from '../utils/lab2Utils';

const WorkWithNumbers = () => {
    const navigate = useNavigate();
    const [numbers, setNumbers] = useState('');
    const [comparisonMatrix, setComparisonMatrix] = useState([]);
    const [divMatrix, setDivMatrix] = useState([]);
    const [coverMatrix, setCoverMatrix] = useState([]);
    const [hasseDiagram, setHasseDiagram] = useState(null);
    const [result, setResult] = useState('');
    const [showResults, setShowResults] = useState(false);

    const handleCalculate = () => {
        try {
            if (!numbers.trim()) throw new Error('Введите хотя бы одно число');

            const numArray = numbers.split(' ').map(Number);
            if (numArray.some(isNaN)) throw new Error('Введите корректные числа');

            // Построение матриц
            const compMatrix = buildComparisonMatrix(numArray);
            const divMatrixData = buildDivMatrix(numArray);
            const coverMatrixData = buildCoverMatrix(numArray, (x, y) => x < y && y % x === 0);

            // Поиск минимальных и максимальных элементов
            const minIndices = findMinElementsIndexes(divMatrixData);
            const maxIndices = findMaxElementsIndexes(divMatrixData);

            const minElements = minIndices.map(i => numArray[i]);
            const maxElements = maxIndices.map(i => numArray[i]);

            // Построение диаграммы Хассе
            const hasseDiagramData = buildHasseDiagramNumbers(numArray);

            // Обновление состояний
            setComparisonMatrix(compMatrix);
            setDivMatrix(divMatrixData);
            setCoverMatrix(coverMatrixData);
            setHasseDiagram(hasseDiagramData);

            // Формирование результата
            let resultText = '';

            // Вывод минимальных элементов
            if (minElements.length > 0) {
                resultText += `Минимальные элементы: ${minElements.join(', ')}\n`;
                if (minElements.length === 1) {
                    resultText += `Наименьший элемент: ${minElements[0]}\n`;
                } else {
                    resultText += "Наименьшего элемента нет\n";
                }
            } else {
                resultText += "Минимальных элементов нет\n";
            }

            // Вывод максимальных элементов
            if (maxElements.length > 0) {
                resultText += `Максимальные элементы: ${maxElements.join(', ')}\n`;
                if (maxElements.length === 1) {
                    resultText += `Наибольший элемент: ${maxElements[0]}\n`;
                } else {
                    resultText += "Наибольшего элемента нет\n";
                }
            } else {
                resultText += "Максимальных элементов нет\n";
            }

            setResult(resultText);
            setShowResults(true);
        } catch (error) {
            setResult(`Ошибка: ${error.message}`);
            setShowResults(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Кнопка возврата */}
            <button onClick={() => navigate('/lab2')} style={styles.backButton}>
                ← Назад
            </button>

            {/* Заголовок */}
            <h1 style={styles.title}>Работа с числами</h1>

            {/* Ввод чисел */}
            <div style={styles.inputContainer}>
                <label style={styles.label}>Введите числа через пробел:</label>
                <input
                    type="text"
                    value={numbers}
                    onChange={(e) => setNumbers(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleCalculate} style={styles.calculateButton}>
                    Рассчитать
                </button>
            </div>

            {/* Отображение результатов */}
            {showResults && (
                <div style={styles.resultContainer}>
                    <pre style={styles.resultText}>{result}</pre>

                    {/* Матрица сравнения чисел по величине */}
                    {comparisonMatrix.length > 0 && (
                        <div style={styles.matrixContainer}>
                            <h2 style={styles.matrixTitle}>Матрица сравнения чисел по величине:</h2>
                            <Matrix size={comparisonMatrix.length} matrix={comparisonMatrix} />
                        </div>
                    )}

                    {/* Матрица порядка делимости */}
                    {divMatrix.length > 0 && (
                        <div style={styles.matrixContainer}>
                            <h2 style={styles.matrixTitle}>Матрица порядка делимости:</h2>
                            <Matrix size={divMatrix.length} matrix={divMatrix} />
                        </div>
                    )}

                    {/* Матрица покрытия */}
                    {coverMatrix.length > 0 && (
                        <div style={styles.matrixContainer}>
                            <h2 style={styles.matrixTitle}>Матрица покрытия:</h2>
                            <Matrix size={coverMatrix.length} matrix={coverMatrix} />
                        </div>
                    )}

                    {/* Диаграмма Хассе */}
                    {hasseDiagram && (
                        <div style={styles.hasseContainer}>
                            <h2 style={styles.hasseTitle}>Диаграмма Хассе:</h2>
                            <HasseDiagram diagram={hasseDiagram} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
    },
    title: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '50px',
    },
    backButton: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#FF5722',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    inputContainer: {
        marginBottom: '20px',
    },
    label: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '300px',
    },
    calculateButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    resultContainer: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    resultText: {
        fontSize: '16px',
        color: '#555',
    },
    matrixContainer: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    matrixTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    graphContainer: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    graphTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    hasseContainer: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    hasseTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
};

export default WorkWithNumbers;