import React, { useState, useEffect } from 'react'
import './App.css'
import './index.css'
import {
  Users, Settings, FileText, Printer, Plus, Trash2,
  Save, Home, Search, CheckCircle, Download, LogOut
} from 'lucide-react'
import { auth } from './firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

const AMPATLogo = ({ size = 'md' }) => {
  const sizeMap = { sm: '32', md: '40', lg: '64' }
  const s = sizeMap[size]
  return (
    <svg viewBox="0 0 64 64" width={s} height={s} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ampat-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00b4ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0084ff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* House base */}
      <rect x="16" y="32" width="32" height="24" fill="url(#ampat-gradient)" rx="2" />
      {/* House roof */}
      <polygon points="16,32 32,16 48,32" fill="#00c9ff" />
      {/* Door */}
      <rect x="28" y="40" width="8" height="16" fill="#ffffff" opacity="0.8" />
      {/* Windows */}
      <rect x="20" y="38" width="5" height="5" fill="#ffffff" opacity="0.7" />
      <rect x="39" y="38" width="5" height="5" fill="#ffffff" opacity="0.7" />
      {/* Tree trunk */}
      <rect x="30" y="24" width="4" height="8" fill="#8B4513" />
      {/* Tree foliage - circle */}
      <circle cx="32" cy="18" r="8" fill="#2d5016" />
      {/* AMPAT text background */}
      <rect x="4" y="52" width="56" height="10" fill="#ff3333" rx="1" />
      {/* AMPAT text */}
      <text x="32" y="59" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">AMPAT</text>
    </svg>
  )
}

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type }) => {
  const baseStyle = 'flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500',
    success: 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400'
  }

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  )
}

