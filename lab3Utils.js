/**
 * Проверяет ассоциативность операции
 */
export const isAssociative = (table) => {
    const n = table.length;
    for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
            for (let c = 0; c < n; c++) {
                if (table[table[a][b]][c] !== table[a][table[b][c]]) {
                    return false;
                }
            }
        }
    }
    return true;
};

/**
 * Вычисляет порядок элемента
 */
export const elementOrder = (table, element) => {
    const visited = new Set();
    let current = element;
    while (!visited.has(current)) {
        visited.add(current);
        current = table[current][current];
    }
    return visited.size;
};

/**
 * Генерирует подполугруппу
 */
export const generateSubsemigroup = (table, subset) => {
    let subsemigroup = new Set(subset);
    let newElements = new Set(subset);

    while (newElements.size > 0) {
        const nextElements = new Set();
        for (const a of newElements) {
            for (const b of subsemigroup) {
                nextElements.add(table[a][b]);
                nextElements.add(table[b][a]);
            }
        }
        newElements = new Set([...nextElements].filter(x => !subsemigroup.has(x)));
        for (const elem of newElements) {
            subsemigroup.add(elem);
        }
    }
    return Array.from(subsemigroup).sort((a, b) => a - b);
};

/**
 * Выполняет композицию двух матриц бинарных отношений
 */
export const compositionMatrix = (M1, M2) => {
    const n = M1.length;
    const result = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                result[i][j] |= M1[i][k] & M2[k][j];
            }
        }
    }
    return result;
};

/**
 * Генерирует полугруппу бинарных отношений
 */
export const generateSemigroupOfRelations = (matrices) => {
    // Создаем начальное множество из исходных матриц
    let result = new Set(matrices.map(m => JSON.stringify(m)));
    
    console.log("Начальные матрицы:", matrices);
    console.log("Текущее множество:", Array.from(result).map(m => JSON.parse(m)));
    
    let changed = true;
    while (changed) {
        changed = false;
        const currentMatrices = Array.from(result).map(m => JSON.parse(m));
        
        for (let i = 0; i < currentMatrices.length; i++) {
            for (let j = 0; j < currentMatrices.length; j++) {
                const composition = compositionMatrix(currentMatrices[i], currentMatrices[j]);
                const compositionStr = JSON.stringify(composition);
                
                if (!result.has(compositionStr)) {
                    console.log(`Добавлена новая матрица (M${i+1} * M${j+1}):`, composition);
                    result.add(compositionStr);
                    changed = true;
                }
            }
        }
        
        if (changed) {
            console.log("Текущий размер полугруппы:", result.size);
        }
    }
    
    const finalResult = Array.from(result).map(m => JSON.parse(m));
    console.log("Финальный результат:", finalResult);
    return finalResult;
};

/**
 * Проверяет корректность введенной матрицы
 */
export const validateMatrix = (matrix) => {
    if (!matrix || !Array.isArray(matrix)) {
        throw new Error("Матрица не определена");
    }
    
    const n = matrix.length;
    for (const row of matrix) {
        if (!Array.isArray(row) || row.length !== n) {
            throw new Error("Неверный формат матрицы");
        }
        for (const cell of row) {
            if (typeof cell !== 'number' || (cell !== 0 && cell !== 1)) {
                throw new Error("Матрица должна содержать только 0 и 1");
            }
        }
    }
    return true;
}; 