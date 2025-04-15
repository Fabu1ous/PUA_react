// src/utils/lab2Utils.js

/**
 * Функция для вывода матрицы в виде строки.
 * @param {Array<Array<number>>} matrix - Двумерная матрица.
 * @returns {string} Строковое представление матрицы.
 */
export function printMatrix(matrix) {
    if (!Array.isArray(matrix) || !matrix.every(row => Array.isArray(row))) {
        throw new Error("Input must be a 2D array");
    }
    return matrix.map(row => row.join(' ')).join('\n');
}

/**
 * Строит матрицу сравнения чисел: matrix[i][j] = 1, если numbers[i] < numbers[j].
 * @param {Array<number>} numbers - Массив чисел.
 * @returns {Array<Array<number>>} Матрица сравнения чисел.
 */
export function buildComparisonMatrix(numbers) {
    validateNumberArray(numbers);
    return numbers.map((rowValue, rowIndex) =>
        numbers.map((colValue, colIndex) => (rowValue < colValue ? 1 : 0))
    );
}

/**
 * Строит матрицу делимости: matrix[i][j] = 1, если numbers[j] делится на numbers[i].
 * @param {Array<number>} numbers - Массив чисел.
 * @returns {Array<Array<number>>} Матрица делимости.
 */
export function buildDivMatrix(numbers) {
    validateNumberArray(numbers);
    return numbers.map((rowValue, rowIndex) =>
        numbers.map((colValue, colIndex) => (colValue % rowValue === 0 ? 1 : 0))
    );
}

/**
 * Находит минимальные элементы (ровно одна 1 в столбце).
 * @param {Array<Array<number>>} m - Матрица.
 * @returns {Array<number>} Индексы минимальных элементов.
 */
export function findMinElementsIndexes(m) {
    validateMatrix(m);
    const minIndexes = [];
    for (let i = 0; i < m.length; i++) {
        let count = 0;
        let index = -1;
        for (let j = 0; j < m.length; j++) {
            if (m[j][i] === 1) {
                count++;
                index = j;
                if (count > 1) break;
            }
        }
        if (count === 1) minIndexes.push(index);
    }
    return minIndexes;
}

/**
 * Находит максимальные элементы (ровно одна 1 в строке).
 * @param {Array<Array<number>>} m - Матрица.
 * @returns {Array<number>} Индексы максимальных элементов.
 */
export function findMaxElementsIndexes(m) {
    validateMatrix(m);
    const maxIndexes = [];
    for (let i = 0; i < m.length; i++) {
        let count = 0;
        let index = -1;
        for (let j = 0; j < m.length; j++) {
            if (m[i][j] === 1) {
                count++;
                index = j;
                if (count > 1) break;
            }
        }
        if (count === 1) maxIndexes.push(index);
    }
    return maxIndexes;
}

/**
 * Построение матрицы лексикографического порядка.
 * @param {Array<string>} words - Массив слов.
 * @returns {Array<Array<number>>} Матрица лексикографического порядка.
 */
export function lexicographicOrder(words) {
    validateStringArray(words);
    return words.map(word1 =>
        words.map(word2 => (compareLexicographic(word1, word2) ? 1 : 0))
    );
}

/**
 * Сравнивает два слова лексикографически.
 * @param {string} word1 - Первое слово.
 * @param {string} word2 - Второе слово.
 * @returns {boolean} Результат сравнения.
 */
function compareLexicographic(word1, word2) {
    const minLength = Math.min(word1.length, word2.length);
    for (let i = 0; i < minLength; i++) {
        if (word1[i] < word2[i]) return true;
        if (word1[i] > word2[i]) return false;
    }
    return word1.length <= word2.length;
}

/**
 * Сравнивает слова побуквенно.
 * @param {string} word1 - Первое слово.
 * @param {string} word2 - Второе слово.
 * @returns {boolean} Результат сравнения.
 */
export function compareByLetter(word1, word2) {
    if (typeof word1 !== 'string' || typeof word2 !== 'string') {
        throw new Error("Both inputs must be strings");
    }
    const minLength = Math.min(word1.length, word2.length);
    for (let i = 0; i < minLength; i++) {
        if (word1[i] > word2[i]) return false;
    }
    return true;
}

/**
 * Строит матрицу побуквенного порядка.
 * @param {Array<string>} words - Массив слов.
 * @returns {Array<Array<number>>} Матрица побуквенного порядка.
 */
export function letterOrder(words) {
    validateStringArray(words);
    return words.map(word1 =>
        words.map(word2 => (compareByLetter(word1, word2) ? 1 : 0))
    );
}

