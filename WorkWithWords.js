import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Matrix from './Matrix';
import HasseDiagram from './HasseDiagram';
import {
    lexicographicOrder,
    findMinElementsIndexes,
    findMaxElementsIndexes,
    buildCoverMatrix,
    buildHasseDiagram,
    lexicographicComparison,
} from '../utils/lab2Utils';

const WorkWithWords = () => {
    const navigate = useNavigate();
    const [words, setWords] = useState('');
    const [lexMatrix, setLexMatrix] = useState([]);
    const [coverMatrix, setCoverMatrix] = useState([]);
    const [hasseDiagram, setHasseDiagram] = useState([]);
    const [result, setResult] = useState('');
    const [showResults, setShowResults] = useState(false);

    const handleCalculate = () => {
        try {
            if (!words.trim()) throw new Error('Введите хотя бы одно слово');

            const wordArray = words.split(' ');
            if (wordArray.some(word => !word.trim())) throw new Error('Введите корректные слова');

            // Построение матриц
            const lexMatrixData = lexicographicOrder(wordArray);
            const coverMatrixData = buildCoverMatrix(wordArray, lexicographicComparison);

            // Поиск минимальных и максимальных элементов
            const minIndices = findMinElementsIndexes(lexMatrixData);
            const maxIndices = findMaxElementsIndexes(lexMatrixData);

            const minElements = minIndices.map(i => wordArray[i]);
            const maxElements = maxIndices.map(i => wordArray[i]);

            // Построение диаграммы Хассе
            const hasseDiagramData = buildHasseDiagram(wordArray, lexicographicOrder);

            // Обновление состояний
            setLexMatrix(lexMatrixData);
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
            <h1 style={styles.title}>Работа со словами (лексикографический порядок)</h1>

            {/* Ввод слов */}
            <div style={styles.inputContainer}>
                <label style={styles.label}>Введите слова через пробел:</label>
                <input
                    type="text"
                    value={words}
                    onChange={(e) => setWords(e.target.value)}
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

                    {/* Матрица лексикографического порядка */}
                    {lexMatrix.length > 0 && (
                        <div style={styles.matrixContainer}>
                            <h3 style={styles.matrixTitle}>Матрица лексикографического порядка:</h3>
                            <Matrix size={lexMatrix.length} matrix={lexMatrix} />
                        </div>
                    )}

                    {/* Матрица покрытия */}
                    {coverMatrix.length > 0 && (
                        <div style={styles.matrixContainer}>
                            <h3 style={styles.matrixTitle}>Матрица покрытия:</h3>
                            <Matrix size={coverMatrix.length} matrix={coverMatrix} />
                        </div>
                    )}

                    {/* Диаграмма Хассе */}
                    {hasseDiagram.levels.length > 0 && (
                        <div style={styles.hasseContainer}>
                            <h3 style={styles.hasseTitle}>Диаграмма Хассе:</h3>
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

export default WorkWithWords;
