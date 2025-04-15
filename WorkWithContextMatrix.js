import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConceptLatticeDiagram from './ConceptLatticeDiagram';
import {
    buildClosures,
    buildConcepts,
    buildHasseDiagramContext,
    getObjectsAndAttributes,
} from '../utils/lab2Utils';

const WorkWithContextMatrix = () => {
    const navigate = useNavigate();

    // State для работы с данными
    const [matrixSize, setMatrixSize] = useState('');
    const [contextMatrix, setContextMatrix] = useState([]);
    const [objects, setObjects] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [closures, setClosures] = useState([]);
    const [concepts, setConcepts] = useState([]);
    const [hasseDiagram, setHasseDiagram] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [showMatrix, setShowMatrix] = useState(false);

    // Создание пустой матрицы заданного размера
    const handleCreateMatrix = () => {
        const parsedSize = parseInt(matrixSize, 10);
        if (isNaN(parsedSize) || parsedSize <= 0) {
            alert("Введите корректный размер матрицы.");
            return;
        }

        // Создаём пустую матрицу с нулями
        const newMatrix = Array.from({ length: parsedSize }, () => Array(parsedSize).fill(0));
        setContextMatrix(newMatrix);
        console.log("Созданная матрица контекста:", newMatrix); // Отладка
        setShowMatrix(true);
        setShowResults(false);
    };

    // Обработка клика по ячейке матрицы
    const handleCellClick = (rowIndex, colIndex) => {
        const newMatrix = [...contextMatrix];
        newMatrix[rowIndex][colIndex] = newMatrix[rowIndex][colIndex] === 0 ? 1 : 0;
        setContextMatrix(newMatrix);
    };

    const validateContextMatrix = (matrix, size) => {
        if (!matrix || !Array.isArray(matrix)) {
            throw new Error("Матрица контекста не определена");
        }
        if (matrix.length !== size) {
            throw new Error("Неверный размер матрицы");
        }
        for (let row of matrix) {
            if (!Array.isArray(row) || row.length !== size) {
                throw new Error("Неверный формат матрицы");
            }
            if (!row.every(cell => cell === 0 || cell === 1)) {
                throw new Error("Матрица должна содержать только 0 и 1");
            }
        }
    };

    // Рассчёт данных на основе введённой матрицы
    const handleCalculate = () => {
        try {
            const parsedSize = parseInt(matrixSize, 10);
            validateContextMatrix(contextMatrix, parsedSize);
            if (isNaN(parsedSize) || parsedSize <= 0) {
                throw new Error("Размер матрицы должен быть положительным числом.");
            }

            // Получение объектов и атрибутов
            const { objects: newObjects, attributes: newAttributes } = getObjectsAndAttributes(parsedSize, parsedSize);
            setObjects(newObjects);
            setAttributes(newAttributes);

            console.log("Матрица контекста:", contextMatrix);
            console.log("Объекты:", newObjects);
            console.log("Атрибуты:", newAttributes);

            // Построение замыканий
            const newClosures = buildClosures(newObjects, contextMatrix, newAttributes);
            setClosures(newClosures);
            console.log("Замыкания:", newClosures);

            // Построение концептов
            const newConcepts = buildConcepts(newClosures, newAttributes, contextMatrix);
            setConcepts(newConcepts);
            console.log("Концепты:", newConcepts);

            // Построение диаграммы Хассе
            const hasseDiagramData = buildHasseDiagramContext(newConcepts);
            setHasseDiagram(hasseDiagramData);
            console.log("Диаграмма Хассе:", hasseDiagramData);

            setShowResults(true);
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error(error);
        }
    };

    // Обновленный рендеринг результатов
    const renderResults = () => (
        <div style={styles.resultContainer}>
            <h3 style={styles.resultTitle}>Результаты:</h3>

            <div style={styles.resultBlock}>
                <h4 style={styles.resultSubtitle}>Объекты (G):</h4>
                <p>{objects.map(obj => `g${obj}`).join(', ')}</p>
            </div>

            <div style={styles.resultBlock}>
                <h4 style={styles.resultSubtitle}>Атрибуты (M):</h4>
                <p>{attributes.join(', ')}</p>
            </div>

            <div style={styles.resultBlock}>
                <h4 style={styles.resultSubtitle}>Замыкания (Zfg):</h4>
                <ul style={styles.list}>
                    {closures.map((closure, index) => (
                        <li key={index}>
                            ({closure.objects.map(obj => `g${obj}`).join(', ')}) → [{closure.attributes.join(', ')}]
                        </li>
                    ))}
                </ul>
            </div>

            <div style={styles.resultBlock}>
                <h4 style={styles.resultSubtitle}>Концепты (Fi):</h4>
                <ul style={styles.list}>
                    {concepts.map((concept, index) => (
                        <li key={index}>
                            ({concept.objects.map(obj => `g${obj}`).join(', ')}, {concept.attributes.join(', ')})
                        </li>
                    ))}
                </ul>
            </div>

            {hasseDiagram && hasseDiagram.levels.length > 0 && (
                <div style={styles.hasseContainer}>
                    <h4 style={styles.resultSubtitle}>Решетка концептов:</h4>
                    <ConceptLatticeDiagram diagram={hasseDiagram} />
                </div>
            )}
        </div>
    );

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/')} style={styles.backButton}>
                ← Главное меню
            </button>
            <h1 style={styles.title}>Работа с матрицей контекста</h1>

            <div style={styles.inputContainer}>
                <label style={styles.label}>Введите размер матрицы:</label>
                <input
                    type="number"
                    value={matrixSize}
                    onChange={(e) => setMatrixSize(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleCreateMatrix} style={styles.calculateButton}>
                    Создать матрицу
                </button>
            </div>

            {showMatrix && (
                <div style={styles.matrixContainer}>
                    <h3 style={styles.matrixTitle}>Заполните матрицу:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${matrixSize}, 40px)` }}>
                        {contextMatrix.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
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
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    {cell}
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={handleCalculate} style={styles.calculateButton}>
                        Рассчитать
                    </button>
                </div>
            )}

            {showResults && renderResults()}
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
        marginBottom: '10px',
    },
    calculateButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '10px',
    },
    matrixContainer: {
        marginTop: '20px',
    },
    matrixTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    resultContainer: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '800px',
    },
    resultTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
    },
    resultSubtitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: '10px',
    },
    resultBlock: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
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

export default WorkWithContextMatrix;