/**
 * Универсальная функция для построения диаграммы Хассе.
 * @param {Array} elements - Элементы для построения диаграммы.
 * @param {Function} orderFunction - Функция для построения матрицы порядка.
 * @returns {Object} Диаграмма Хассе (уровни и связи).
 */
export function buildHasseDiagram(elements, orderFunction) {
    const diagram = [];
    let currentElements = [...elements];

    while (currentElements.length > 0) {
        const orderMatrix = orderFunction(currentElements);
        const minIndices = findMinElementsIndexes(orderMatrix);
        const minElements = minIndices.map(i => currentElements[i]);
        diagram.push(minElements);
        currentElements = currentElements.filter((_, i) => !minIndices.includes(i));
    }

    // Создание связей между уровнями
    const links = [];
    for (let i = 0; i < diagram.length; i++) {
        for (let j = i + 1; j < diagram.length; j++) {
            diagram[i].forEach(parent => {
                diagram[j].forEach(child => {
                    if (orderFunction([parent, child])[0][1] === 1) {
                        links.push({ source: parent, target: child });
                    }
                });
            });
        }
    }

    return { levels: diagram, links };
}

/**
 * Диаграмма Хассе для чисел.
 * @param {Array<number>} numbers - Массив чисел.
 * @returns {Object} Диаграмма Хассе для чисел.
 */
export function buildHasseDiagramNumbers(numbers) {
    return buildHasseDiagram(numbers, buildDivMatrix);
}

/**
 * Диаграмма Хассе для побуквенного сравнения слов.
 * @param {Array<string>} words - Массив слов.
 * @returns {Object} Диаграмма Хассе для побуквенного сравнения слов.
 */
export function buildHasseDiagramByLetter(words) {
    return buildHasseDiagram(words, letterOrder);
}

/**
 * Диаграмма Хассе для лексикографического сравнения слов.
 * @param {Array<string>} words - Массив слов.
 * @returns {Object} Диаграмма Хассе для лексикографического сравнения слов.
 */
export function buildHasseDiagramLex(words) {
    return buildHasseDiagram(words, lexicographicOrder);
}

/**
 * Проверяет, является ли set1 подмножеством set2.
 * @param {Array} set1 - Первое множество.
 * @param {Array} set2 - Второе множество.
 * @returns {boolean} Результат проверки.
 */
export const isSubset = (setA, setB) => {
    return setA.every(item => setB.includes(item));
};


/**
 * Находит минимальные элементы относительно вложенности.
 * @param {Array<Array>} sets - Массив множеств.
 * @returns {Array<Array>} Минимальные элементы.
 */
export const findMinElementsBySubset = (sets) => {
    const minElements = [];
    const inclusionFlags = Array(sets.length).fill(0);

    sets.forEach((setA, i) => {
        sets.forEach((setB, j) => {
            if (i !== j && isSubset(setB, setA)) {
                inclusionFlags[i] += 1;
            }
        });
    });

    sets.forEach((set, i) => {
        if (inclusionFlags[i] === 0) {
            minElements.push(set);
        }
    });

    return minElements;
};


/**
 * Строит матрицу покрытия.
 * @param {Array} elements - Элементы.
 * @param {Function} comparisonFunc - Функция сравнения.
 * @returns {Array<Array<number>>} Матрица покрытия.
 */
export function buildCoverMatrix(elements, comparisonFunc) {
    const n = elements.length;
    const coverMatrix = Array.from({ length: n }, () => Array(n).fill(0));

    // Построение матрицы отношений
    const relationMatrix = elements.map((rowElement, i) =>
        elements.map((colElement, j) => comparisonFunc(rowElement, colElement) ? 1 : 0)
    );

    // Определение отношений покрытия
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (relationMatrix[i][j] && i !== j) {
                let isCover = true;
                for (let k = 0; k < n; k++) {
                    if (relationMatrix[i][k] && relationMatrix[k][j] && i !== k && k !== j) {
                        isCover = false;
                        break;
                    }
                }
                if (isCover) coverMatrix[i][j] = 1;
            }
        }
    }

    return coverMatrix;
}

/**
 * Пример использования функции для чисел (делимости).
 * @param {number} x - Первое число.
 * @param {number} y - Второе число.
 * @returns {boolean} Результат сравнения.
 */
export function numberComparison(x, y) {
    return x < y && y % x === 0;
}

/**
 * Пример использования функции для слов (лексикографический порядок).
 * @param {string} word1 - Первое слово.
 * @param {string} word2 - Второе слово.
 * @returns {boolean} Результат сравнения.
 */
export function lexicographicComparison(word1, word2) {
    return word1 < word2;
}

