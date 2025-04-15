// src/components/Lab2Menu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Lab2Menu = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Лабораторная работа 2</h1>
            <button
                style={styles.backButton}
                onClick={() => navigate('/')}
            >
                ← Главное меню
            </button>
            <div style={styles.buttonContainer}>
                {/* Кнопка для работы с числами */}
                <button
                    style={styles.menuButton}
                    onClick={() => navigate('/lab2/work-with-numbers')}
                >
                    Работа с числами (матрица делимости и диаграмма Хассе)
                </button>

                {/* Кнопка для работы со словами (лексикографический порядок) */}
                <button
                    style={styles.menuButton}
                    onClick={() => navigate('/lab2/work-with-words')}
                >
                    Работа со словами (лексикографический порядок и диаграмма Хассе)
                </button>

                {/* Кнопка для работы со словами (побуквенный порядок) */}
                <button
                    style={styles.menuButton}
                    onClick={() => navigate('/lab2/work-with-words-letter')}
                >
                    Работа со словами (побуквенный порядок и диаграмма Хассе)
                </button>

                {/* Кнопка для работы с матрицей контекста */}
                <button
                    style={styles.menuButton}
                    onClick={() => navigate('/lab2/work-with-context-matrix')}
                >
                    Работа с матрицей контекста (замыкания, концепты, диаграмма Хассе)
                </button>
            </div>
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
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '400px',
    },
    menuButton: {
        padding: '15px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#4CAF50',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
};

export default Lab2Menu;