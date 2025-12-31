import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
  function exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Escala de Horas - ${funcionario} - ${meses[mes]}/${ano}`, 10, 10);
    autoTable(doc, {
      startY: 20,
      head: [[
        'DIA', 'SEMANA', 'FERIADO', 'ENTRADA', 'DESCANSO', 'SAÍDA', 'H. TRABALHADAS', 'HORAS EXTRA', 'TOTAL'
      ]],
      body: dias.map(d => [
        d.dia,
        d.semana,
        d.feriado ? 'Sim' : '',
        d.entrada,
        d.descanso,
        d.saida,
        d.horasTrabalhadas,
        d.horasExtras,
        d.total
      ])
    });
    doc.save(`escala_${funcionario}_${mes+1}_${ano}.pdf`);
  }

  function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(dias.map(d => ({
      DIA: d.dia,
      SEMANA: d.semana,
      FERIADO: d.feriado ? 'Sim' : '',
      ENTRADA: d.entrada,
      DESCANSO: d.descanso,
      SAIDA: d.saida,
      'H. TRABALHADAS': d.horasTrabalhadas,
      'HORAS EXTRA': d.horasExtras,
      TOTAL: d.total
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Escala');
    XLSX.writeFile(wb, `escala_${funcionario}_${mes+1}_${ano}.xlsx`);
  }
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

export default function EscalaHoras({ funcionario, mes: mesProp, ano: anoProp, isAdmin = false }) {
    // Debug: Warn if isAdmin is undefined
    useEffect(() => {
      if (typeof isAdmin === 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('EscalaHoras: isAdmin prop is undefined!');
      }
    }, [isAdmin]);
  EscalaHoras.propTypes = {
    funcionario: PropTypes.string.isRequired,
    mes: PropTypes.number,
    ano: PropTypes.number,
    isAdmin: PropTypes.bool
  };
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const anoAtual = new Date().getFullYear();
  const [mes, setMes] = useState(mesProp ?? new Date().getMonth());
  const [ano, setAno] = useState(anoProp ?? anoAtual);
  const [dias, setDias] = useState(() => getDiasDoMes(mes, ano));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDias(getDiasDoMes(mes, ano));
  }, [mes, ano]);

  useEffect(() => {
    let ativo = true;
    async function fetchData() {
      setLoading(true);
      try {
        const ref = doc(collection(db, 'escalas'), `${funcionario}_${mes+1}_${ano}`);
        const snap = await getDoc(ref);
        if (!ativo) return;
        if (snap.exists()) {
          setDias(snap.data().dias);
        } else {
          setDias(getDiasDoMes(mes, ano));
        }
      } catch (e) {
        if (ativo) setDias(getDiasDoMes(mes, ano));
      } finally {
        if (ativo) setLoading(false);
      }
    }
    fetchData();
    return () => { ativo = false; };
  }, [funcionario, mes, ano]);

  function handleChange(idx, campo, valor) {
    setDias(dias => dias.map((d, i) => i === idx ? { ...d, [campo]: valor } : d));
  }

  function handleFeriado(idx) {
    setDias(dias => dias.map((d, i) => i === idx ? { ...d, feriado: !d.feriado } : d));
  }

  // Cálculo automático do total de horas trabalhadas (simples: saída - entrada - descanso)
  function calcularTotal(entrada, saida, descanso) {
    if (!entrada || !saida) return '';
    // Espera formato HH:mm
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = saida.split(':').map(Number);
    let totalMin = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (descanso) {
      const [hd, md] = descanso.split(':').map(Number);
      totalMin -= (hd * 60 + md);
    }
    if (isNaN(totalMin) || totalMin < 0) return '';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Soma total do mês
  const totalMes = dias.reduce((acc, d) => {
    const t = d.total && d.total.split(':');
    if (t && t.length === 2) {
      acc += parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    }
    return acc;
  }, 0);
  const totalMesStr = `${Math.floor(totalMes/60).toString().padStart(2, '0')}:${(totalMes%60).toString().padStart(2, '0')}`;

  useEffect(() => {
    // Atualiza o campo total automaticamente ao digitar entrada/saida/descanso
    setDias(dias => dias.map(d => ({
      ...d,
      total: calcularTotal(d.entrada, d.saida, d.descanso)
    })));
    // eslint-disable-next-line
  }, [dias.map(d => `${d.entrada}-${d.saida}-${d.descanso}`).join()]);

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
      <div className="flex gap-2 mb-4">
        <button onClick={exportarPDF} className="bg-green-600 text-white px-3 py-1 rounded">Exportar PDF</button>
        <button onClick={exportarExcel} className="bg-yellow-600 text-white px-3 py-1 rounded">Exportar Excel</button>
        <select value={mes} onChange={e => setMes(Number(e.target.value))} className="border px-2 py-1 rounded">
          {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <input type="number" value={ano} onChange={e => setAno(Number(e.target.value))} className="border px-2 py-1 rounded w-24" min="2020" max="2100" />
      </div>
      <h2 className="font-bold text-lg mb-4">Escala de Horas - {funcionario}</h2>
      <table className="min-w-full border text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th>DIA</th>
            <th>SEMANA</th>
            <th>FERIADO</th>
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
            <tr key={idx} className={d.feriado ? 'bg-yellow-200' : (d.semana === 'sábado' || d.semana === 'domingo' ? 'bg-purple-100' : '')}>
              <td>{d.dia}</td>
              <td>{d.semana}</td>
              <td>
                {isAdmin && (
                  <input type="checkbox" checked={d.feriado} onChange={() => handleFeriado(idx)} />
                )}
              </td>
              <td>
                <input type="text" value={d.entrada} disabled={!isAdmin || d.feriado} onChange={e => handleChange(idx, 'entrada', e.target.value)} className="border px-1 w-16" placeholder="08:00" />
              </td>
              <td>
                <input type="text" value={d.descanso} disabled={!isAdmin || d.feriado} onChange={e => handleChange(idx, 'descanso', e.target.value)} className="border px-1 w-16" placeholder="01:00" />
              </td>
              <td>
                <input type="text" value={d.saida} disabled={!isAdmin || d.feriado} onChange={e => handleChange(idx, 'saida', e.target.value)} className="border px-1 w-16" placeholder="17:00" />
              </td>
              <td>
                <input type="text" value={d.horasTrabalhadas} disabled={!isAdmin || d.feriado} onChange={e => handleChange(idx, 'horasTrabalhadas', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.horasExtras} disabled={!isAdmin || d.feriado} onChange={e => handleChange(idx, 'horasExtras', e.target.value)} className="border px-1 w-16" />
              </td>
              <td>
                <input type="text" value={d.total} disabled readOnly className="border px-1 w-16 bg-gray-100" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 font-bold">Total Geral de Horas: {totalMesStr}</div>
      {isAdmin && (
        <button onClick={salvarEscala} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Salvar Escala</button>
      )}
    </div>
  );
}
