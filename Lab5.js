import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutomataDiagram from './AutomataDiagram';
import AutomataInput from './AutomataInput';

const Lab5 = () => {
    const navigate = useNavigate();
    const [automataType, setAutomataType] = useState('recognizer'); // 'recognizer' или 'transformer'
    const [firstAutomata, setFirstAutomata] = useState({
        states: [],
        alphabet: [],
        transitions: {},
        initialStates: [],
        finalStates: [], // для автоматов-распознавателей
        outputFunction: {}, // для автоматов-преобразователей
    });
    const [secondAutomata, setSecondAutomata] = useState({
        states: [],
        alphabet: [],
        transitions: {},
        initialStates: [],
        finalStates: [],
        outputFunction: {},
    });
    const [result, setResult] = useState(null);
    const [operation, setOperation] = useState('sum');

    // Сумма автоматов (объединение)
    const calculateSum = (first, second) => {
        const prefixedFirstStates = first.states.map(s => `A_${s}`);
        const prefixedSecondStates = second.states.map(s => `B_${s}`);
        
        const newTransitions = {};
        
        for (const [state, transitions] of Object.entries(first.transitions)) {
            const newState = `A_${state}`;
            newTransitions[newState] = {};
            for (const [symbol, target] of Object.entries(transitions)) {
                newTransitions[newState][symbol] = `A_${target}`;
            }
        }
        
        for (const [state, transitions] of Object.entries(second.transitions)) {
            const newState = `B_${state}`;
            newTransitions[newState] = {};
            for (const [symbol, target] of Object.entries(transitions)) {
                newTransitions[newState][symbol] = `B_${target}`;
            }
        }
        
        return {
            states: [...prefixedFirstStates, ...prefixedSecondStates],
            alphabet: [...new Set([...first.alphabet, ...second.alphabet])],
            transitions: newTransitions,
            initialStates: [
                ...first.initialStates.map(s => `A_${s}`),
                ...second.initialStates.map(s => `B_${s}`)
            ],
            finalStates: [
                ...first.finalStates.map(s => `A_${s}`),
                ...second.finalStates.map(s => `B_${s}`)
            ],
        };
    };

    // Произведение автоматов (пересечение)
    const calculateProduct = (first, second) => {
        const combinedStates = [];
        const transitions = {};
        const alphabet = [...new Set([...first.alphabet, ...second.alphabet])];
        
        // Создание комбинированных состояний
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                combinedStates.push(combinedState);
                transitions[combinedState] = {};
            }
        }
        
        // Формирование переходов
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                
                for (const symbol of alphabet) {
                    const nextS1 = first.transitions[s1]?.[symbol];
                    const nextS2 = second.transitions[s2]?.[symbol];
                    
                    if (nextS1 && nextS2) {
                        transitions[combinedState][symbol] = `${nextS1},${nextS2}`;
                    }
                }
            }
        }
        
        return {
            states: combinedStates,
            alphabet,
            transitions,
            initialStates: first.initialStates.flatMap(i1 => 
                second.initialStates.map(i2 => `${i1},${i2}`)
            ),
            finalStates: first.finalStates.flatMap(f1 => 
                second.finalStates.map(f2 => `${f1},${f2}`)
            ),
        };
    };

    // Итерация автомата (замыкание Клини)
    const calculateIteration = (automata) => {
        // Клонируем автомат
        const newAutomata = JSON.parse(JSON.stringify(automata));
        const newTransitions = { ...newAutomata.transitions };
        
        // Добавляем ε-переходы из финальных состояний в начальные
        for (const finalState of newAutomata.finalStates) {
            if (!newTransitions[finalState]) {
                newTransitions[finalState] = {};
            }
            
            for (const initialState of newAutomata.initialStates) {
                // Для каждого символа алфавита из начального состояния
                for (const [symbol, target] of Object.entries(newAutomata.transitions[initialState] || {})) {
                    if (!newTransitions[finalState][symbol]) {
                        newTransitions[finalState][symbol] = target;
                    }
                }
            }
        }
        
        return {
            ...newAutomata,
            transitions: newTransitions,
            finalStates: [...new Set([...newAutomata.finalStates, ...newAutomata.initialStates])],
        };
    };

    // Функции для автоматов-преобразователей
    const calculateParallel = (first, second) => {
        const combinedStates = [];
        const transitions = {};
        const outputFunction = {};
        const alphabet = [...new Set([...first.alphabet, ...second.alphabet])];
        
        // Создание состояний
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                combinedStates.push(combinedState);
                transitions[combinedState] = {};
                outputFunction[combinedState] = {};
            }
        }
        
        // Формирование переходов и выходов
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                
                for (const symbol of alphabet) {
                    const nextS1 = first.transitions[s1]?.[symbol];
                    const nextS2 = second.transitions[s2]?.[symbol];
                    
                    if (nextS1 && nextS2) {
                        transitions[combinedState][symbol] = `${nextS1},${nextS2}`;
                        
                        const out1 = first.outputFunction[s1]?.[symbol] || '';
                        const out2 = second.outputFunction[s2]?.[symbol] || '';
                        outputFunction[combinedState][symbol] = `${out1},${out2}`;
                    }
                }
            }
        }
        
        return {
            states: combinedStates,
            alphabet,
            transitions,
            initialStates: first.initialStates.flatMap(i1 => 
                second.initialStates.map(i2 => `${i1},${i2}`)
            ),
            outputFunction,
        };
    };

    const calculateSequential = (first, second) => {
        const combinedStates = [];
        const transitions = {};
        const outputFunction = {};
        
        // Создание состояний
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                combinedStates.push(combinedState);
                transitions[combinedState] = {};
                outputFunction[combinedState] = {};
            }
        }
        
        // Формирование переходов и выходов
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                
                for (const symbol of first.alphabet) {
                    const nextS1 = first.transitions[s1]?.[symbol];
                    
                    if (nextS1) {
                        const output1 = first.outputFunction[s1]?.[symbol] || '';
                        
                        // Используем выход первого автомата как вход для второго
                        const nextS2 = second.transitions[s2]?.[output1];
                        
                        if (nextS2) {
                            transitions[combinedState][symbol] = `${nextS1},${nextS2}`;
                            outputFunction[combinedState][symbol] = second.outputFunction[s2]?.[output1] || '';
                        }
                    }
                }
            }
        }
        
        return {
            states: combinedStates,
            alphabet: first.alphabet,
            transitions,
            initialStates: first.initialStates.flatMap(i1 => 
                second.initialStates.map(i2 => `${i1},${i2}`)
            ),
            outputFunction,
        };
    };

    const calculateCascade = (first, second, encodingFunction) => {
        const combinedStates = [];
        const transitions = {};
        const outputFunction = {};
        
        // Создание состояний
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                combinedStates.push(combinedState);
                transitions[combinedState] = {};
                outputFunction[combinedState] = {};
            }
        }
        
        // Формирование переходов и выходов
        for (const s1 of first.states) {
            for (const s2 of second.states) {
                const combinedState = `${s1},${s2}`;
                
                for (const symbol of first.alphabet) {
                    const nextS1 = first.transitions[s1]?.[symbol];
                    
                    if (nextS1) {
                        // Получаем код для второго автомата с использованием η(x)
                        const encodedSymbol = encodingFunction(symbol, s1);
                        const nextS2 = second.transitions[s2]?.[encodedSymbol];
                        
                        if (nextS2) {
                            transitions[combinedState][symbol] = `${nextS1},${nextS2}`;
                            
                            // Получаем выход второго автомата - φ(x,y)
                            // В этом случае мы используем выход второго автомата по закодированному символу
                            const output = second.outputFunction[s2]?.[encodedSymbol] || '';
                            outputFunction[combinedState][symbol] = output;
                        }
                    }
                }
            }
        }
        
        return {
            states: combinedStates,
            alphabet: first.alphabet,
            transitions,
            initialStates: first.initialStates.flatMap(i1 => 
                second.initialStates.map(i2 => `${i1},${i2}`)
            ),
            outputFunction,
        };
    };

    const handleCalculate = () => {
        let calculationResult;
        
        if (automataType === 'recognizer') {
            switch (operation) {
                case 'sum':
                    calculationResult = calculateSum(firstAutomata, secondAutomata);
                    break;
                case 'product':
                    calculationResult = calculateProduct(firstAutomata, secondAutomata);
                    break;
                case 'iteration':
                    calculationResult = calculateIteration(firstAutomata);
                    break;
                default:
                    break;
            }
        } else {
            switch (operation) {
                case 'parallel':
                    calculationResult = calculateParallel(firstAutomata, secondAutomata);
                    break;
                case 'sequential':
                    calculationResult = calculateSequential(firstAutomata, secondAutomata);
                    break;
                case 'cascade':
                    // Функция кодирования для каскадного соединения
                    const encodingFunction = (symbol, state) => {
                        // По заданию: η(x) = x', φ(x,y) = (x ↔ y)'
                        // Для получения x' из x
                        const x = parseInt(symbol);
                        const notX = x === 0 ? '1' : '0';
                        
                        // y - это текущее состояние первого автомата (z0 или z1)
                        const y = state === 'z0' ? 0 : 1;
                        
                        // Используем функцию η, которая в этом случае просто возвращает отрицание входа
                        return notX;
                    };
                    
                    calculationResult = calculateCascade(firstAutomata, secondAutomata, encodingFunction);
                    break;
                default:
                    break;
            }
        }

        setResult(calculationResult);
    };

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
            
            <h1 style={styles.title}>Лабораторная работа 5: Конечные автоматы</h1>

            <div style={styles.controls}>
                <div style={styles.controlGroup}>
                    <label style={styles.label}>Тип автомата:</label>
                    <select 
                        style={styles.select}
                        value={automataType}
                        onChange={(e) => setAutomataType(e.target.value)}
                    >
                        <option value="recognizer">Автомат-распознаватель</option>
                        <option value="transformer">Автомат-преобразователь</option>
                    </select>
                </div>

                <div style={styles.controlGroup}>
                    <label style={styles.label}>Операция:</label>
                    <select 
                        style={styles.select}
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                    >
                        {automataType === 'recognizer' ? (
                            <>
                                <option value="sum">Сумма</option>
                                <option value="product">Произведение</option>
                                <option value="iteration">Итерация</option>
                            </>
                        ) : (
                            <>
                                <option value="parallel">Параллельное соединение</option>
                                <option value="sequential">Последовательное соединение</option>
                                <option value="cascade">Каскадное соединение</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            <div style={styles.automataPair}>
                <AutomataInput
                    automata={firstAutomata}
                    onChange={setFirstAutomata}
                    label="Первый автомат"
                />
                
                {operation !== 'iteration' && (
                    <AutomataInput
                        automata={secondAutomata}
                        onChange={setSecondAutomata}
                        label="Второй автомат"
                    />
                )}
            </div>

            <button 
                style={styles.calculateButton}
                onClick={handleCalculate}
            >
                Вычислить
            </button>

            {result && (
                <div style={styles.resultContainer}>
                    <h2 style={styles.sectionTitle}>Результаты вычислений</h2>
                    
                    <div style={styles.diagramContainer}>
                        <h3 style={styles.subtitle}>Диаграмма автомата:</h3>
                        <AutomataDiagram automata={result} />
                    </div>
                    
                    <div style={styles.detailsContainer}>
                        <h3 style={styles.subtitle}>Детали результата:</h3>
                        
                        <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>Состояния:</h4>
                            <div style={styles.statesList}>
                                {result.states?.map(state => (
                                    <span key={state} style={{
                                        ...styles.stateTag,
                                        backgroundColor: result.initialStates?.includes(state) ? '#4CAF50' : 
                                                        result.finalStates?.includes(state) ? '#FF5722' : '#2196F3',
                                    }}>
                                        {state}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>Алфавит:</h4>
                            <div style={styles.alphabetList}>
                                {result.alphabet?.map(symbol => (
                                    <span key={symbol} style={styles.symbolTag}>
                                        {symbol}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>Начальные состояния:</h4>
                            <div style={styles.statesList}>
                                {result.initialStates?.map(state => (
                                    <span key={state} style={{...styles.stateTag, backgroundColor: '#4CAF50'}}>
                                        {state}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {result.finalStates && (
                            <div style={styles.detailSection}>
                                <h4 style={styles.detailTitle}>Конечные состояния:</h4>
                                <div style={styles.statesList}>
                                    {result.finalStates.map(state => (
                                        <span key={state} style={{...styles.stateTag, backgroundColor: '#FF5722'}}>
                                            {state}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>Функция переходов:</h4>
                            <div style={styles.transitionTable}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Состояние</th>
                                            {result.alphabet?.map(symbol => (
                                                <th key={symbol} style={styles.tableHeader}>{symbol}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.states?.map(state => (
                                            <tr key={state}>
                                                <td style={styles.tableCell}>
                                                    <span style={{
                                                        ...styles.stateTag, 
                                                        backgroundColor: result.initialStates?.includes(state) ? '#4CAF50' : 
                                                                        result.finalStates?.includes(state) ? '#FF5722' : '#2196F3',
                                                    }}>
                                                        {state}
                                                    </span>
                                                </td>
                                                {result.alphabet?.map(symbol => (
                                                    <td key={`${state}-${symbol}`} style={styles.tableCell}>
                                                        {result.transitions?.[state]?.[symbol] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {result.outputFunction && (
                            <div style={styles.detailSection}>
                                <h4 style={styles.detailTitle}>Функция выходов:</h4>
                                <div style={styles.transitionTable}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>Состояние</th>
                                                {result.alphabet?.map(symbol => (
                                                    <th key={symbol} style={styles.tableHeader}>{symbol}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.states?.map(state => (
                                                <tr key={state}>
                                                    <td style={styles.tableCell}>
                                                        <span style={{
                                                            ...styles.stateTag, 
                                                            backgroundColor: result.initialStates?.includes(state) ? '#4CAF50' : 
                                                                            result.finalStates?.includes(state) ? '#FF5722' : '#2196F3',
                                                        }}>
                                                            {state}
                                                        </span>
                                                    </td>
                                                    {result.alphabet?.map(symbol => (
                                                        <td key={`${state}-${symbol}`} style={styles.tableCell}>
                                                            {result.outputFunction?.[state]?.[symbol] || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    returnButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginBottom: '20px',
    },
    title: {
        fontSize: '18px',
        marginBottom: '15px',
        color: '#333',
    },
    controls: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
    },
    controlGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    select: {
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    automataPair: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px',
    },
    calculateButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px',
    },
    resultContainer: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: '24px',
        color: '#2c3e50',
        marginBottom: '25px',
        textAlign: 'center',
        fontWeight: '600',
    },
    diagramContainer: {
        marginBottom: '30px',
    },
    subtitle: {
        fontSize: '20px',
        color: '#2c3e50',
        marginBottom: '15px',
        fontWeight: '500',
    },
    detailsContainer: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
    },
    detailSection: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    detailTitle: {
        fontSize: '16px',
        color: '#2c3e50',
        marginBottom: '10px',
        fontWeight: '500',
    },
    statesList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    alphabetList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    stateTag: {
        padding: '5px 10px',
        borderRadius: '15px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    symbolTag: {
        padding: '5px 10px',
        borderRadius: '15px',
        backgroundColor: '#9C27B0',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    transitionTable: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
    },
    tableHeader: {
        padding: '10px',
        backgroundColor: '#f2f2f2',
        border: '1px solid #ddd',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableCell: {
        padding: '10px',
        border: '1px solid #ddd',
        textAlign: 'center',
    },
};

export default Lab5; 