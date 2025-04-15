import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    isAssociative,
    elementOrder,
    generateSubsemigroup,
    generateSemigroupOfRelations,
    validateMatrix,
    compositionMatrix
} from '../utils/lab3Utils';
import CayleyGraph from './CayleyGraph';

const Lab3 = () => {
    const navigate = useNavigate();
    const [activeTask, setActiveTask] = useState(null);
    const [setElements, setSetElements] = useState('');
    const [elementsArray, setElementsArray] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [subset, setSubset] = useState('');
    const [results, setResults] = useState('');
    const [showMatrix, setShowMatrix] = useState(false);
    const [matrices, setMatrices] = useState([]);
    const [currentMatrix, setCurrentMatrix] = useState(null);

    // Генерация цветов для элементов множества
    const elementColors = useMemo(() => {
        if (!elementsArray.length) return {};
        const colors = {};

        // Определяем базовые цвета градиента
        const startColor = { r: 0xce, g: 0xdd, b: 0xd6 };
        const middleColor = { r: 0xb9, g: 0xba, b: 0xbf };
        const endColor = { r: 0xf1, g: 0xbf, b: 0xa4 };

        // Функция для интерполяции между двумя цветами
        const interpolateColor = (color1, color2, factor) => {
            return {
                r: Math.round(color1.r + (color2.r - color1.r) * factor),
                g: Math.round(color1.g + (color2.g - color1.g) * factor),
                b: Math.round(color1.b + (color2.b - color1.b) * factor)
            };
        };

        // Функция для преобразования RGB в HEX
        const rgbToHex = (r, g, b) => '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');

        elementsArray.forEach((element, index) => {
            const position = index / (elementsArray.length - 1);
            let color;

            if (position <= 0.5) {
                // Интерполяция между начальным и средним цветом
                const factor = position * 2;
                color = interpolateColor(startColor, middleColor, factor);
            } else {
                // Интерполяция между средним и конечным цветом
                const factor = (position - 0.5) * 2;
                color = interpolateColor(middleColor, endColor, factor);
            }

            colors[element] = rgbToHex(color.r, color.g, color.b);
        });

        return colors;
    }, [elementsArray]);

    // Обработка ввода элементов множества
    const handleSetElementsSubmit = () => {
        const elements = setElements.trim().split(/\s+/).filter(Boolean);
        if (elements.length === 0) {
            alert("Введите элементы множества");
            return;
        }
        setElementsArray(elements);
        const size = elements.length;
        const newMatrix = Array(size).fill().map(() => Array(size).fill(elements[0]));
        setMatrix(newMatrix);
        setShowMatrix(true);
    };

    // Сброс состояния при смене задания
    const handleTaskChange = (taskNumber) => {
        setActiveTask(taskNumber);
        setSetElements('');
        setElementsArray([]);
        setMatrix([]);
        setSubset('');
        setResults('');
        setShowMatrix(false);
        setMatrices([]);
    };

    // Обработка клика по ячейке матрицы
    const handleCellClick = (rowIndex, colIndex) => {
        const newMatrix = [...matrix];
        const currentValue = newMatrix[rowIndex][colIndex];
        const currentIndex = elementsArray.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % elementsArray.length;
        newMatrix[rowIndex][colIndex] = elementsArray[nextIndex];
        setMatrix(newMatrix);
    };

    // Преобразование матрицы для вычислений
    const convertMatrixForCalculations = () => {
        return matrix.map(row => 
            row.map(cell => elementsArray.indexOf(cell))
        );
    };

    // Обработка задачи 1 (проверка ассоциативности и порядок элементов)
    const handleTask1 = () => {
        try {
            const numericMatrix = convertMatrixForCalculations();
            const associative = isAssociative(numericMatrix);
            let result = `Операция ${associative ? 'ассоциативна' : 'не ассоциативна'}\n\n`;
            
            result += 'Порядки элементов:\n';
            for (let i = 0; i < numericMatrix.length; i++) {
                const order = elementOrder(numericMatrix, i);
                result += `Порядок элемента ${elementsArray[i]}: ${order}\n`;
            }
            
            setResults(result);
        } catch (error) {
            alert(error.message);
        }
    };

    // Обработка задачи 2 (построение подполугруппы)
    const handleTask2 = () => {
        try {
            const numericMatrix = convertMatrixForCalculations();
            const subsetElements = subset.trim().split(/\s+/).filter(Boolean);
            
            if (subsetElements.length === 0) {
                throw new Error("Введите корректное подмножество");
            }

            // Проверяем, что все элементы подмножества есть в основном множестве
            const invalidElements = subsetElements.filter(elem => !elementsArray.includes(elem));
            if (invalidElements.length > 0) {
                throw new Error(`Элементы ${invalidElements.join(', ')} не принадлежат исходному множеству`);
            }

            const subsetIndices = subsetElements.map(elem => elementsArray.indexOf(elem));
            const subsemigroup = generateSubsemigroup(numericMatrix, subsetIndices);
            const resultElements = subsemigroup.map(index => elementsArray[index]);
            
            setResults(`Подполугруппа: {${resultElements.join(', ')}}`);
        } catch (error) {
            alert(error.message);
        }
    };

    // Обработка задачи 3 (построение полугруппы бинарных отношений)
    const handleTask3 = () => {
        try {
            if (matrices.length === 0) {
                throw new Error("Добавьте хотя бы одну матрицу");
            }

            // Добавляем текущую матрицу, если она не пустая
            let allMatrices = [...matrices];
            const currentNumericMatrix = matrix.map(row => 
                row.map(cell => cell === '1' ? 1 : 0)
            );
            
            // Проверяем, содержит ли текущая матрица хотя бы одну единицу
            const hasOnes = currentNumericMatrix.some(row => row.some(cell => cell === 1));
            if (hasOnes) {
                allMatrices.push(currentNumericMatrix);
            }
            
            console.log("Исходные матрицы:", allMatrices);
            const semigroup = generateSemigroupOfRelations(allMatrices);
            console.log("Полученная полугруппа:", semigroup);

            // Создаем массив для хранения всех произведений матриц
            const allProducts = new Array(semigroup.length).fill(null);
            
            // Находим все произведения матриц для новых матриц
            for (let i = allMatrices.length; i < semigroup.length; i++) {
                const products = [];
                const currentMatrix = semigroup[i];
                
                // Функция для поиска всех возможных произведений
                const findAllProducts = (target, maxDepth = 3) => {
                    const found = [];
                    
                    const search = (current, path = [], depth = 0) => {
                        if (depth >= maxDepth) return;
                        
                        for (let j = 0; j < allMatrices.length; j++) {
                            const newPath = [...path, j];
                            let result = allMatrices[j];
                            
                            // Вычисляем произведение матриц в пути
                            for (let k = path.length - 1; k >= 0; k--) {
                                result = compositionMatrix(allMatrices[path[k]], result);
                            }
                            
                            if (JSON.stringify(result) === JSON.stringify(target)) {
                                found.push(newPath);
                            } else {
                                search(target, newPath, depth + 1);
                            }
                        }
                    };
                    
                    search(target);
                    return found;
                };
                
                // Находим все возможные пути получения текущей матрицы
                const allPaths = findAllProducts(currentMatrix);
                
                if (allPaths.length > 0) {
                    // Выбираем самый короткий путь
                    const shortestPath = allPaths.reduce((a, b) => a.length <= b.length ? a : b);
                    
                    // Формируем обозначение
                    let notation = '';
                    const counts = new Map();
                    
                    shortestPath.forEach(idx => {
                        const symbol = idx === 0 ? "F" : idx === 1 ? "g" : `f${idx + 1}`;
                        counts.set(symbol, (counts.get(symbol) || 0) + 1);
                    });
                    
                    // Создаем обозначение с надстрочными степенями
                    const notationParts = [];
                    for (const [symbol, count] of counts) {
                        if (count > 1) {
                            notationParts.push(<span key={symbol}>{symbol}<sup>{count}</sup></span>);
                        } else {
                            notationParts.push(<span key={symbol}>{symbol}</span>);
                        }
                    }
                    
                    allProducts[i] = notationParts;
                }
            }
            
            const result = (
                <div>
                    <h3>Полугруппа, порождённая матрицами</h3>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <h4>Исходные матрицы:</h4>
                        <div style={styles.matricesGrid}>
                            {allMatrices.map((m, i) => (
                                <MatrixDisplay 
                                    key={i} 
                                    matrix={m} 
                                    label={i === 0 ? "F" : i === 1 ? "g" : `f${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {semigroup.length > allMatrices.length && (
                        <div style={{ marginBottom: '30px' }}>
                            <h4>Новые матрицы полугруппы:</h4>
                            <div style={styles.matricesGrid}>
                                {semigroup.slice(allMatrices.length).map((m, i) => {
                                    const index = i + allMatrices.length;
                                    if (!allProducts[index]) return null;
                                    return (
                                        <MatrixDisplay 
                                            key={i} 
                                            matrix={m} 
                                            label={allProducts[index]}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4>Таблица Кэли:</h4>
                        <CayleyTable 
                            semigroup={semigroup}
                            allMatrices={allMatrices}
                            allProducts={allProducts}
                        />
                    </div>
                </div>
            );

            setResults(result);
        } catch (error) {
            alert(error.message);
        }
    };

    // Создание новой бинарной матрицы
    const handleCreateBinaryMatrix = () => {
        const size = parseInt(setElements, 10);
        if (isNaN(size) || size <= 0) {
            alert("Введите корректный размер матрицы");
            return;
        }
        const newMatrix = Array(size).fill().map(() => Array(size).fill('0'));
        setMatrix(newMatrix);
        setShowMatrix(true);
        setCurrentMatrix(matrices.length); // Индекс новой матрицы
    };

    // Добавление текущей матрицы в список
    const handleAddMatrix = async () => {
        try {
            const numericMatrix = matrix.map(row => 
                row.map(cell => cell === '1' ? 1 : 0)
            );
            validateMatrix(numericMatrix);
            
            console.log("Добавляем матрицу:", numericMatrix);
            console.log("Текущий индекс:", currentMatrix);
            console.log("Текущие матрицы:", matrices);
            
            const updatedMatrices = [...matrices, numericMatrix];
            console.log("Обновленные матрицы:", updatedMatrices);
            await setMatrices(updatedMatrices);
            
            // Создаем новую пустую матрицу того же размера
            const newEmptyMatrix = Array(matrix.length).fill().map(() => Array(matrix.length).fill('0'));
            setMatrix(newEmptyMatrix);
            setCurrentMatrix(updatedMatrices.length);
        } catch (error) {
            alert(error.message);
        }
    };

    // Удаление матрицы
    const handleDeleteMatrix = (index) => {
        const updatedMatrices = matrices.filter((_, i) => i !== index);
        setMatrices(updatedMatrices);
        if (currentMatrix === index) {
            setMatrix(Array(matrix.length).fill().map(() => Array(matrix.length).fill('0')));
            setCurrentMatrix(null);
        } else if (currentMatrix > index) {
            setCurrentMatrix(currentMatrix - 1);
        }
    };

    // Обновление значения в матрице
    const handleMatrixCellClick = (matrixIndex, rowIndex, colIndex) => {
        const updatedMatrices = [...matrices];
        updatedMatrices[matrixIndex] = updatedMatrices[matrixIndex].map((row, i) => 
            row.map((cell, j) => 
                i === rowIndex && j === colIndex ? (cell === 1 ? 0 : 1) : cell
            )
        );
        setMatrices(updatedMatrices);
    };

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/')} style={styles.backButton}>
                ← Главное меню
            </button>
            <h1 style={styles.title}>Лабораторная работа 3: Теория полугрупп</h1>

            <div style={styles.taskButtons}>
                <button 
                    style={styles.taskButton} 
                    onClick={() => handleTaskChange(1)}
                >
                    Задача 1: Проверка ассоциативности и порядок элементов
                </button>
                <button 
                    style={styles.taskButton} 
                    onClick={() => handleTaskChange(2)}
                >
                    Задача 2: Построение подполугруппы
                </button>
                <button 
                    style={styles.taskButton} 
                    onClick={() => handleTaskChange(3)}
                >
                    Задача 3: Построение полугруппы бинарных отношений
                </button>
            </div>

            {activeTask === 1 && (
                <div style={styles.inputContainer}>
                    <label style={styles.label}>
                        Элементы множества (через пробел):
                        <input
                            type="text"
                            value={setElements}
                            onChange={(e) => setSetElements(e.target.value)}
                            style={styles.input}
                        />
                    </label>
                    <button 
                        onClick={handleSetElementsSubmit}
                        style={styles.button}
                    >
                        Подтвердить
                    </button>

                    {showMatrix && (
                        <div style={styles.matrixContainer}>
                            <div style={styles.matrix}>
                                {matrix.map((row, i) => (
                                    <div key={i} style={styles.row}>
                                        {row.map((cell, j) => (
                                            <div
                                                key={j}
                                                onClick={() => handleCellClick(i, j)}
                                                style={{
                                                    ...styles.cell,
                                                    backgroundColor: elementColors[cell],
                                                    color: '#000000',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {cell}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleTask1}
                                style={styles.button}
                            >
                                Вычислить
                            </button>

                            {results && (
                                <div style={styles.results}>
                                    <pre>{results}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTask === 2 && (
                <div style={styles.inputContainer}>
                    <label style={styles.label}>
                        Элементы множества (через пробел):
                        <input
                            type="text"
                            value={setElements}
                            onChange={(e) => setSetElements(e.target.value)}
                            style={styles.input}
                        />
                    </label>
                    <button 
                        onClick={handleSetElementsSubmit}
                        style={styles.button}
                    >
                        Подтвердить
                    </button>

                    {showMatrix && (
                        <div style={styles.matrixContainer}>
                            <div style={styles.matrix}>
                                {matrix.map((row, i) => (
                                    <div key={i} style={styles.row}>
                                        {row.map((cell, j) => (
                                            <div
                                                key={j}
                                                onClick={() => handleCellClick(i, j)}
                                                style={{
                                                    ...styles.cell,
                                                    backgroundColor: elementColors[cell],
                                                    color: '#000000',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {cell}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <label style={styles.label}>
                                Подмножество (через пробел):
                                <input
                                    type="text"
                                    value={subset}
                                    onChange={(e) => setSubset(e.target.value)}
                                    style={styles.input}
                                />
                            </label>

                            <button
                                onClick={handleTask2}
                                style={styles.button}
                            >
                                Вычислить
                            </button>

                            {results && (
                                <div style={styles.results}>
                                    <pre>{results}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTask === 3 && (
                <div style={styles.inputContainer}>
                    <div style={styles.horizontalContainer}>
                        <label style={styles.horizontalLabel}>
                            Размер матрицы:
                            <input
                                type="number"
                                value={setElements}
                                onChange={(e) => setSetElements(e.target.value)}
                                style={styles.input}
                                min="1"
                            />
                        </label>
                        <button 
                            onClick={handleCreateBinaryMatrix}
                            style={styles.button}
                        >
                            Создать матрицу
                        </button>
                    </div>

                    {showMatrix && (
                        <div style={styles.matrixContainer}>
                            <div style={styles.matricesGrid}>
                                {matrices.map((m, index) => (
                                    <div key={index} style={styles.matrixWrapper}>
                                        <div style={styles.matrixHeader}>
                                            <div style={styles.matrixInfo}>
                                                {index === 0 ? "F" : index === 1 ? "g" : `f${index + 1}`}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMatrix(index)}
                                                style={styles.deleteButton}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div style={styles.matrix}>
                                            {m.map((row, i) => (
                                                <div key={i} style={styles.row}>
                                                    {row.map((cell, j) => (
                                                        <div
                                                            key={j}
                                                            onClick={() => handleMatrixCellClick(index, i, j)}
                                                            style={{
                                                                ...styles.cell,
                                                                backgroundColor: cell === 1 ? '#cedd6d' : '#f1bfa4',
                                                                color: '#000000',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {cell}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {showMatrix && (
                                    <div style={styles.matrixWrapper}>
                                        <div style={styles.matrixHeader}>
                                            <div style={styles.matrixInfo}>
                                                {matrices.length === 0 ? "F" : matrices.length === 1 ? "g" : `f${matrices.length + 1}`}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setMatrix(Array(matrix.length).fill().map(() => Array(matrix.length).fill('0')));
                                                }}
                                                style={styles.deleteButton}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div style={styles.matrix}>
                                            {matrix.map((row, i) => (
                                                <div key={i} style={styles.row}>
                                                    {row.map((cell, j) => (
                                                        <div
                                                            key={j}
                                                            onClick={() => {
                                                                const newMatrix = [...matrix];
                                                                newMatrix[i][j] = cell === '1' ? '0' : '1';
                                                                setMatrix(newMatrix);
                                                            }}
                                                            style={{
                                                                ...styles.cell,
                                                                backgroundColor: cell === '1' ? '#cedd6d' : '#f1bfa4',
                                                                color: '#000000',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {cell}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={styles.buttonContainer}>
                                <button
                                    onClick={handleAddMatrix}
                                    style={styles.button}
                                >
                                    Добавить матрицу
                                </button>
                            </div>

                            {matrices.length > 0 && (
                                <button
                                    onClick={handleTask3}
                                    style={{...styles.button, marginTop: '20px'}}
                                >
                                    Рассчитать
                                </button>
                            )}

                            {results && (
                                <div style={styles.results}>
                                    {results}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MatrixDisplay = ({ matrix, label }) => (
    <div style={styles.matrixWrapper}>
        <div style={styles.matrixHeader}>
            <div style={styles.matrixInfo}>
                {Array.isArray(label) ? label : label}
            </div>
        </div>
        <div style={styles.matrix}>
            {matrix.map((row, i) => (
                <div key={i} style={styles.row}>
                    {row.map((cell, j) => (
                        <div
                            key={j}
                            style={{
                                ...styles.cell,
                                backgroundColor: cell === 1 ? '#cedd6d' : '#f1bfa4',
                                color: '#000000',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {cell}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const CayleyTable = ({ semigroup, allMatrices, allProducts }) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: '20px 0'
    }}>
        <div style={{
            display: 'flex',
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #dee2e6'
        }}>
            <div style={{
                padding: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: '60px'
            }}></div>
            {semigroup.map((_, i) => (
                <div key={i} style={{
                    padding: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '60px'
                }}>
                    {i < allMatrices.length ? 
                        (i === 0 ? "F" : i === 1 ? "g" : `f${i + 1}`) : 
                        allProducts[i]}
                </div>
            ))}
        </div>
        {semigroup.map((_, i) => (
            <div key={i} style={{
                display: 'flex',
                borderBottom: '1px solid #dee2e6'
            }}>
                <div style={{
                    padding: '12px',
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa',
                    borderRight: '2px solid #dee2e6',
                    minWidth: '60px',
                    textAlign: 'center'
                }}>
                    {i < allMatrices.length ? 
                        (i === 0 ? "F" : i === 1 ? "g" : `f${i + 1}`) : 
                        allProducts[i]}
                </div>
                {semigroup.map((_, j) => {
                    const composition = compositionMatrix(semigroup[i], semigroup[j]);
                    const compositionStr = JSON.stringify(composition);
                    const resultIndex = semigroup.findIndex(m => JSON.stringify(m) === compositionStr);
                    const resultNotation = resultIndex < allMatrices.length ? 
                        (resultIndex === 0 ? "F" : resultIndex === 1 ? "g" : `f${resultIndex + 1}`) : 
                        allProducts[resultIndex];
                    return (
                        <div key={j} style={{
                            padding: '12px',
                            textAlign: 'center',
                            minWidth: '60px',
                            borderRight: '1px solid #dee2e6'
                        }}>
                            {resultNotation}
                        </div>
                    );
                })}
            </div>
        ))}
    </div>
);

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
        textAlign: 'center',
        color: '#333',
    },
    backButton: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: '#FF5722',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    taskButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    taskButton: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    input: {
        padding: '5px',
        borderRadius: '3px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    matrixContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
    },
    matrix: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px',
    },
    row: {
        display: 'flex',
        gap: '2px',
    },
    cell: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        userSelect: 'none',
    },
    results: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
    },
    matrixInfo: {
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    horizontalContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    horizontalLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    matrixWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '15px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease',
        '&:hover': {
            transform: 'translateY(-2px)'
        }
    },
    matricesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '25px',
        width: '100%',
        marginBottom: '30px',
        padding: '20px',
    },
    matrixHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '10px',
        padding: '0 10px',
    },
    deleteButton: {
        padding: '4px 8px',
        backgroundColor: '#ff5722',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
        '&:hover': {
            backgroundColor: '#f4511e'
        }
    },
};

export default Lab3; 