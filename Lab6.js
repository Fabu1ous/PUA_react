import React, { useState, useMemo } from 'react';
import EggBoxDiagram from './EggBoxDiagram';
import { useNavigate } from 'react-router-dom';

const Lab6 = () => {
    const navigate = useNavigate();
    const [elements, setElements] = useState('');
    const [elementsArray, setElementsArray] = useState([]);
    const [table, setTable] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [selectedElement, setSelectedElement] = useState('');
    const [results, setResults] = useState(null);

    const compareLexicographic = (word1, word2) => {
        const n = Math.min(word1.length, word2.length);
        for (let i = 0; i < n; i++) {
            if (word1[i] < word2[i]) return true;
            if (word1[i] > word2[i]) return false;
        }
        return word1.length <= word2.length;
    };

    const simplifyString = (string, mapping) => {
        for (let i = 0; i <= string.length; i++) {
            for (let j = i + 1; j <= string.length; j++) {
                const substring = string.slice(i, j);
                for (const key in mapping) {
                    if (string === key) return string;
                    if (mapping[key].has(substring)) {
                        return simplifyString(
                            string.slice(0, i) + key + string.slice(j),
                            mapping
                        );
                    }
                }
            }
        }
        return string;
    };

    const buildCayleyTable = (elements, equalitiesStr) => {
        const mapping = {};
        elements.forEach(elem => {
            mapping[elem] = new Set();
        });

        // Обработка равенств
        const equalitiesList = equalitiesStr
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.split('='));

        equalitiesList.forEach(([x, y]) => {
            if (x in mapping) {
                mapping[x].add(y);
            } else if (y in mapping) {
                mapping[y].add(x);
            } else if (x.length < y.length) {
                mapping[x] = new Set([y]);
            } else if (x.length === y.length) {
                if (compareLexicographic(x, y)) {
                    mapping[x] = new Set([y]);
                } else {
                    mapping[y] = new Set([x]);
                }
            } else {
                mapping[y] = new Set([x]);
            }
        });

        // Построение таблицы Кэли
        const newTable = elements.map(i => 
            elements.map(j => simplifyString(i + j, mapping))
        );

        setTable(newTable);
        setShowTable(true);
        return { table: newTable, mapping };
    };

    // Создание пустой таблицы
    const createEmptyTable = () => {
        const newElementsArray = elements.split(' ').filter(Boolean);
        setElementsArray(newElementsArray);
        const newTable = Array(newElementsArray.length).fill().map(() => 
            Array(newElementsArray.length).fill(newElementsArray[0])
        );
        setTable(newTable);
        setShowTable(true);
    };

    // Обработка изменений в таблице
    const handleTableChange = (row, col, value) => {
        const newTable = [...table];
        newTable[row][col] = value;
        setTable(newTable);
    };

    // Обновляем функцию вычисления левого идеала
    const calculateLeftIdeal = (S, x) => {
        const leftIdeal = new Set([x]); // Добавляем сам элемент x
        const xIndex = elementsArray.indexOf(x);
        
        // Добавляем элементы из столбца x
        for (let i = 0; i < S.length; i++) {
            leftIdeal.add(table[i][xIndex]);
        }

        return Array.from(leftIdeal).sort();
    };

    // Обновляем функцию вычисления правого идеала
    const calculateRightIdeal = (S, x) => {
        const rightIdeal = new Set([x]); // Добавляем сам элемент x
        const xIndex = elementsArray.indexOf(x);
        
        // Добавляем элементы из строки x
        for (let i = 0; i < S.length; i++) {
            rightIdeal.add(table[xIndex][i]);
        }

        return Array.from(rightIdeal).sort();
    };

    // Обновляем функцию вычисления двустороннего идеала
    const calculateTwoSidedIdeal = (S, x) => {
        const twoSidedIdeal = new Set([x]); // Добавляем сам элемент x
        const xIndex = elementsArray.indexOf(x);
        
        // Добавляем все элементы из левого и правого идеалов
        for (let i = 0; i < S.length; i++) {
            twoSidedIdeal.add(table[i][xIndex]); // из левого идеала
            twoSidedIdeal.add(table[xIndex][i]); // из правого идеала
        }
        
        // Добавляем все произведения вида sxt
        for (let s = 0; s < S.length; s++) {
            for (let t = 0; t < S.length; t++) {
                // Сначала вычисляем sx
                const sx = table[s][xIndex];
                const sxIndex = elementsArray.indexOf(sx);
                // Затем вычисляем (sx)t
                if (sxIndex !== -1) {
                    twoSidedIdeal.add(table[sxIndex][t]);
                }
            }
        }

        return Array.from(twoSidedIdeal).sort();
    };

    // Обновляем функцию вычисления отношений Грина
    const calculateGreenRelations = (S) => {
        // Вычисление L-отношения
        const L_relation = new Map();
        for (const a of S) {
            const L_class = new Set([a]);
            const aLeftIdeal = new Set(calculateLeftIdeal(S, a));
            
            for (const b of S) {
                if (a !== b) {
                    const bLeftIdeal = new Set(calculateLeftIdeal(S, b));
                    if (setsAreEqual(aLeftIdeal, bLeftIdeal)) {
                        L_class.add(b);
                    }
                }
            }
            
            if (L_class.size > 0) {
                const key = Array.from(L_class).sort().join(',');
                L_relation.set(key, L_class);
            }
        }

        // Вычисление R-отношения
        const R_relation = new Map();
        for (const a of S) {
            const R_class = new Set([a]);
            const aRightIdeal = new Set(calculateRightIdeal(S, a));
            
            for (const b of S) {
                if (a !== b) {
                    const bRightIdeal = new Set(calculateRightIdeal(S, b));
                    if (setsAreEqual(aRightIdeal, bRightIdeal)) {
                        R_class.add(b);
                    }
                }
            }
            
            if (R_class.size > 0) {
                const key = Array.from(R_class).sort().join(',');
                R_relation.set(key, R_class);
            }
        }

        // Вычисление H-отношения (пересечение R и L)
        const H_classes = new Map();
        for (const a of S) {
            const H_class = new Set([a]);
            
            for (const b of S) {
                if (a !== b) {
                    // Проверяем, находятся ли элементы в одном L-классе и в одном R-классе
                    const inSameLClass = Array.from(L_relation.values()).some(lClass => 
                        lClass.has(a) && lClass.has(b)
                    );
                    const inSameRClass = Array.from(R_relation.values()).some(rClass => 
                        rClass.has(a) && rClass.has(b)
                    );
                    
                    if (inSameLClass && inSameRClass) {
                        H_class.add(b);
                    }
                }
            }
            
            if (H_class.size > 0) {
                const key = Array.from(H_class).sort().join(',');
                H_classes.set(key, H_class);
            }
        }

        // Вычисление D-отношения (объединение R и L)
        const D_classes = new Map();
        for (const a of S) {
            const D_class = new Set([a]);
            
            for (const b of S) {
                if (a !== b) {
                    // Проверяем, находятся ли элементы в одном L-классе или в одном R-классе
                    const inSameLClass = Array.from(L_relation.values()).some(lClass => 
                        lClass.has(a) && lClass.has(b)
                    );
                    const inSameRClass = Array.from(R_relation.values()).some(rClass => 
                        rClass.has(a) && rClass.has(b)
                    );
                    
                    if (inSameLClass || inSameRClass) {
                        D_class.add(b);
                    }
                }
            }
            
            if (D_class.size > 0) {
                const key = Array.from(D_class).sort().join(',');
                D_classes.set(key, D_class);
            }
        }

        // Создаем структуру egg-box
        const egg_box = {};
        let dClassCounter = 1;

        // Для каждого D-класса создаем структуру
        for (const [dKey, dSet] of D_classes) {
            const dElements = Array.from(dSet);
            const boxKey = `D${dClassCounter}`;
            egg_box[boxKey] = {};

            // Находим все R-классы и L-классы, которые пересекаются с этим D-классом
            for (const [rKey, rClass] of R_relation) {
                for (const [lKey, lClass] of L_relation) {
                    const intersection = dElements.filter(x => 
                        rClass.has(x) && lClass.has(x)
                    );
                    
                    if (intersection.length > 0) {
                        if (!egg_box[boxKey][rKey]) {
                            egg_box[boxKey][rKey] = [];
                        }
                        egg_box[boxKey][rKey].push(intersection.sort());
                    }
                }
            }
            dClassCounter++;
        }

        return {
            L: L_relation,
            R: R_relation,
            H: H_classes,
            D: D_classes,
            egg_box: egg_box
        };
    };

    // Вспомогательная функция для сравнения множеств
    const setsAreEqual = (set1, set2) => {
        if (set1.size !== set2.size) return false;
        for (const item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    };

    // Обновляем функцию умножения элементов
    const multiply = (a, b) => {
        const aIndex = elementsArray.indexOf(a);
        const bIndex = elementsArray.indexOf(b);
        if (aIndex === -1 || bIndex === -1) return null;
        return table[aIndex][bIndex];
    };

    // Обновляем функцию handleCalculate
    const handleCalculate = () => {
        try {
            if (!selectedElement || !elementsArray.includes(selectedElement)) {
                throw new Error('Выберите элемент из полугруппы');
            }

            const ideals = {
                left: calculateLeftIdeal(elementsArray, selectedElement),
                right: calculateRightIdeal(elementsArray, selectedElement),
                twoSided: calculateTwoSidedIdeal(elementsArray, selectedElement)
            };

            const relations = calculateGreenRelations(elementsArray);

            setResults({
                ideals,
                relations
            });
        } catch (error) {
            alert(error.message);
        }
    };

    // Генерация цветов для элементов множества (из Lab3.js)
    const elementColors = useMemo(() => {
        if (!elementsArray.length) return {};
        const colors = {};

        const startColor = { r: 0xce, g: 0xdd, b: 0xd6 };
        const middleColor = { r: 0xb9, g: 0xba, b: 0xbf };
        const endColor = { r: 0xf1, g: 0xbf, b: 0xa4 };

        const interpolateColor = (color1, color2, factor) => {
            return {
                r: Math.round(color1.r + (color2.r - color1.r) * factor),
                g: Math.round(color1.g + (color2.g - color1.g) * factor),
                b: Math.round(color1.b + (color2.b - color1.b) * factor)
            };
        };

        const rgbToHex = (r, g, b) => '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');

        elementsArray.forEach((element, index) => {
            const position = index / (elementsArray.length - 1);
            let color;

            if (position <= 0.5) {
                const factor = position * 2;
                color = interpolateColor(startColor, middleColor, factor);
            } else {
                const factor = (position - 0.5) * 2;
                color = interpolateColor(middleColor, endColor, factor);
            }

            colors[element] = rgbToHex(color.r, color.g, color.b);
        });

        return colors;
    }, [elementsArray.length]);

    // Обработка клика по ячейке таблицы
    const handleCellClick = (rowIndex, colIndex) => {
        const newTable = [...table];
        const currentValue = newTable[rowIndex][colIndex];
        const currentIndex = elementsArray.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % elementsArray.length;
        newTable[rowIndex][colIndex] = elementsArray[nextIndex];
        setTable(newTable);
    };

    // Обновляем функцию возврата в меню
    const handleReturnToMenu = () => {
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <button
                style={styles.returnButton}
                onClick={handleReturnToMenu}
            >
                ← Вернуться
            </button>
            
            <h1 style={styles.title}>Лабораторная работа 6: Идеалы и отношения Грина</h1>
            
            <div style={styles.inputSection}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>
                        Введите элементы полугруппы через пробел:
                    </label>
                    <input
                        style={styles.input}
                        value={elements}
                        onChange={(e) => setElements(e.target.value)}
                        placeholder="Например: a b c"
                    />
                    <button
                        style={styles.button}
                        onClick={createEmptyTable}
                    >
                        Создать таблицу
                    </button>
                </div>

                {showTable && (
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Выберите элемент для вычисления идеалов:
                        </label>
                        <select
                            style={styles.select}
                            value={selectedElement}
                            onChange={(e) => setSelectedElement(e.target.value)}
                        >
                            <option value="">Выберите элемент</option>
                            {elements.split(' ').filter(Boolean).map(elem => (
                                <option key={elem} value={elem}>{elem}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {showTable && (
                <div style={styles.tableContainer}>
                    <h3 style={styles.subtitle}>Таблица Кэли:</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>∘</th>
                                {elementsArray.map((elem, i) => (
                                    <th key={i} style={styles.tableHeader}>{elem}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.map((row, i) => (
                                <tr key={i}>
                                    <th style={styles.tableHeader}>
                                        {elementsArray[i]}
                                    </th>
                                    {row.map((cell, j) => (
                                        <td 
                                            key={j} 
                                            onClick={() => handleCellClick(i, j)}
                                            style={{
                                                ...styles.tableCell,
                                                backgroundColor: elementColors[cell],
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        style={{...styles.button, marginTop: '20px'}}
                        onClick={handleCalculate}
                    >
                        Вычислить
                    </button>
                </div>
            )}

            {results && (
                <div style={styles.resultsSection}>
                    <h2 style={styles.subtitle}>Результаты:</h2>
                    
                    <div style={styles.resultBlock}>
                        <h3 style={styles.resultTitle}>
                            Идеалы для элемента {selectedElement}:
                        </h3>
                        <div style={styles.idealsList}>
                            <p>
                                <strong>Левый идеал (x]:</strong>{' '}
                                {results.ideals.left.join(', ')}
                            </p>
                            <p>
                                <strong>Правый идеал [x):</strong>{' '}
                                {results.ideals.right.join(', ')}
                            </p>
                            <p>
                                <strong>Двусторонний идеал (x):</strong>{' '}
                                {results.ideals.twoSided.join(', ')}
                            </p>
                        </div>
                    </div>

                    <div style={styles.resultBlock}>
                        <h3 style={styles.resultTitle}>Отношения Грина:</h3>
                        <div style={styles.relationsList}>
                            <div style={styles.relation}>
                                <strong>L-отношение:</strong>
                                <p style={styles.relationText}>
                                    {'{'}
                                    {Array.from(results.relations.L.values()).map(set => 
                                        Array.from(set).map(a => 
                                            Array.from(set).map(b => 
                                                `(${a}, ${b})`
                                            ).join(', ')
                                        )
                                    ).join(', ')}
                                    {'}'}
                                </p>
                            </div>
                            <div style={styles.relation}>
                                <strong>R-отношение:</strong>
                                <p style={styles.relationText}>
                                    {'{'}
                                    {Array.from(results.relations.R.values()).map(set => 
                                        Array.from(set).map(a => 
                                            Array.from(set).map(b => 
                                                `(${a}, ${b})`
                                            ).join(', ')
                                        )
                                    ).join(', ')}
                                    {'}'}
                                </p>
                            </div>
                            <div style={styles.relation}>
                                <strong>H-отношение:</strong>
                                <p style={styles.relationText}>
                                    {'{'}
                                    {Array.from(results.relations.H.values()).map(set => 
                                        Array.from(set).map(a => 
                                            Array.from(set).map(b => 
                                                `(${a}, ${b})`
                                            ).join(', ')
                                        )
                                    ).join(', ')}
                                    {'}'}
                                </p>
                            </div>
                            <div style={styles.relation}>
                                <strong>D-отношение:</strong>
                                <p style={styles.relationText}>
                                    {'{'}
                                    {Array.from(results.relations.D.values()).map(set => 
                                        Array.from(set).map(a => 
                                            Array.from(set).map(b => 
                                                `(${a}, ${b})`
                                            ).join(', ')
                                        )
                                    ).join(', ')}
                                    {'}'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={styles.resultBlock}>
                        <h3 style={styles.resultTitle}>Egg-box диаграмма:</h3>
                        <EggBoxDiagram
                            egg_box={results.relations.egg_box}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
    },
    title: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '20px',
        color: '#444',
        marginBottom: '15px',
    },
    inputSection: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#555',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    textarea: {
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        resize: 'vertical',
        minHeight: '100px',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
        ':hover': {
            backgroundColor: '#45a049',
        },
    },
    resultsSection: {
        marginTop: '30px',
    },
    resultBlock: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    resultTitle: {
        fontSize: '18px',
        color: '#333',
        marginBottom: '15px',
    },
    idealsList: {
        marginBottom: '20px',
    },
    relationsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    relation: {
        marginBottom: '15px',
    },
    relationText: {
        fontSize: '14px',
        marginBottom: '10px',
    },
    tableContainer: {
        marginTop: '20px',
        overflowX: 'auto',
    },
    table: {
        borderCollapse: 'collapse',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        padding: '10px',
        border: '1px solid #ddd',
        textAlign: 'center',
    },
    tableCell: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'center',
        minWidth: '40px',
        transition: 'background-color 0.2s ease',
    },
    select: {
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '10px',
    },
    returnButton: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '8px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s',
        ':hover': {
            backgroundColor: '#45a049',
        },
    },
};

export default Lab6; 