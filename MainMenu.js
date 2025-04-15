// src/components/MainMenu.js
import React from 'react';
import { Link } from 'react-router-dom';

const MainMenu = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Главное меню</h1>
            <div style={styles.buttonContainer}>
                {/* Кнопка для перехода к Лабораторной работе 1 */}
                <Link to="/lab1" style={styles.menuButton}>
                    Лабораторная работа 1
                </Link>

                {/* Кнопка для перехода к Лабораторной работе 2 */}
                <Link to="/lab2" style={styles.menuButton}>
                    Лабораторная работа 2
                </Link>

                {/* Кнопка для перехода к Лабораторной работе 3 */}
                <Link to="/lab3" style={styles.menuButton}>
                    Лабораторная работа 3
                </Link>

                {/* Кнопка для перехода к Лабораторной работе 4 */}
                <Link to="/lab4" style={styles.menuButton}>
                    Лабораторная работа 4
                </Link>

                {/* Кнопка для перехода к Лабораторной работе 5 */}
                <Link to="/lab5" style={styles.menuButton}>
                    Лабораторная работа 5
                </Link>

                {/* Кнопка для перехода к Лабораторной работе 6 */}
                <Link to="/lab6" style={styles.menuButton}>
                    Лабораторная работа 6
                </Link>
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
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '400px',
    },
    menuButton: {
        display: 'block',
        padding: '15px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#4CAF50',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        textDecoration: 'none',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        ':hover': {
            backgroundColor: '#45a049',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
        },
        ':active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
    },
};

export default MainMenu;