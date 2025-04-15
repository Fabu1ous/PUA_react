// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import Lab1Menu from './components/Lab1Menu';
import Lab2Menu from './components/Lab2Menu';
import WorkWithNumbers from './components/WorkWithNumbers';
import LexicographicOrder from './components/WorkWithWords';
import LetterOrder from './components/WorkWithWordsLetter';
import ContextMatrix from './components/WorkWithContextMatrix';
import BinaryOperations from './components/BinaryOperations';
import ClassifyRelations from './components/ClassifyRelations';
import CheckEquivalence from './components/CheckEquivalence';
import BuildClosures from './components/BuildClosures';
import Lab3 from './components/Lab3';
import Lab4 from './components/Lab4';
import Lab5 from './components/Lab5';
import Lab6 from './components/Lab6';

function App() {
    return (
        <Router>
            <Routes>
                {/* Главное меню */}
                <Route path="/" element={<MainMenu />} />

                {/* Лабораторная работа 1 */}
                <Route path="/lab1" element={<Lab1Menu />} />
                <Route path="/lab1/binary-operations" element={<BinaryOperations />} />
                <Route path="/lab1/classify-relations" element={<ClassifyRelations />} />
                <Route path="/lab1/check-equivalence" element={<CheckEquivalence />} />
                <Route path="/lab1/build-closures" element={<BuildClosures />} />

                {/* Лабораторная работа 2 */}
                <Route path="/lab2" element={<Lab2Menu />} />
                <Route path="/lab2/work-with-numbers" element={<WorkWithNumbers />} />
                <Route path="/lab2/work-with-words" element={<LexicographicOrder />} />
                <Route path="/lab2/work-with-words-letter" element={<LetterOrder />} />
                <Route path="/lab2/work-with-context-matrix" element={<ContextMatrix />} />

                {/* Лабораторная работа 3 */}
                <Route path="/lab3" element={<Lab3 />} />

                {/* Лабораторная работа 4 */}
                <Route path="/lab4" element={<Lab4 />} />

                {/* Лабораторная работа 5 */}
                <Route path="/lab5" element={<Lab5 />} />

                {/* Лабораторная работа 6 */}
                <Route path="/lab6" element={<Lab6 />} />
            </Routes>
        </Router>
    );
}

export default App;