/**
 * Создает контекстную матрицу.
 * @param {number} size - Размер матрицы.
 * @param {Array<Array<number>>} inputMatrix - Исходная матрица контекста.
 * @returns {Array<Array<number>>} Построенная матрица контекста.
 */
export function buildContextMatrix(inputMatrix) {
    if (!Array.isArray(inputMatrix) || !inputMatrix.every(row => Array.isArray(row))) {
        throw new Error("Матрица контекста должна быть двумерным массивом");
    }
    const rowLength = inputMatrix[0].length;
    if (!inputMatrix.every(row => row.length === rowLength)) {
        throw new Error("Каждая строка матрицы должна иметь одинаковое количество столбцов");
    }
    return inputMatrix.map(row => [...row]);
}


/**
 * Генерирует объекты и атрибуты.
 * @param {number} size - Размер.
 * @returns {Object} Объекты и атрибуты.
 */
export const getObjectsAndAttributes = (rows, cols) => {
    const objects = Array.from({ length: rows }, (_, i) => i + 1);
    const attributes = Array.from({ length: cols }, (_, i) => String.fromCharCode(97 + i));
    return { objects, attributes };
};




/**
 * Построение пар отношений.
 * @param {Array<Array<number>>} contextMatrix - Матрица контекста.
 * @param {Array<number>} objects - Объекты.
 * @param {Array<string>} attributes - Атрибуты.
 * @returns {Array<Array<number>>} Пары отношений.
 */
export const buildRelationPairs = (contextMatrix, objects, attributes) => {
    try {
        const pairs = [];
        contextMatrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 1) pairs.push([objects[i], attributes[j]]);
            });
        });
        return pairs;
    } catch (error) {
        console.error("Ошибка в buildRelationPairs:", error);
        return [];
    }
};

/**
 * Построение замыканий (исправлено).
 * @param {Array<number>} objects - Объекты.
 * @param {Array<Array<number>>} contextMatrix - Матрица контекста.
 * @returns {Array<Object>} Замыкания.
 */
export const buildClosures = (objects, contextMatrix, attributes) => {
    const closures = [];
    
    // Для каждого объекта сначала создаем одиночные замыкания
    objects.forEach((obj, objIndex) => {
        const currentAttributes = attributes.filter((_, attrIndex) => 
            contextMatrix[objIndex][attrIndex] === 1
        );
        
        closures.push({
            objects: [obj],
            attributes: currentAttributes
        });
    });

    // Для каждой пары объектов
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const currentObjects = [objects[i], objects[j]];
            const currentAttributes = attributes.filter((_, attrIndex) => 
                contextMatrix[i][attrIndex] === 1 && contextMatrix[j][attrIndex] === 1
            );
            
            closures.push({
                objects: currentObjects,
                attributes: currentAttributes
            });
        }
    }

    // Для всех трех объектов
    if (objects.length >= 3) {
        const allObjects = [...objects];
        const commonAttributes = attributes.filter((_, attrIndex) => 
            objects.every((_, objIndex) => contextMatrix[objIndex][attrIndex] === 1)
        );
        
        closures.push({
            objects: allObjects,
            attributes: commonAttributes
        });
    }

    return closures;
};





/**
 * Построение концептов (исправлено).
 * @param {Array<Object>} closures - Замыкания.
 * @param {Array<string>} attributes - Атрибуты.
 * @param {Array<Array<number>>} contextMatrix - Матрица контекста.
 * @returns {Array<Object>} Концепты.
 */
export const buildConcepts = (closures, attributes, contextMatrix) => {
    const concepts = new Set();
    
    // Добавляем нижний концепт (пустое множество объектов)
    concepts.add(JSON.stringify({
        objects: [],
        attributes: [...attributes]
    }));

    // Добавляем концепты из замыканий
    closures.forEach(closure => {
        // Находим все объекты, которые имеют все атрибуты из closure.attributes
        const extent = [];
        contextMatrix.forEach((row, objIndex) => {
            const hasAllAttributes = closure.attributes.every((attr, attrIndex) => {
                const attrIndex2 = attributes.indexOf(attr);
                return row[attrIndex2] === 1;
            });
            if (hasAllAttributes) {
                extent.push(objIndex + 1);
            }
        });

        // Находим все атрибуты, общие для всех объектов из extent
        const intent = attributes.filter((_, attrIndex) => 
            extent.every(obj => contextMatrix[obj - 1][attrIndex] === 1)
        );

        concepts.add(JSON.stringify({
            objects: extent,
            attributes: intent
        }));
    });

    // Добавляем верхний концепт (все объекты)
    concepts.add(JSON.stringify({
        objects: Array.from({ length: contextMatrix.length }, (_, i) => i + 1),
        attributes: []
    }));

    return Array.from(concepts).map(c => JSON.parse(c));
};





