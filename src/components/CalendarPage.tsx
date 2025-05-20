import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiInfo, FiX, FiCheckCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { SimuladoPage } from './SimuladoPage';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarCustom.css'; // Arquivo para customização visual

// Interface para representar um compromisso
interface Compromisso {
  id: string;
  title: string;
  date: string; // Formato 'YYYY-MM-DD'
  time?: string; // Formato 'HH:MM' - Novo campo para hora
  description?: string;
  reminderDays: number; // Dias antes para lembrar
}

// Tipo para as abas disponíveis
type TabType = 'calendario' | 'simulado';

export const CalendarPage: React.FC = () => {
  // Estados
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCompromisso, setNewCompromisso] = useState<Omit<Compromisso, 'id'>>({
    title: '',
    date: '',
    time: '', // Hora padrão vazia
    description: '',
    reminderDays: 1
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('calendario');
  const [filtroData, setFiltroData] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Carregar compromissos do localStorage quando o componente montar
  useEffect(() => {
    try {
      const savedCompromissos = localStorage.getItem('jumboIA_calendario_compromissos');
      setDebugInfo(`Tentando carregar compromissos: ${savedCompromissos ? 'Dados encontrados' : 'Nenhum dado'}`);
      if (savedCompromissos) {
        const parsedData = JSON.parse(savedCompromissos);
        setCompromissos(parsedData);
        console.log('Compromissos carregados com sucesso:', parsedData.length);
        setDebugInfo(prev => `${prev}\nCarregados ${parsedData.length} compromissos`);
      }
      // Verificar se há compromissos próximos e mostrar notificações
      checkForReminders();
    } catch (error) {
      console.error('Erro ao carregar compromissos do localStorage:', error);
      setDebugInfo(prev => `${prev}\nErro ao carregar: ${error}`);
    }
  }, []);

  // Salvar compromissos no localStorage quando mudarem
  useEffect(() => {
    if (compromissos.length === 0) return; // Não salvar array vazio ao inicializar
    
    try {
      localStorage.setItem('jumboIA_calendario_compromissos', JSON.stringify(compromissos));
      console.log('Compromissos salvos com sucesso:', compromissos.length);
      setDebugInfo(prev => `${prev}\nSalvos ${compromissos.length} compromissos`);
      
      // Verificar lembretes quando a lista de compromissos mudar
      checkForReminders();
    } catch (error) {
      console.error('Erro ao salvar compromissos no localStorage:', error);
      setDebugInfo(prev => `${prev}\nErro ao salvar: ${error}`);
    }
  }, [compromissos]);

  // Verificar o localStorage periodicamente para debug
  useEffect(() => {
    const checkStorage = () => {
      try {
        const data = localStorage.getItem('jumboIA_calendario_compromissos');
        if (data) {
          const parsed = JSON.parse(data);
          setDebugInfo(prev => `${prev}\nVerificação: ${parsed.length} compromissos no storage`);
        } else {
          setDebugInfo(prev => `${prev}\nVerificação: Nenhum dado no storage`);
        }
      } catch (e) {
        setDebugInfo(prev => `${prev}\nErro na verificação: ${e}`);
      }
    };
    
    // Verificar após 2 segundos da montagem para dar tempo de carregar
    const timer = setTimeout(checkStorage, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Função para limpar explicitamente o localStorage para testes
  const clearStorage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      localStorage.removeItem('jumboIA_calendario_compromissos');
      setDebugInfo('Storage limpo manualmente');
      setCompromissos([]);
    } catch (e) {
      setDebugInfo(`Erro ao limpar: ${e}`);
    }
  };

  // Função para forçar a recarga dos dados do localStorage
  const forceReload = (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      const data = localStorage.getItem('jumboIA_calendario_compromissos');
      if (data) {
        const parsed = JSON.parse(data);
        setCompromissos(parsed);
        setDebugInfo(`Recarregados ${parsed.length} compromissos manualmente`);
      } else {
        setDebugInfo('Nenhum dado para recarregar');
      }
    } catch (e) {
      setDebugInfo(`Erro ao recarregar: ${e}`);
    }
  };

  // Função para verificar lembretes
  const checkForReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newNotifications: string[] = [];
    
    compromissos.forEach(compromisso => {
      const compromissoDate = new Date(compromisso.date);
      compromissoDate.setHours(0, 0, 0, 0);
      
      const timeDiff = compromissoDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff === compromisso.reminderDays) {
        newNotifications.push(
          `Lembrete: "${compromisso.title}" está marcado para daqui a ${compromisso.reminderDays} dias!`
        );
      }
    });
    
    setNotifications(newNotifications);
  };

  // Função para adicionar um novo compromisso
  const addCompromisso = (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    if (!newCompromisso.title || !newCompromisso.date) {
      setDebugInfo(prev => `${prev}\nErro: título ou data não fornecidos`);
      return;
    }
    
    try {
      const compromisso: Compromisso = {
        ...newCompromisso,
        id: Date.now().toString()
      };
      
      // Adicionar ao estado e forçar salvar no localStorage
      const updatedCompromissos = [...compromissos, compromisso];
      
      // Salvar explicitamente no localStorage para garantir persistência
      localStorage.setItem('jumboIA_calendario_compromissos', JSON.stringify(updatedCompromissos));
      
      // Atualizar o estado somente após confirmação de que o localStorage foi atualizado
      setCompromissos(updatedCompromissos);
      
      // Verificar que realmente foi salvo
      const verificacao = localStorage.getItem('jumboIA_calendario_compromissos');
      const foiSalvo = verificacao && JSON.parse(verificacao).some((c: Compromisso) => c.id === compromisso.id);
      
      setDebugInfo(prev => `${prev}\nCompromisso "${compromisso.title}" no dia ${compromisso.date} ${foiSalvo ? 'SALVO COM SUCESSO' : 'ERRO AO SALVAR'}`);
      
      console.log('Novo compromisso salvo com sucesso!', compromisso);
      
      setNewCompromisso({
        title: '',
        date: '',
        time: '',
        description: '',
        reminderDays: 1
      });
      
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao adicionar compromisso:', error);
      setDebugInfo(prev => `${prev}\nErro ao adicionar: ${error}`);
    }
  };

  // Função para excluir um compromisso
  const deleteCompromisso = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    
    // Filtrar e atualizar o estado
    const updatedCompromissos = compromissos.filter(comp => comp.id !== id);
    setCompromissos(updatedCompromissos);
    
    // Salvar explicitamente no localStorage para garantir persistência
    try {
      localStorage.setItem('jumboIA_calendario_compromissos', JSON.stringify(updatedCompromissos));
      console.log('Compromisso excluído e lista atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar lista após exclusão:', error);
    }
  };

  // Função para abrir o modal de novo compromisso
  const openNewCompromissoModal = () => {
    setNewCompromisso({
      title: '',
      date: '',
      time: '',
      description: '',
      reminderDays: 1
    });
    setShowModal(true);
  };

  // Função para formatar a data para exibição
  const formatarData = (dataStr: string) => {
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      return dataStr;
    }
  };

  // Função para ordenar compromissos por data
  const compromissosOrdenados = () => {
    return [...compromissos].sort((a, b) => {
      // Comparar datas
      const dataA = new Date(a.date);
      const dataB = new Date(b.date);
      
      if (dataA > dataB) return 1;
      if (dataA < dataB) return -1;
      
      // Se as datas forem iguais, comparar horas
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      // Se apenas um tiver hora, ele vem primeiro
      if (a.time) return -1;
      if (b.time) return 1;
      
      return 0;
    });
  };

  // Filtrar compromissos com base no filtro de data
  const compromissosFiltrados = () => {
    const ordenados = compromissosOrdenados();
    
    if (!filtroData) return ordenados;
    
    return ordenados.filter(comp => comp.date === filtroData);
  };

  // Função para mudar a aba ativa
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Atualizar filtroData para selectedDate
  useEffect(() => {
    if (selectedDate) {
      setFiltroData(selectedDate.toISOString().slice(0, 10));
    } else {
      setFiltroData('');
    }
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Calendário visual mensal */}
      <div className="bg-white rounded-lg shadow-md max-w-screen-lg mx-auto p-5 mb-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FiCalendar className="mr-2" />Calendário de Compromissos</h1>
        <Calendar
          onClickDay={(date) => {
            setSelectedDate(date);
          }}
          onChange={(value) => {
            if (value instanceof Date) setSelectedDate(value);
            else if (Array.isArray(value) && value[0] instanceof Date) setSelectedDate(value[0]);
            else setSelectedDate(null);
          }}
          value={selectedDate}
          locale="pt-BR"
          tileClassName={() => ''}
        />
        <span className="mt-2 text-gray-600">Clique em um dia para ver ou adicionar compromissos</span>
      </div>
      {/* Modal para adicionar compromisso */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Novo Compromisso</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><FiX className="text-xl" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addCompromisso(); }}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-1">Título</label>
                <input type="text" id="title" value={newCompromisso.title} onChange={(e) => setNewCompromisso({...newCompromisso, title: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jumbo-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="date" className="block text-gray-700 font-medium mb-1">Data</label>
                  <input type="date" id="date" value={newCompromisso.date || filtroData} onChange={(e) => setNewCompromisso({...newCompromisso, date: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jumbo-500" required />
                </div>
                <div>
                  <label htmlFor="time" className="block text-gray-700 font-medium mb-1">Hora</label>
                  <input type="time" id="time" value={newCompromisso.time} onChange={(e) => setNewCompromisso({...newCompromisso, time: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jumbo-500" />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-1">Descrição (opcional)</label>
                <textarea id="description" value={newCompromisso.description} onChange={(e) => setNewCompromisso({...newCompromisso, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jumbo-500" rows={3} />
              </div>
              <div className="mb-4">
                <label htmlFor="reminderDays" className="block text-gray-700 font-medium mb-1">Lembrete (dias antes)</label>
                <select id="reminderDays" value={newCompromisso.reminderDays} onChange={(e) => setNewCompromisso({...newCompromisso, reminderDays: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jumbo-500">
                  {[2,3,4,5,6,7].map(d => <option key={d} value={d}>{d} dias antes</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-jumbo-500 rounded-md text-white hover:bg-jumbo-600">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lista de compromissos do dia selecionado */}
      <div className="bg-white rounded-lg shadow-md max-w-screen-lg mx-auto p-5 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FiCalendar className="mr-2" />
          {filtroData && !isNaN(new Date(filtroData).getTime())
            ? `Compromissos para ${formatarData(filtroData)}`
            : 'Compromissos'}
        </h2>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setNewCompromisso({
                title: '',
                date: filtroData || '',
                time: '',
                description: '',
                reminderDays: 1
              });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-jumbo-500 text-white rounded-md flex items-center shadow hover:bg-jumbo-600 transition-colors"
          >
            <FiPlus className="mr-2" /> Adicionar compromisso
          </button>
        </div>
        {compromissosFiltrados().length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Nenhum compromisso para este dia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {compromissosFiltrados().map(compromisso => {
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);
              const dataCompromisso = new Date(compromisso.date);
              dataCompromisso.setHours(0, 0, 0, 0);
              const jaPassou = dataCompromisso < hoje;
              // Notificação visual se for o dia ou lembrete
              let lembrete = '';
              const diff = Math.ceil((dataCompromisso.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
              if (diff === 0) lembrete = 'Hoje é o dia deste compromisso!';
              else if (diff === compromisso.reminderDays) lembrete = `Lembrete: Faltam ${compromisso.reminderDays} dias!`;
              return (
                <div key={compromisso.id} className={`border rounded-lg p-4 ${jaPassou ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${jaPassou ? 'text-gray-500' : 'text-gray-800'}`}>{compromisso.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FiCalendar className="mr-1" />
                        <span className="mr-4">{formatarData(compromisso.date)}</span>
                        {compromisso.time && (<><FiClock className="mr-1" /><span>{compromisso.time}</span></>)}
                      </div>
                      {compromisso.description && (<p className="mt-2 text-gray-600">{compromisso.description}</p>)}
                    </div>
                    <button
                      onClick={(e) => deleteCompromisso(compromisso.id, e)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors ml-2"
                      title="Cancelar compromisso"
                      aria-label="Cancelar compromisso"
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                  {lembrete && (<div className="mt-2 text-xs font-medium text-blue-600">{lembrete}</div>)}
                  {jaPassou && (<div className="mt-2 text-xs font-medium text-amber-600">Este compromisso já passou.</div>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 