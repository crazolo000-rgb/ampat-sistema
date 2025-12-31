import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, User, Save, FileText, Calculator } from 'lucide-react';

const GerenciadorEscalaTrabalho = () => {
  // Estados para armazenar dados
  const [funcionarios, setFuncionarios] = useState([
    { id: 1, nome: 'João Silva' },
    { id: 2, nome: 'Maria Oliveira' }
  ]);
  const [escalas, setEscalas] = useState([]);
  
  // Estados do formulário
  const [novoFuncionario, setNovoFuncionario] = useState('');
  const [formEscala, setFormEscala] = useState({
    funcionarioId: '',
    data: '',
    entrada: '08:00',
    saida: '17:00',
    observacao: ''
  });

  // Função para calcular horas trabalhadas
  const calcularHoras = (entrada, saida) => {
    if (!entrada || !saida) return '00:00';
    
    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
    const [hSaida, mSaida] = saida.split(':').map(Number);
    
    let minutosEntrada = hEntrada * 60 + mEntrada;
    let minutosSaida = hSaida * 60 + mSaida;
    
    // Tratamento para turno que vira a noite (ex: 22:00 as 06:00)
    if (minutosSaida < minutosEntrada) {
      minutosSaida += 24 * 60;
    }
    
    const diferenca = minutosSaida - minutosEntrada;
    const horas = Math.floor(diferenca / 60);
    const minutos = diferenca % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  // Adicionar funcionário
  const handleAddFuncionario = (e) => {
    e.preventDefault();
    if (!novoFuncionario.trim()) return;
    
    const novo = {
      id: Date.now(),
      nome: novoFuncionario
    };
    
    setFuncionarios([...funcionarios, novo]);
    setNovoFuncionario('');
  };

  // Remover funcionário
  const handleRemoveFuncionario = (id) => {
    setFuncionarios(funcionarios.filter(f => f.id !== id));
    // Opcional: remover escalas desse funcionário também
    setEscalas(escalas.filter(e => e.funcionarioId !== id.toString()));
  };

  // Adicionar item na escala
  const handleAddEscala = (e) => {
    e.preventDefault();
    if (!formEscala.funcionarioId || !formEscala.data) {
      alert('Selecione um funcionário e uma data.');
      return;
    }

    const horasTrabalhadas = calcularHoras(formEscala.entrada, formEscala.saida);
    const nomeFuncionario = funcionarios.find(f => f.id.toString() === formEscala.funcionarioId)?.nome;

    const novaEscala = {
      id: Date.now(),
      ...formEscala,
      nomeFuncionario,
      horasTrabalhadas
    };

    setEscalas([...escalas, novaEscala].sort((a, b) => new Date(a.data) - new Date(b.data)));
    
    // Resetar formulário mas manter data para facilitar inserção em massa
    setFormEscala(prev => ({
      ...prev,
      funcionarioId: '',
      observacao: ''
    }));
  };

  const handleRemoveEscala = (id) => {
    setEscalas(escalas.filter(e => e.id !== id));
  };

  // Renderização
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 flex items-center justify-center gap-2">
            <Calendar className="w-8 h-8" />
            Gerenciador de Escala de Trabalho
          </h1>
          <p className="text-gray-600 mt-2">Organize turnos, horários e equipe.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda: Cadastros */}
          <div className="space-y-6">
            {/* Card: Gerenciar Funcionários */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
                <User className="w-5 h-5" /> Equipe
              </h2>
              <form onSubmit={handleAddFuncionario} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nome do funcionário"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={novoFuncionario}
                  onChange={(e) => setNovoFuncionario(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                  <Plus className="w-5 h-5" />
                </button>
              </form>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {funcionarios.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum funcionário cadastrado.</p>}
                {funcionarios.map(func => (
                  <div key={func.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                    <span className="font-medium">{func.nome}</span>
                    <button onClick={() => handleRemoveFuncionario(func.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Card: Adicionar à Escala */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
                <Clock className="w-5 h-5" /> Nova Escala
              </h2>
              <form onSubmit={handleAddEscala} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    value={formEscala.funcionarioId}
                    onChange={(e) => setFormEscala({...formEscala, funcionarioId: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    {funcionarios.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formEscala.data}
                    onChange={(e) => setFormEscala({...formEscala, data: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
                    <input 
                      type="time" 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      value={formEscala.entrada}
                      onChange={(e) => setFormEscala({...formEscala, entrada: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saída</label>
                    <input 
                      type="time" 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      value={formEscala.saida}
                      onChange={(e) => setFormEscala({...formEscala, saida: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded text-sm text-green-800 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Previsão: <strong>{calcularHoras(formEscala.entrada, formEscala.saida)}h</strong> trabalhadas
                </div>
                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                  <Save className="w-5 h-5" /> Adicionar à Escala
                </button>
              </form>
            </div>
          </div>
          {/* Coluna da Direita: Visualização da Escala */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                  <FileText className="w-5 h-5" /> Escala Gerada
                </h2>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Total de registros: {escalas.length}
                </div>
              </div>
              {escalas.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma escala gerada ainda.</p>
                  <p className="text-sm">Cadastre funcionários e adicione horários ao lado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                        <th className="p-4">Data</th>
                        <th className="p-4">Funcionário</th>
                        <th className="p-4 text-center">Horário</th>
                        <th className="p-4 text-center">Total Horas</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {escalas.map((escala) => (
                        <tr key={escala.id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-medium text-gray-900">
                            {new Date(escala.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 text-blue-700 font-medium">
                            {escala.nomeFuncionario}
                          </td>
                          <td className="p-4 text-center text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {escala.entrada} - {escala.saida}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-green-700">
                            {escala.horasTrabalhadas}h
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleRemoveEscala(escala.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciadorEscalaTrabalho;