const CarnetSheet = ({ resident, config, monthsToPrint = [0,1,2,3,4,5,6,7,8,9,10,11] }) => {
  const months = [
    'JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
    'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'
  ]

  return (
    <div className="print-area w-full bg-white hidden print:block">
      {monthsToPrint.map((monthIndex) => {
        const dueDate = new Date(config.year, monthIndex, config.dueDay)
        const formattedDate = dueDate.toLocaleDateString('pt-BR')
        const monthName = months[monthIndex]

        return (
          <div key={monthIndex} className="border-2 border-black p-0 mb-8 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
            {/* Header with Logo and Title */}
            <div className="border-b-2 border-black p-4 text-center">
              <div className="text-xl font-bold mb-1">CARNÊ {config.year}</div>
              <div className="mb-3">
                <svg viewBox="0 0 64 64" width="40" height="40" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
                  <defs>
                    <linearGradient id="ampat-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#00b4ff', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#0084ff', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <rect x="16" y="32" width="32" height="24" fill="url(#ampat-gradient)" rx="2" />
                  <polygon points="16,32 32,16 48,32" fill="#00c9ff" />
                  <rect x="28" y="40" width="8" height="16" fill="#ffffff" opacity="0.8" />
                  <rect x="20" y="38" width="5" height="5" fill="#ffffff" opacity="0.7" />
                  <rect x="39" y="38" width="5" height="5" fill="#ffffff" opacity="0.7" />
                  <rect x="30" y="24" width="4" height="8" fill="#8B4513" />
                  <circle cx="32" cy="18" r="8" fill="#2d5016" />
                  <rect x="4" y="52" width="56" height="10" fill="#ff3333" rx="1" />
                  <text x="32" y="59" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">AMPAT</text>
                </svg>
              </div>
              <div className="text-sm font-bold text-red-700">AMPAT</div>
              <div className="text-xs font-bold">ASSOCIAÇÃO DE MORADORES E PROPRIETÁRIOS DO PARQUE ALTO TAQUARAL</div>
            </div>

            {/* Main Content Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-0">
              {/* Left Column - Via da Associação */}
              <div className="border-r-2 border-black p-4">
                <div className="text-xs font-bold text-center mb-3 border-b border-black pb-2">VIA DA ASSOCIAÇÃO</div>
                
                <div className="space-y-3 text-xs">
                  <div className="border border-black p-2">
                    <div className="font-bold uppercase">Morador:</div>
                    <div className="font-bold">{resident.name}</div>
                  </div>

                  <div className="border border-black p-2">
                    <div className="font-bold uppercase">Endereço:</div>
                    <div className="font-bold">{resident.address}</div>
                  </div>

                  <div className="border border-black p-2 text-center">
                    <div className="font-bold uppercase text-red-700 mb-1">ATENÇÃO - IMPORTANTE</div>
                    <div className="mb-1">Vencimento: <span className="font-bold text-red-700">{formattedDate}</span></div>
                    <div className="mb-1">Valor: <span className="font-bold">R$ {parseFloat(config.value).toFixed(2).replace('.', ',')}</span></div>
                    <div className="text-[10px] mt-1">Após esta data é o valor de multa</div>
                  </div>

                  <div className="text-center text-[10px] italic">
                    {monthName}/{config.year}
                  </div>
                </div>
              </div>

              {/* Right Column - Via do Morador */}
              <div className="p-4">
                <div className="text-xs font-bold text-center mb-3 border-b border-black pb-2">VIA DO MORADOR</div>
                
                <div className="space-y-3 text-xs">
                  <div className="border border-black p-2">
                    <div className="font-bold uppercase">Morador:</div>
                    <div className="font-bold">{resident.name}</div>
                  </div>

                  <div className="border border-black p-2">
                    <div className="font-bold uppercase">Endereço:</div>
                    <div className="font-bold">{resident.address}</div>
                  </div>

                  <div className="border-2 border-red-700 p-2 text-center bg-red-50">
                    <div className="font-bold uppercase text-red-700 mb-1">ATENÇÃO - IMPORTANTE</div>
                    <div className="mb-1">Para pagamento até 08 de cada</div>
                    <div className="mb-1">mês. O valor é de: <span className="font-bold">R$ {parseFloat(config.value).toFixed(2).replace('.', ',')}</span></div>
                    <div className="font-bold text-red-700 text-[10px] mt-1">Vencimento: {formattedDate}</div>
                  </div>

                  <div className="text-center text-[10px] italic">
                    {monthName}/{config.year}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Instructions */}
            <div className="border-t-2 border-black p-4 bg-gray-50">
              <div className="text-xs font-bold mb-2">INSTRUÇÕES DE PAGAMENTO:</div>
              <div className="text-xs mb-2">Este carnê refere-se a taxa de manutenção/segurança condominal. O pagamento garante a continuidade dos serviços.</div>
              
              {config.pixKey && (
                <div className="border border-black p-2 mt-2 bg-white">
                  <div className="text-xs font-bold mb-1">Chave PIX para transferência:</div>
                  <div className="text-xs font-mono font-bold text-blue-700 break-all">{config.pixKey}</div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const [residents, setResidents] = useState([
    { id: 1, name: 'João da Silva', address: 'Rua A, Lote 12', phone: '(11) 99999-9999' },
    { id: 2, name: 'Maria Oliveira', address: 'Rua B, Casa 05', phone: '(11) 98888-8888' },
    { id: 3, name: 'Carlos Pereira', address: 'Alameda das Flores, 100', phone: '(11) 97777-7777' }
  ])

  const [config, setConfig] = useState({
    assocName: 'Associação AMPAT',
    cnpj: '00.000.000/0001-00',
    pixKey: 'ampat@email.com',
    value: '150.00',
    dueDay: '10',
    year: new Date().getFullYear().toString()
  })

  const [isEditing, setIsEditing] = useState(false)
  const [currentResident, setCurrentResident] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [printTarget, setPrintTarget] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const savedResidents = localStorage.getItem('ampat_residents')
    const savedConfig = localStorage.getItem('ampat_config')
    if (savedResidents) setResidents(JSON.parse(savedResidents))
    if (savedConfig) setConfig(JSON.parse(savedConfig))
  }, [])

  useEffect(() => { localStorage.setItem('ampat_residents', JSON.stringify(residents)) }, [residents])
  useEffect(() => { localStorage.setItem('ampat_config', JSON.stringify(config)) }, [config])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAuthError('')
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword)
      setAuthEmail('')
      setAuthPassword('')
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (err) {
      setAuthError(err.message)
    }
  }

  useEffect(() => { localStorage.setItem('ampat_residents', JSON.stringify(residents)) }, [residents])
  useEffect(() => { localStorage.setItem('ampat_config', JSON.stringify(config)) }, [config])

  const handleAddResident = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newResident = {
      id: isEditing ? currentResident.id : Date.now(),
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone')
    }

    if (isEditing) {
      setResidents(residents.map(r => r.id === newResident.id ? newResident : r))
      setIsEditing(false)
    } else {
      setResidents([...residents, newResident])
    }
    setCurrentResident(null)
    e.target.reset()
    if (!isEditing) alert('Morador cadastrado com sucesso!')
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este morador?')) {
      setResidents(residents.filter(r => r.id !== id))
    }
  }

  const handleEdit = (resident) => { setCurrentResident(resident); setIsEditing(true); setActiveTab('residents_form') }

  const handlePrint = (targetId) => {
    setPrintTarget(targetId)
    setTimeout(() => { window.print(); setPrintTarget(null) }, 500)
  }

  const filteredResidents = residents.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.address.toLowerCase().includes(searchTerm.toLowerCase()))

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-l-4 border-blue-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Total Moradores</p>
              <h3 className="text-3xl font-bold text-gray-900">{residents.length}</h3>
            </div>
            <Users className="text-blue-400" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-cyan-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Receita Mensal (Est.)</p>
              <h3 className="text-3xl font-bold text-gray-900">R$ {(residents.length * parseFloat(config.value)).toFixed(2).replace('.', ',')}</h3>
            </div>
            <div className="text-cyan-400 font-bold text-xl">R$</div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-blue-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Ano Fiscal</p>
              <h3 className="text-3xl font-bold text-gray-900">{config.year}</h3>
            </div>
            <FileText className="text-blue-300" />
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Bem-vindo ao Sistema AMPAT</h3>
        <p className="text-blue-700">Use o menu lateral para cadastrar moradores. Na aba "Gerar Carnês", você pode gerar e imprimir os pagamentos mensais para a portaria. Certifique-se de configurar a Chave PIX na aba "Configurações" para facilitar o recebimento.</p>
      </div>
    </div>
  )

  const ResidentsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar morador..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button onClick={() => { setIsEditing(false); setCurrentResident(null); setActiveTab('residents_form') }} icon={Plus}>Novo Morador</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço / Lote</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResidents.map((resident) => (
              <tr key={resident.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resident.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resident.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resident.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(resident)} className="text-blue-500 hover:text-blue-600 mr-4">Editar</button>
                  <button onClick={() => handleDelete(resident.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
            {filteredResidents.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Nenhum morador encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const ResidentFormView = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">{isEditing ? 'Editar Morador' : 'Novo Morador'}</h2>
        <form onSubmit={handleAddResident} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input name="name" required defaultValue={currentResident?.name} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço / Número do Lote</label>
            <input name="address" required defaultValue={currentResident?.address} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone (Opcional)</label>
            <input name="phone" defaultValue={currentResident?.phone} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setActiveTab('residents')}>Cancelar</Button>
            <Button type="submit" icon={Save}>{isEditing ? 'Atualizar' : 'Salvar'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )

  const ConfigView = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center"><Settings className="mr-2" /> Configurações do Carnê</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Associação</label>
              <input value={config.assocName} onChange={(e) => setConfig({...config, assocName: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CNPJ (Opcional)</label>
              <input value={config.cnpj} onChange={(e) => setConfig({...config, cnpj: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <label className="block text-sm font-bold text-blue-800 mb-1">Chave PIX (Importante)</label>
            <p className="text-xs text-blue-700 mb-2">Essa chave aparecerá impressa em todos os carnês para facilitar o pagamento.</p>
            <input value={config.pixKey} placeholder="Ex: CNPJ, Email ou Celular" onChange={(e) => setConfig({...config, pixKey: e.target.value})} className="block w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Mensal (R$)</label>
              <input type="number" step="0.01" value={config.value} onChange={(e) => setConfig({...config, value: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dia Vencimento</label>
              <input type="number" min="1" max="31" value={config.dueDay} onChange={(e) => setConfig({...config, dueDay: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ano de Ref.</label>
              <input type="number" value={config.year} onChange={(e) => setConfig({...config, year: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="success" icon={CheckCircle} onClick={() => alert('Configurações Salvas!')}>Salvar Configurações</Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const CarnetsView = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow mb-6 border-l-4 border-blue-400">
        <h3 className="font-bold text-blue-800">Como funciona:</h3>
        <p className="text-sm text-gray-600">Selecione um morador abaixo para gerar um PDF pronto para impressão com os 12 meses do ano configurado ({config.year}).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {residents.map(resident => (
          <Card key={resident.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-gray-900">{resident.name}</h4>
                <p className="text-sm text-gray-500">{resident.address}</p>
              </div>
              <FileText className="text-gray-300" />
            </div>
            <div className="flex space-x-2">
              <Button variant="primary" className="w-full text-sm" icon={Printer} onClick={() => handlePrint(resident.id)}>Imprimir Carnê</Button>
            </div>
          </Card>
        ))}
      </div>

      {residents.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">Ações em Massa</h3>
          <Button variant="secondary" icon={Printer} onClick={() => handlePrint('ALL')}>Imprimir Carnê de TODOS os Moradores</Button>
        </div>
      )}
    </div>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4">
              <AMPATLogo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900">AMPAT</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestão de Carnês</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400" 
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400" 
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {authError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Acesso restrito — apenas administradores</p>
          </div>
        </Card>
      </div>
    )
  }

  if (printTarget) {
    const residentsToPrint = printTarget === 'ALL' ? residents : residents.filter(r => r.id === printTarget)
    return (
      <div className="bg-white min-h-screen">
        <div className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 flex justify-between items-center no-print z-50 shadow-lg">
          <div>
            <h2 className="font-bold">Modo de Impressão</h2>
            <p className="text-xs text-gray-300">Pressione Ctrl+P ou clique em Imprimir. Use a escala "Ajustar à pagina" se necessário.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setPrintTarget(null)}>Cancelar</Button>
            <Button variant="primary" onClick={() => window.print()} icon={Printer}>Imprimir Agora</Button>
          </div>
        </div>

        <div className="pt-20 print:pt-0">
          {residentsToPrint.map((resident, idx) => (
            <div key={resident.id} className={idx < residentsToPrint.length - 1 ? 'page-break' : ''}>
              <div className="text-center py-10 border-b mb-8 print:hidden">
                <h1 className="text-2xl font-bold">{config.assocName}</h1>
                <p>Carnê de Pagamento - {config.year}</p>
                <p className="font-bold text-xl mt-2">{resident.name}</p>
              </div>
              <CarnetSheet resident={resident} config={config} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-blue-100 flex items-center bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="w-10 h-10 mr-3">
            <AMPATLogo size="md" />
          </div>
          <span className="font-bold text-lg text-blue-900">AMPAT</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'}`}><Home className="mr-3" size={20} /> Dashboard</button>
          <button onClick={() => setActiveTab('residents')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'residents' || activeTab === 'residents_form' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'}`}><Users className="mr-3" size={20} /> Moradores</button>
          <button onClick={() => setActiveTab('carnets')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'carnets' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'}`}><FileText className="mr-3" size={20} /> Gerar Carnês</button>
          <button onClick={() => setActiveTab('config')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'config' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'}`}><Settings className="mr-3" size={20} /> Configurações</button>
        </nav>

        <div className="p-4 border-t border-blue-100 text-xs text-blue-400 text-center">Sistema de Gestão v1.0</div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <span className="font-bold text-lg">AMPAT</span>
          <div className="flex space-x-4 items-center">
            <button onClick={() => setActiveTab('dashboard')}><Home size={24} /></button>
            <button onClick={() => setActiveTab('residents')}><Users size={24} /></button>
            <button onClick={() => setActiveTab('carnets')}><FileText size={24} /></button>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-700"><LogOut size={24} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Visão Geral'}
                {activeTab === 'residents' && 'Gerenciar Moradores'}
                {activeTab === 'residents_form' && (isEditing ? 'Editar Morador' : 'Adicionar Morador')}
                {activeTab === 'carnets' && 'Central de Impressão'}
                {activeTab === 'config' && 'Configurações do Sistema'}
              </h1>
              <button onClick={handleLogout} className="hidden md:flex items-center text-red-600 hover:text-red-700 font-medium gap-2">
                <LogOut size={20} />
                Sair
              </button>
            </div>

            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'residents' && <ResidentsView />}
            {activeTab === 'residents_form' && <ResidentFormView />}
            {activeTab === 'carnets' && <CarnetsView />}
            {activeTab === 'config' && <ConfigView />}
          </div>
        </main>
      </div>
    </div>
  )
}
