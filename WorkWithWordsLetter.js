import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Matrix from './Matrix';
import HasseDiagram from './HasseDiagram';
import {
    letterOrder,
    buildCoverMatrix,
    findMinElementsIndexes,
    findMaxElementsIndexes,
    buildHasseDiagramByLetter,
    compareByLetter,
} from '../utils/lab2Utils';

const WorkWithWordsLetter = () => {
    const navigate = useNavigate();
    const [words, setWords] = useState('');
    const [letterMatrix, setLetterMatrix] = useState([]);
    const [coverMatrix, setCoverMatrix] = useState([]);
    const [hasseDiagram, setHasseDiagram] = useState(null);
    const [result, setResult] = useState('');
    const [showResults, setShowResults] = useState(false);

    const handleCalculate = () => {
        try {
            const wordArray = words.split(' ').filter(Boolean);
            if (wordArray.length === 0) throw new Error('Введите хотя бы одно слово');

            // Построение матриц
            const letterMatrixData = letterOrder(wordArray);
            const coverMatrixData = buildCoverMatrix(wordArray, compareByLetter);

            // Поиск минимальных и максимальных элементов
            const minIndices = findMinElementsIndexes(letterMatrixData);
            const maxIndices = findMaxElementsIndexes(letterMatrixData);

            const minElements = minIndices.map(i => wordArray[i]);
            const maxElements = maxIndices.map(i => wordArray[i]);

            // Построение диаграммы Хассе
            const hasseDiagramData = buildHasseDiagramByLetter(wordArray);

            // Обновление состояний
            setLetterMatrix(letterMatrixData);
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
            <h1 style={styles.title}>Работа со словами (побуквенный порядок)</h1>

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

                    {/* Матрица побуквенного порядка */}
                    {letterMatrix.length > 0 && (
                        <div style={styles.matrixContainer}>
                            <h2 style={styles.matrixTitle}>Матрица побуквенного порядка:</h2>
                            <Matrix size={letterMatrix.length} matrix={letterMatrix} />
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
        width: '100%',
        maxWidth: '800px',
    },
    resultText: {
        fontSize: '14px',
        color: '#333',
        whiteSpace: 'pre-wrap',
    },
    matrixContainer: {
        marginTop: '20px',
    },
    matrixTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
    },
    hasseContainer: {
        marginTop: '20px',
    },
    hasseTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
    },
};

export default WorkWithWordsLetter;