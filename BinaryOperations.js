// BinaryOperations.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BinaryOperations = () => {
    const [pPairs, setPPairs] = useState('');
    const [qPairs, setQPairs] = useState('');
    const [pPairsDisplay, setPPairsDisplay] = useState('[]');
    const [qPairsDisplay, setQPairsDisplay] = useState('[]');
    const [result, setResult] = useState('');

    const navigate = useNavigate();

    const updatePairsDisplay = (input, setPairs) => {
        const pairs = input
            .split('\n')
            .map(pair => pair.trim())
            .filter(pair => pair)
            .map(pair => {
                const elements = pair.split(' ');
                return `(${elements.join(', ')})`;
            })
            .join(', ');

        setPairs(pairs.length > 0 ? `[${pairs}]` : '[]');
    };

    const handleCalculate = () => {
        try {
            const p = parsePairs(pPairs);
            const q = parsePairs(qPairs);

            const inversP = inversBinar(p);
            const intersectionPQ = intersection(p, q);
            const unionPQ = [...new Set([...p, ...q])];
            const compositionPQ = composition(p, q);

            setResult(`
                p = ${JSON.stringify(p)}
                q = ${JSON.stringify(q)}

                p^(-1) = ${JSON.stringify(inversP)}
                p ∩ q = ${JSON.stringify(intersectionPQ)}
                p ∪ q = ${JSON.stringify(unionPQ)}
                pq = ${JSON.stringify(compositionPQ)}
            `);
        } catch (error) {
            setResult(`Ошибка: ${error.message}`);
        }
    };

    const parsePairs = (input) => {
        return input
            .split('\n')
            .map(pair => pair.trim())
            .filter(pair => pair)
            .map(pair => {
                const values = pair.split(' ').map(Number);
                return values.every(val => !isNaN(val)) ? values : null;
            })
            .filter(pair => pair !== null);
    };

    const inversBinar = (p) => {
        return p.map(pair => [...pair].reverse());
    };

    const intersection = (p, q) => {
        return p.filter(pair => q.some(qPair => JSON.stringify(qPair) === JSON.stringify(pair)));
    };

    const composition = (p, q) => {
        const result = [];
        for (const pairP of p) {
            for (const pairQ of q) {
                if (pairP[1] === pairQ[0]) {
                    result.push([pairP[0], pairQ[1]]);
                }
            }
        }
        return result;
    };

    return (
        <div style={styles.container}>
            {/* Кнопка возврата */}
            <button
                onClick={() => navigate('/')}
                style={styles.backButton}
            >
                ← Главное меню
            </button>

            <h1 style={styles.title}>Операции над бинарными отношениями</h1>

            <div style={styles.inputContainer}>
                {/* Левая часть: Ввод для p */}
                <div style={styles.column}>
                    <label style={styles.label}>Введите пары для p:</label>
                    <textarea
                        value={pPairs}
                        onChange={(e) => {
                            setPPairs(e.target.value);
                            updatePairsDisplay(e.target.value, setPPairsDisplay);
                        }}
                        style={styles.textarea}
                    />
                    <div style={styles.display}>
                        <strong>p = </strong> {pPairsDisplay}
                    </div>
                </div>

                {/* Правая часть: Ввод для q */}
                <div style={styles.column}>
                    <label style={styles.label}>Введите пары для q:</label>
                    <textarea
                        value={qPairs}
                        onChange={(e) => {
                            setQPairs(e.target.value);
                            updatePairsDisplay(e.target.value, setQPairsDisplay);
                        }}
                        style={styles.textarea}
                    />
                    <div style={styles.display}>
                        <strong>q = </strong> {qPairsDisplay}
                    </div>
                </div>
            </div>

            {/* Кнопка "Рассчитать" */}
            <button
                onClick={handleCalculate}
                style={styles.calculateButton}
            >
                Рассчитать
            </button>

            {/* Поле для вывода результата */}
            <div style={styles.resultContainer}>
                <h2 style={styles.resultTitle}>Результат:</h2>
                <pre style={styles.resultText}>{result}</pre>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
    },
    backButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#FF5722',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    title: {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '30px',
    },
    inputContainer: {
        display: 'flex',
        gap: '50px',
        justifyContent: 'center',
        marginBottom: '30px',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        width: '40%',
    },
    label: {
        fontSize: '18px',
        marginBottom: '10px',
        color: '#333',
    },
    textarea: {
        width: '100%',
        height: '100px',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        resize: 'none',
    },
    display: {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
        color: '#333',
    },
    calculateButton: {
        padding: '10px 20px',
        fontSize: '18px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        alignSelf: 'center',
        marginBottom: '30px',
    },
    resultContainer: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    resultTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    resultText: {
        fontSize: '16px',
        color: '#333',
        whiteSpace: 'pre-wrap',
    },
};

export default BinaryOperations;