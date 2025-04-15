import React, { useState } from 'react';
import SemigroupGraph from './SemigroupGraph';

const Lab4 = () => {
    const [elements, setElements] = useState('');
    const [equalities, setEqualities] = useState('');
    const [results, setResults] = useState([]);

    const inputElements = () => elements.split(' ').filter(Boolean);
    
    const inputEqualities = () => {
        return equalities
            .split('\n')
            .filter(line => line.trim()) // игнорируем пустые строки
            .map(line => line.split(' '));
    };

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

    const getNewWord = (mapping, elements) => {
        const allElements = new Set(Object.keys(mapping));
        for (const i of allElements) {
            for (const j of elements) {
                const value = simplifyString(i + j, mapping);
                if (!mapping[value]) return value;
            }
        }
        return null;
    };

    const buildTable = (elements, mapping) => {
        const allElements = Object.keys(mapping);
        const uniqueElements = [...new Set([...elements, ...allElements])];
        
        const tableData = uniqueElements.map(i => 
            uniqueElements.map(j => simplifyString(i + j, mapping))
        );
        
        return tableData;
    };

    const buildGraphData = (mapping, elements) => {
        const nodes = [];
        const links = [];
        const processedNodes = new Set();

        // Создаем узлы из начальных элементов
        elements.forEach(elem => {
            if (!processedNodes.has(elem)) {
                nodes.push({ id: elem, label: elem });
                processedNodes.add(elem);
            }
        });

        // Добавляем узлы из маппинга и их значений
        Object.entries(mapping).forEach(([key, values]) => {
            // Добавляем ключ как узел, если его еще нет
            if (!processedNodes.has(key)) {
                nodes.push({ id: key, label: key });
                processedNodes.add(key);
            }

            // Добавляем значения как узлы и создаем связи
            values.forEach(value => {
                // Добавляем значение как узел, если его еще нет
                if (!processedNodes.has(value)) {
                    nodes.push({ id: value, label: value });
                    processedNodes.add(value);
                }

                // Добавляем связь
                links.push({
                    source: key,
                    target: value,
                    value: 1
                });
            });
        });

        return { nodes, links };
    };

    const buildRightCayleyGraph = (mapping, elements) => {
        const nodes = [];
        const links = [];
        const processedNodes = new Set();
        const processedLinks = new Map(); // для группировки меток рёбер

        // Добавляем все элементы полугруппы как узлы
        Object.keys(mapping).forEach(elem => {
            if (!processedNodes.has(elem)) {
                nodes.push({ id: elem, label: elem });
                processedNodes.add(elem);
            }
        });

        // Добавляем рёбра для правого умножения
        Object.keys(mapping).forEach(elem1 => {
            elements.forEach(elem2 => {
                const result = simplifyString(elem1 + elem2, mapping);
                // Проверяем результат умножения перед добавлением ребра
                console.log(`${elem1} * ${elem2} = ${result}`); // для отладки

                // Создаем уникальный ключ для ребра, включающий и source, и target
                const linkKey = `${elem1}-${result}`;
                
                if (!processedLinks.has(linkKey)) {
                    processedLinks.set(linkKey, {
                        source: elem1,
                        target: result,
                        value: 1,
                        labels: [elem2]
                    });
                } else {
                    const link = processedLinks.get(linkKey);
                    if (!link.labels.includes(elem2)) {
                        link.labels.push(elem2);
                        link.labels.sort(); // Сортируем метки для консистентного отображения
                    }
                }
            });
        });

        return { 
            nodes, 
            links: Array.from(processedLinks.values())
        };
    };

    const buildLeftCayleyGraph = (mapping, elements) => {
        const nodes = [];
        const links = [];
        const processedNodes = new Set();
        const processedLinks = new Map();

        Object.keys(mapping).forEach(elem => {
            if (!processedNodes.has(elem)) {
                nodes.push({ id: elem, label: elem });
                processedNodes.add(elem);
            }
        });

        Object.keys(mapping).forEach(elem1 => {
            elements.forEach(elem2 => {
                const result = simplifyString(elem2 + elem1, mapping);
                // Проверяем результат умножения перед добавлением ребра
                console.log(`${elem2} * ${elem1} = ${result}`); // для отладки

                const linkKey = `${elem1}-${result}`;
                
                if (!processedLinks.has(linkKey)) {
                    processedLinks.set(linkKey, {
                        source: elem1,
                        target: result,
                        value: 1,
                        labels: [elem2]
                    });
                } else {
                    const link = processedLinks.get(linkKey);
                    if (!link.labels.includes(elem2)) {
                        link.labels.push(elem2);
                        link.labels.sort(); // Сортируем метки для консистентного отображения
                    }
                }
            });
        });

        return { 
            nodes, 
            links: Array.from(processedLinks.values())
        };
    };

    const runProgram = () => {
        try {
            const inputElems = inputElements();
            const equalitiesList = inputEqualities();
            const newMapping = {};

            // Инициализация маппинга
            inputElems.forEach(elem => {
                newMapping[elem] = new Set();
            });

            // Обработка равенств с учетом лексикографического порядка
            equalitiesList.forEach(([x, y]) => {
                if (x in newMapping) {
                    newMapping[x].add(y);
                } else if (y in newMapping) {
                    newMapping[y].add(x);
                } else if (x.length < y.length) {
                    newMapping[x] = new Set([y]);
                } else if (x.length === y.length) {
                    if (compareLexicographic(x, y)) {
                        newMapping[x] = new Set([y]);
                    } else {
                        newMapping[y] = new Set([x]);
                    }
                } else {
                    newMapping[y] = new Set([x]);
                }
            });

            // Построение полугруппы
            let newValue = getNewWord(newMapping, inputElems);
            const processedWords = new Set();

            while (newValue !== null && !processedWords.has(newValue)) {
                processedWords.add(newValue);
                newMapping[newValue] = new Set();
                newValue = getNewWord(newMapping, inputElems);
            }

            const tableData = buildTable(inputElems, newMapping);
            
            const result = (
                <div style={styles.resultsContainer}>
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Итоговая полугруппа</h3>
                        <div style={styles.semigroupResult}>
                            {`{${Object.keys(newMapping).join(', ')}}`}
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Таблица полугруппы</h3>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}></th>
                                        {tableData[0].map((_, index) => (
                                            <th key={index} style={styles.tableHeader}>
                                                {Object.keys(newMapping)[index]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td style={styles.tableHeader}>
                                                {Object.keys(newMapping)[rowIndex]}
                                            </td>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} style={styles.tableCell}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Графы Кэли</h3>
                        <div style={styles.graphsContainer}>
                            <div style={styles.graphSection}>
                                <h4 style={styles.graphTitle}>Правый граф Кэли</h4>
                                {console.log('Right Cayley graph data:', buildRightCayleyGraph(newMapping, inputElems))}
                                <SemigroupGraph 
                                    data={buildRightCayleyGraph(newMapping, inputElems)}
                                    title="Правый граф Кэли"
                                />
                            </div>
                            <div style={styles.graphSection}>
                                <h4 style={styles.graphTitle}>Левый граф Кэли</h4>
                                {console.log('Left Cayley graph data:', buildLeftCayleyGraph(newMapping, inputElems))}
                                <SemigroupGraph 
                                    data={buildLeftCayleyGraph(newMapping, inputElems)}
                                    title="Левый граф Кэли"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

            setResults(result);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Лабораторная работа 4: Работа с полугруппами</h1>
            <div style={styles.mainContent}>
                <div style={styles.inputSection}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Элементы полугруппы (через пробел):</label>
                        <input 
                            style={styles.input}
                            value={elements} 
                            onChange={(e) => setElements(e.target.value)}
                            placeholder="Например: x y z"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Равенства (по одному на строку):</label>
                        <textarea 
                            style={styles.textarea}
                            value={equalities} 
                            onChange={(e) => setEqualities(e.target.value)}
                            placeholder="Например:&#10;xx x&#10;xy yx"
                            rows="5"
                        />
                </div>
                    <button 
                        style={styles.button}
                        onClick={runProgram}
                    >
                        Выполнить
                    </button>
                </div>
                <div style={styles.resultsSection}>
                    {results}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
    },
    title: {
        textAlign: 'center',
        color: '#2c3e50',
        fontSize: '2.2em',
        marginBottom: '40px',
        fontWeight: '600',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
    },
    inputSection: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        color: '#34495e',
        fontSize: '1.1em',
        fontWeight: '500',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '2px solid #e2e8f0',
        fontSize: '1em',
        transition: 'border-color 0.3s ease',
        outline: 'none',
        '&:focus': {
            borderColor: '#4CAF50',
        },
    },
    textarea: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '2px solid #e2e8f0',
        fontSize: '1em',
        transition: 'border-color 0.3s ease',
        outline: 'none',
        resize: 'vertical',
        minHeight: '120px',
        fontFamily: 'inherit',
        '&:focus': {
            borderColor: '#4CAF50',
        },
    },
    button: {
        padding: '14px 28px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1em',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: '500',
        alignSelf: 'flex-start',
        boxShadow: '0 2px 4px rgba(76,175,80,0.3)',
        '&:hover': {
            backgroundColor: '#43a047',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(76,175,80,0.4)',
        },
        '&:active': {
            transform: 'translateY(0)',
        },
    },
    resultsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        color: '#2c3e50',
        marginBottom: '25px',
        textAlign: 'center',
        fontSize: '1.5em',
        fontWeight: '600',
    },
    tableWrapper: {
        overflowX: 'auto',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0',
        backgroundColor: 'white',
    },
    tableHeader: {
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        fontWeight: '600',
        textAlign: 'center',
        color: '#2c3e50',
    },
    tableCell: {
        padding: '14px',
        borderBottom: '1px solid #e2e8f0',
        textAlign: 'center',
        color: '#34495e',
        transition: 'background-color 0.2s ease',
        '&:hover': {
            backgroundColor: '#f8fafc',
        },
    },
    resultsSection: {
        marginTop: '20px',
    },
    graphsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
    },
    graphSection: {
        flex: '1 1 calc(50% - 10px)',
        minWidth: '300px',
    },
    graphTitle: {
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '15px',
        fontSize: '1.2em',
        fontWeight: '500',
    },
    semigroupResult: {
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '1.1em',
        color: '#2c3e50',
        textAlign: 'center',
        fontFamily: 'monospace',
        wordBreak: 'break-word',
        margin: '0 auto',
        maxWidth: '100%',
        overflowX: 'auto',
    },
};

export default Lab4; 