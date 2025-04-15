import React, { useState } from 'react';

const AutomataInput = ({ automata, onChange, label }) => {
  // Храним сырые данные для каждого поля ввода
  const [rawStatesInput, setRawStatesInput] = useState(automata.states.join(' '));
  const [rawAlphabetInput, setRawAlphabetInput] = useState(automata.alphabet.join(' '));
  const [rawInitialStatesInput, setRawInitialStatesInput] = useState(automata.initialStates.join(' '));
  const [rawFinalStatesInput, setRawFinalStatesInput] = useState(automata.finalStates.join(' '));

  const handleStateChange = (e) => {
    const rawInput = e.target.value; // сохраняем строку как есть
    setRawStatesInput(rawInput);
    // Разбиваем строку по пробельным символам (оставляем все пробельные символы внутри строки, но отсекаем лишние края)
    const states = rawInput.trim().split(/\s+/).filter(Boolean);
    onChange({ ...automata, states });
  };

  const handleAlphabetChange = (e) => {
    const rawInput = e.target.value;
    setRawAlphabetInput(rawInput);
    const alphabet = rawInput.trim().split(/\s+/).filter(Boolean);
    onChange({ ...automata, alphabet });
  };

  const handleInitialStatesChange = (e) => {
    const rawInput = e.target.value;
    setRawInitialStatesInput(rawInput);
    const initialStates = rawInput.trim().split(/\s+/).filter(Boolean);
    onChange({ ...automata, initialStates });
  };

  const handleFinalStatesChange = (e) => {
    const rawInput = e.target.value;
    setRawFinalStatesInput(rawInput);
    const finalStates = rawInput.trim().split(/\s+/).filter(Boolean);
    onChange({ ...automata, finalStates });
  };

  const handleTransitionChange = (fromState, symbol, toState) => {
    const newTransitions = { ...automata.transitions };
    if (!newTransitions[fromState]) {
      newTransitions[fromState] = {};
    }
    newTransitions[fromState][symbol] = toState;
    onChange({ ...automata, transitions: newTransitions });
  };

  const handleOutputChange = (state, symbol, output) => {
    const newOutputFunction = { ...automata.outputFunction };
    if (!newOutputFunction[state]) {
      newOutputFunction[state] = {};
    }
    newOutputFunction[state][symbol] = output;
    onChange({ ...automata, outputFunction: newOutputFunction });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{label}</h3>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Состояния (через пробел):</label>
        <input
          style={styles.input}
          value={rawStatesInput} // отображаем сырые данные
          onChange={handleStateChange}
          placeholder="Например: q0 q1 q2"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Алфавит (через пробел):</label>
        <input
          style={styles.input}
          value={rawAlphabetInput}
          onChange={handleAlphabetChange}
          placeholder="Например: a b c"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Начальные состояния:</label>
        <input
          style={styles.input}
          value={rawInitialStatesInput}
          onChange={handleInitialStatesChange}
          placeholder="Например: q0"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Конечные состояния:</label>
        <input
          style={styles.input}
          value={rawFinalStatesInput}
          onChange={handleFinalStatesChange}
          placeholder="Например: q1 q2"
        />
      </div>

      <div style={styles.transitionsContainer}>
        <label style={styles.label}>Таблица переходов:</label>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Состояние</th>
              {automata.alphabet.map((symbol) => (
                <th key={symbol} style={styles.tableHeader}>
                  {symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {automata.states.map((state) => (
              <tr key={state}>
                <td style={styles.tableCell}>
                  {automata.initialStates.includes(state) && '→ '}
                  {automata.finalStates.includes(state) && '← '}
                  {state}
                </td>
                {automata.alphabet.map((symbol) => (
                  <td key={`${state}-${symbol}`} style={styles.tableCell}>
                    <select
                      style={styles.select}
                      value={automata.transitions[state]?.[symbol] || ''}
                      onChange={(e) => handleTransitionChange(state, symbol, e.target.value)}
                    >
                      <option value="">-</option>
                      {automata.states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {automata.outputFunction && (
        <div style={styles.transitionsContainer}>
          <label style={styles.label}>Таблица выходов:</label>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Состояние</th>
                {automata.alphabet.map((symbol) => (
                  <th key={symbol} style={styles.tableHeader}>
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {automata.states.map((state) => (
                <tr key={state}>
                  <td style={styles.tableCell}>{state}</td>
                  {automata.alphabet.map((symbol) => (
                    <td key={`${state}-${symbol}`} style={styles.tableCell}>
                      <input
                        style={styles.input}
                        value={automata.outputFunction[state]?.[symbol] || ''}
                        onChange={(e) => handleOutputChange(state, symbol, e.target.value)}
                        placeholder="выход"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
  title: {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#333',
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
  transitionsContainer: {
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    textAlign: 'center',
  },
  tableCell: {
    padding: '10px',
    border: '1px solid #dee2e6',
    textAlign: 'center',
  },
  select: {
    width: '100%',
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
};

export default AutomataInput;
