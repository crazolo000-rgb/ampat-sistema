import React, { useState } from 'react';

function CarnetConfig() {
  const [pixKey, setPixKey] = useState('');

  return (
    <div>
      <input
        type="text"
        value={pixKey}
        onChange={e => setPixKey(e.target.value)}
        placeholder="Ex: CNPJ, Email ou Celular"
      />
    </div>
  );
}

export default CarnetConfig;