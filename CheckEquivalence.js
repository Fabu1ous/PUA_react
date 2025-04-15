// CheckEquivalence.js
import React, { useState } from 'react';
import Matrix from './Matrix';
import { useNavigate } from 'react-router-dom';

const CheckEquivalence = () => {
    const [matrixSize, setMatrixSize] = useState('');
    const [showMatrix, setShowMatrix] = useState(false);
    const navigate = useNavigate();

    const handleCreateMatrix = () => {
        const size = parseInt(matrixSize, 10);
        if (isNaN(size) || size <= 0) {
            alert('Некорректный размер матрицы');
            return;
        }
        setShowMatrix(true);
    };

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

            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Проверка отношения эквивалентности</h1>

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

            {/* Отображение матрицы и графа */}
            {showMatrix && <Matrix size={parseInt(matrixSize, 10)} />}
        </div>
    );
};

export default CheckEquivalence;