/**
 * Построение диаграммы Хассе для контекстов (исправлено).
 * @param {Array<Object>} closures - Замыкания.
 * @returns {Object} Диаграмма Хассе.
 */
export const buildHasseDiagramContext = (concepts) => {
    // Сортируем концепты по количеству объектов и атрибутов
    const sortedConcepts = [...concepts].sort((a, b) => {
        if (a.objects.length !== b.objects.length) {
            return a.objects.length - b.objects.length;
        }
        return b.attributes.length - a.attributes.length;
    });

    // Группируем по уровням
    const levels = [];
    let currentLevel = [];
    let currentObjectsCount = sortedConcepts[0]?.objects.length ?? 0;

    sortedConcepts.forEach(concept => {
        if (concept.objects.length === currentObjectsCount) {
            currentLevel.push(concept);
        } else {
            if (currentLevel.length > 0) {
                levels.push([...currentLevel]);
            }
            currentLevel = [concept];
            currentObjectsCount = concept.objects.length;
        }
    });
    
    if (currentLevel.length > 0) {
        levels.push(currentLevel);
    }

    // Создаем связи
    const links = [];
    for (let i = 0; i < levels.length - 1; i++) {
        const upperLevel = levels[i];
        const lowerLevel = levels[i + 1];

        upperLevel.forEach(upper => {
            // Находим все непосредственные нижние соседи для текущего концепта
            const directLowerNeighbors = findDirectLowerNeighbors(upper, lowerLevel);
            
            directLowerNeighbors.forEach(lower => {
                links.push({
                    source: upper,
                    target: lower
                });
            });
        });
    }

    // Проверяем, что каждый концепт (кроме крайних) имеет связи
    validateConnections(levels, links);

    return { levels, links };
};

// Находит непосредственных нижних соседей для концепта
function findDirectLowerNeighbors(concept, lowerLevel) {
    const directNeighbors = [];
    
    // Находим все концепты нижнего уровня, которые могут быть связаны с текущим
    const potentialNeighbors = lowerLevel.filter(lower => {
        // Проверяем условия решетки концептов:
        // 1. Все объекты верхнего концепта должны быть в нижнем
        const isObjectSubset = concept.objects.every(obj => 
            lower.objects.includes(obj)
        );
        
        // 2. Все атрибуты нижнего концепта должны быть в верхнем
        const isAttributeSubset = lower.attributes.every(attr => 
            concept.attributes.includes(attr)
        );
        
        // 3. Разница в количестве объектов должна быть минимальной
        const objectsDiff = lower.objects.length - concept.objects.length;
        
        return isObjectSubset && isAttributeSubset && objectsDiff > 0;
    });

    // Среди потенциальных соседей выбираем те, для которых разница минимальна
    if (potentialNeighbors.length > 0) {
        const minDiff = Math.min(...potentialNeighbors.map(n => 
            n.objects.length - concept.objects.length
        ));
        
        directNeighbors.push(...potentialNeighbors.filter(n => 
            n.objects.length - concept.objects.length === minDiff
        ));
    }

    return directNeighbors;
}

// Проверяет, что все концепты (кроме крайних) имеют связи
function validateConnections(levels, links) {
    // Пропускаем первый (нижний) и последний (верхний) уровни
    for (let i = 1; i < levels.length - 1; i++) {
        levels[i].forEach(concept => {
            const hasUpperConnection = links.some(link => 
                JSON.stringify(link.target) === JSON.stringify(concept)
            );
            const hasLowerConnection = links.some(link => 
                JSON.stringify(link.source) === JSON.stringify(concept)
            );

            if (!hasUpperConnection || !hasLowerConnection) {
                console.error('Найдена повисшая вершина:', concept);
                throw new Error('Обнаружена повисшая вершина в решетке концептов');
            }
        });
    }
}

// Вспомогательные функции валидации
function validateNumberArray(arr) {
    if (!Array.isArray(arr) || arr.some(isNaN)) {
        throw new Error("Input must be an array of numbers");
    }
}

function validateStringArray(arr) {
    if (!Array.isArray(arr) || arr.some(word => typeof word !== 'string')) {
        throw new Error("Input must be an array of strings");
    }
}

function validateMatrix(matrix) {
    if (!Array.isArray(matrix) || !matrix.every(row => Array.isArray(row) && row.length === matrix.length)) {
        throw new Error("Input must be a square matrix");
    }
}
