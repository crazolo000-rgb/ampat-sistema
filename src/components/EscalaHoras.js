import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function getDiasDoMes(mes, ano) {
  const dias = [];
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = new Date(ano, mes, dia);
    dias.push({
      dia,
      semana: diasSemana[data.getDay()],
      entrada: '',
      descanso: '',
      saida: '',
      horasTrabalhadas: '',
      horasExtras: '',
      total: '',
      feriado: false
    });
  }
  return dias;
}

export default function EscalaHoras({ funcionario, mes, ano, isAdmin }) {
  const [dias, setDias] = useState(() => getDiasDoMes(mes, ano));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const ref = doc(collection(db, 'escalas'), `${funcionario}_${mes+1}_${ano}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDias(snap.data().dias);
      } else {
        setDias(getDiasDoMes(mes, ano));
      }
      setLoading(false);
    }
    fetchData();
  }, [funcionario, mes, ano]);

  function handleChange(idx, campo, valor) {
    setDias(dias => dias.map((d, i) => i === idx ? { ...d, [campo]: valor } : d));
  }

  async function salvarEscala() {
    const ref = doc(collection(db, 'escalas'), `${funcionario}_${mes+1}_${ano}`);
    await setDoc(ref, { funcionario, mes, ano, dias });
    alert('Escala salva com sucesso!');
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="font-bold text-lg mb-4">Escala de Horas - {funcionario}</h2>
      <table className="min-w-full border text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th>DIA</th>
            <th>SEMANA</th>
            <th>ENTRADA</th>
            <th>DESCANSO</th>
            <th>SAÍDA</th>
            <th>H. TRABALHADAS</th>
            <th>HORAS EXTRA</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {dias.map((d, idx) => (
            <tr key={idx} className={d.semana === 'sábado' || d.semana === 'domingo' ? 'bg-purple-100' : ''}>
              <td>{d.dia}</td>
              <td>{d.semana}</td>
              <td>
                <input type="text" value={d.entrada} disabled={!isAdmin} onChange={e => handleChange(idx, 'entrada', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.descanso} disabled={!isAdmin} onChange={e => handleChange(idx, 'descanso', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.saida} disabled={!isAdmin} onChange={e => handleChange(idx, 'saida', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.horasTrabalhadas} disabled={!isAdmin} onChange={e => handleChange(idx, 'horasTrabalhadas', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.horasExtras} disabled={!isAdmin} onChange={e => handleChange(idx, 'horasExtras', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.total} disabled={!isAdmin} onChange={e => handleChange(idx, 'total', e.target.value)} className="border px-1 w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isAdmin && (
        <button onClick={salvarEscala} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Salvar Escala</button>
      )}
    </div>
  );
}
