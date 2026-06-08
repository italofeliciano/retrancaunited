import React, { useEffect, useState } from 'react';
import {
  Upload,
  Save,
  Users,
  Shield,
  ClipboardList,
  LayoutDashboard,
  Plus,
  Trash2,
  Search,
  Home,
  Download,
  CalendarDays,
  Clock,
  Pencil,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './App.css';

const TEAM_NAME = 'Retranca United';

const formations = {
  '4-3-3': [
    { role: 'GOL', x: 50, y: 91 },
    { role: 'LD', x: 83, y: 75 },
    { role: 'ZAG', x: 61, y: 80 },
    { role: 'ZAG', x: 39, y: 80 },
    { role: 'LE', x: 17, y: 75 },
    { role: 'VOL', x: 50, y: 61 },
    { role: 'MC', x: 67, y: 48 },
    { role: 'MC', x: 33, y: 48 },
    { role: 'PD', x: 82, y: 25 },
    { role: 'CA', x: 50, y: 16 },
    { role: 'PE', x: 18, y: 25 },
  ],
  '4-4-2': [
    { role: 'GOL', x: 50, y: 91 },
    { role: 'LD', x: 83, y: 75 },
    { role: 'ZAG', x: 61, y: 80 },
    { role: 'ZAG', x: 39, y: 80 },
    { role: 'LE', x: 17, y: 75 },
    { role: 'MD', x: 82, y: 50 },
    { role: 'MC', x: 60, y: 57 },
    { role: 'MC', x: 40, y: 57 },
    { role: 'ME', x: 18, y: 50 },
    { role: 'ATA', x: 60, y: 20 },
    { role: 'ATA', x: 40, y: 20 },
  ],
  '4-2-3-1': [
    { role: 'GOL', x: 50, y: 91 },
    { role: 'LD', x: 83, y: 75 },
    { role: 'ZAG', x: 61, y: 80 },
    { role: 'ZAG', x: 39, y: 80 },
    { role: 'LE', x: 17, y: 75 },
    { role: 'VOL', x: 60, y: 61 },
    { role: 'VOL', x: 40, y: 61 },
    { role: 'PD', x: 78, y: 39 },
    { role: 'MEI', x: 50, y: 36 },
    { role: 'PE', x: 22, y: 39 },
    { role: 'CA', x: 50, y: 17 },
  ],
  '3-5-2': [
    { role: 'GOL', x: 50, y: 91 },
    { role: 'ZAG', x: 65, y: 78 },
    { role: 'ZAG', x: 50, y: 82 },
    { role: 'ZAG', x: 35, y: 78 },
    { role: 'ALA', x: 84, y: 54 },
    { role: 'VOL', x: 59, y: 61 },
    { role: 'VOL', x: 41, y: 61 },
    { role: 'MEI', x: 50, y: 42 },
    { role: 'ALA', x: 16, y: 54 },
    { role: 'ATA', x: 60, y: 20 },
    { role: 'ATA', x: 40, y: 20 },
  ],
  '5-3-2': [
    { role: 'GOL', x: 50, y: 91 },
    { role: 'ALA', x: 88, y: 68 },
    { role: 'ZAG', x: 68, y: 79 },
    { role: 'ZAG', x: 50, y: 82 },
    { role: 'ZAG', x: 32, y: 79 },
    { role: 'ALA', x: 12, y: 68 },
    { role: 'MC', x: 65, y: 50 },
    { role: 'VOL', x: 50, y: 59 },
    { role: 'MC', x: 35, y: 50 },
    { role: 'ATA', x: 60, y: 20 },
    { role: 'ATA', x: 40, y: 20 },
  ],
  '4-1-2-1-2': [
    { role: 'GOL', x: 50, y: 91 },
    { role: 'LE', x: 15, y: 75 },
    { role: 'ZAG', x: 38, y: 80 },
    { role: 'ZAG', x: 62, y: 80 },
    { role: 'LD', x: 85, y: 75 },
    { role: 'VOL', x: 50, y: 64 },
    { role: 'MC', x: 32, y: 49 },
    { role: 'MC', x: 68, y: 49 },
    { role: 'MEI', x: 50, y: 35 },
    { role: 'ATA', x: 38, y: 20 },
    { role: 'ATA', x: 62, y: 20 },
  ],
};

const initialNames = [
  'Goleiro',
  'Lateral Dir.',
  'Zagueiro',
  'Zagueiro',
  'Lateral Esq.',
  'Volante',
  'Meia',
  'Meia',
  'Ponta Dir.',
  'Centroavante',
  'Ponta Esq.',
  'Reserva GOL',
  'Reserva ZAG',
  'Reserva LAT',
  'Reserva VOL',
  'Reserva MEI',
  'Reserva ATA',
  'Reserva ATA',
];

const createInitialSquad = () =>
  initialNames.map((name, index) => ({
    id: `jogador-${index}-${Math.random().toString(36).slice(2)}`,
    name,
    role:
      index < 11
        ? formations['4-3-3'][index].role
        : ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'ATA', 'ATA'][index - 11],
    rating: index < 11 ? '85' : '80',
    photo: '',
  }));

const starterSquad = createInitialSquad();

const createEmptyEvent = () => ({
  title: '',
  eventType: 'treino',
  eventDate: '',
  eventTime: '',
  location: '',
  opponent: '',
  description: '',
  status: 'marcado',
});

const eventTypeLabels = {
  jogo: 'Jogo',
  treino: 'Treino',
  reuniao: 'Reunião',
  outro: 'Outro',
};

const eventStatusLabels = {
  marcado: 'Marcado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatEventDate(dateValue) {
  if (!dateValue) return 'Data não definida';

  const [year, month, day] = dateValue.split('-');

  if (!year || !month || !day) return dateValue;

  return `${day}/${month}/${year}`;
}

function formatEventTime(timeValue) {
  if (!timeValue) return 'Horário a definir';

  return String(timeValue).slice(0, 5);
}

function getEventDateTime(event) {
  if (!event?.eventDate) return null;

  const time = event.eventTime || '00:00';
  return new Date(`${event.eventDate}T${time}`);
}

function sortEventsByDate(events) {
  return [...events].sort((eventA, eventB) => {
    const dateA = getEventDateTime(eventA);
    const dateB = getEventDateTime(eventB);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
}

function getEventTypeClass(eventType) {
  return eventType || 'outro';
}

function getEventStatusClass(status) {
  return status || 'marcado';
}

function Button({ children, className = '', ...props }) {
  return (
    <button className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
}

function PlayerAvatar({ player, fallbackIcon = 'user', className = '' }) {
  const Icon = fallbackIcon === 'shield' ? Shield : Users;

  return (
    <div className={className}>
      {player?.photo ? (
        <img src={player.photo} alt={player.name || 'Jogador'} />
      ) : (
        <Icon />
      )}
    </div>
  );
}

function SoccerField() {
  return (
    <div className="soccer-field-bg">
      <div className="field-stripes" />
      <div className="field-border" />
      <div className="field-half-line" />
      <div className="field-center-circle" />
      <div className="field-center-dot" />
      <div className="box box-top-large" />
      <div className="box box-top-small" />
      <div className="box box-bottom-large" />
      <div className="box box-bottom-small" />
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />
    </div>
  );
}

function FieldPlayer({ slot, player, selected, onClick, onDragStart, onDrop }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      onClick={onClick}
      className={`field-player ${selected ? 'field-player-selected' : ''}`}
      style={{
        left: `calc(${slot.x}% - 46px)`,
        top: `calc(${slot.y}% - 43px)`,
      }}
      title="Arraste para trocar com outro titular ou reserva"
    >
      <div className="field-photo-wrap">
        <PlayerAvatar player={player} className="field-photo" />
        <span className="rating-badge">{player?.rating || '--'}</span>
      </div>

      <div className="field-name-tag">
        <span>{player?.name || 'Vazio'}</span>
        <strong>{slot.role}</strong>
      </div>
    </button>
  );
}

function PlayerForm({ player, onChange, onPhoto, title }) {
  if (!player) {
    return <div className="side-card muted-text">Selecione um jogador.</div>;
  }

  return (
    <div className="side-card">
      <h3>{title}</h3>

      <div className="edit-player-head">
        <PlayerAvatar player={player} className="edit-photo" />

        <div className="form-group full">
          <label>Nome</label>
          <input
            value={player.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Posição</label>
          <input
            value={player.role}
            onChange={(event) =>
              onChange({ role: event.target.value.toUpperCase().slice(0, 4) })
            }
          />
        </div>

        <div className="form-group">
          <label>Overall</label>
          <input
            value={player.rating}
            onChange={(event) =>
              onChange({
                rating: event.target.value.replace(/\D/g, '').slice(0, 2),
              })
            }
          />
        </div>
      </div>

      <input
        id="photoUpload"
        type="file"
        accept="image/*"
        className="hidden-input"
        onChange={(event) => onPhoto(event.target.files?.[0])}
      />

      <Button
        className="btn-green full-button"
        onClick={() => document.getElementById('photoUpload')?.click()}
      >
        <Upload size={16} /> Colocar foto
      </Button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [formation, setFormation] = useState('4-3-3');
  const [squad, setSquad] = useState(starterSquad);
  const [lineupIds, setLineupIds] = useState(() =>
    starterSquad.slice(0, 11).map((player) => player.id)
  );
  const [benchIds, setBenchIds] = useState(() =>
    starterSquad.slice(11).map((player) => player.id)
  );
  const [positions, setPositions] = useState(formations['4-3-3']);
  const [selectedId, setSelectedId] = useState(starterSquad[0].id);
  const [search, setSearch] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnline, setHasLoadedOnline] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState(createEmptyEvent());
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadingMessage, setInitialLoadingMessage] = useState(
    'Carregando informações...'
  );

  const selectedPlayer = squad.find((player) => player.id === selectedId);
  const lineupPlayers = lineupIds.map((id) =>
    squad.find((player) => player.id === id)
  );
  const benchPlayers = benchIds.map((id) =>
    squad.find((player) => player.id === id)
  );

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitialData() {
    setIsInitialLoading(true);

    try {
      setInitialLoadingMessage('Carregando jogadores e escalação...');
      await loadOnline({ silent: true });

      setInitialLoadingMessage('Carregando agenda...');
      await loadEvents({ silent: true });

      setInitialLoadingMessage('Tudo pronto!');
    } catch (error) {
      console.warn('Erro no carregamento inicial:', error);
      setInitialLoadingMessage('Abrindo aplicativo...');
    } finally {
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 450);
    }
  }

  function updatePlayer(id, patch) {
    setSquad((previousSquad) =>
      previousSquad.map((player) =>
        player.id === id ? { ...player, ...patch } : player
      )
    );
  }

  function addPlayer() {
    const newPlayer = {
      id: `jogador-${Date.now()}`,
      name: 'Novo jogador',
      role: 'ATA',
      rating: '80',
      photo: '',
    };

    setSquad((previousSquad) => [...previousSquad, newPlayer]);
    setBenchIds((previousBenchIds) => [...previousBenchIds, newPlayer.id]);
    setSelectedId(newPlayer.id);
  }

  function removePlayer(id) {
    setSquad((previousSquad) =>
      previousSquad.filter((player) => player.id !== id)
    );
    setLineupIds((previousLineupIds) =>
      previousLineupIds.filter((playerId) => playerId !== id)
    );
    setBenchIds((previousBenchIds) =>
      previousBenchIds.filter((playerId) => playerId !== id)
    );

    if (selectedId === id) {
      const nextPlayer = squad.find((player) => player.id !== id);
      setSelectedId(nextPlayer?.id || '');
    }
  }

  function handlePhoto(file) {
    if (!file || !selectedPlayer) return;

    const reader = new FileReader();
    reader.onload = () =>
      updatePlayer(selectedPlayer.id, { photo: reader.result });
    reader.readAsDataURL(file);
  }

  function changeFormation(nextFormation) {
    setFormation(nextFormation);
    setPositions(formations[nextFormation] || formations['4-3-3']);
  }

  async function saveOnline() {
    if (!hasLoadedOnline) {
      alert('Aguarde o app carregar os dados online antes de salvar.');
      return;
    }

    if (loadError) {
      alert(
        'Não foi possível carregar os dados online. Para evitar apagar dados, o salvamento foi bloqueado. Atualize a página e tente novamente.'
      );
      return;
    }

    const confirmSave = window.confirm(
      'Deseja salvar a escalação atual no banco online? Isso vai atualizar os dados para todos que usam o app.'
    );

    if (!confirmSave) return;

    setIsLoading(true);

    const playersToSave = squad.map((player) => ({
      id: player.id,
      name: player.name || 'Sem nome',
      role: player.role || 'ATA',
      rating: player.rating || '80',
      photo: player.photo || null,
    }));

    const { error: playersError } = await supabase
      .from('players')
      .upsert(playersToSave, { onConflict: 'id' });

    if (playersError) {
      setIsLoading(false);
      alert('Erro ao salvar jogadores: ' + playersError.message);
      return;
    }

    const { error: stateError } = await supabase.from('team_state').upsert(
      {
        id: 'retranca-united',
        team_name: TEAM_NAME,
        formation,
        lineup_ids: lineupIds,
        bench_ids: benchIds,
        positions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    setIsLoading(false);

    if (stateError) {
      alert('Erro ao salvar escalação: ' + stateError.message);
      return;
    }

    alert('Escalação salva online!');
  }

  async function loadOnline(options = {}) {
    const { silent = false } = options;

    setIsLoading(true);
    setLoadError('');
    setHasLoadedOnline(false);

    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: true });

    if (playersError) {
      setIsLoading(false);
      setHasLoadedOnline(false);
      setLoadError(playersError.message);

      if (!silent) {
        alert('Erro ao carregar jogadores: ' + playersError.message);
      }

      return;
    }

    const { data: stateData, error: stateError } = await supabase
      .from('team_state')
      .select('*')
      .eq('id', 'retranca-united')
      .maybeSingle();

    if (stateError) {
      setIsLoading(false);
      setHasLoadedOnline(false);
      setLoadError(stateError.message);

      if (!silent) {
        alert('Erro ao carregar escalação: ' + stateError.message);
      }

      return;
    }

    if (playersData && playersData.length > 0) {
      const loadedPlayers = playersData.map((player) => ({
        id: player.id,
        name: player.name,
        role: player.role,
        rating: player.rating,
        photo: player.photo || '',
      }));

      setSquad(loadedPlayers);

      if (stateData) {
        const validPlayerIds = loadedPlayers.map((player) => player.id);

        const safeLineupIds = (stateData.lineup_ids || []).filter((id) =>
          validPlayerIds.includes(id)
        );

        const safeBenchIds = (stateData.bench_ids || []).filter((id) =>
          validPlayerIds.includes(id)
        );

        const missingIds = validPlayerIds.filter(
          (id) => !safeLineupIds.includes(id) && !safeBenchIds.includes(id)
        );

        const finalLineupIds = [...safeLineupIds, ...missingIds].slice(0, 11);
        const finalBenchIds = [
          ...safeBenchIds,
          ...missingIds.filter((id) => !finalLineupIds.includes(id)),
        ];

        const formationName = stateData.formation || '4-3-3';

        setFormation(formationName);
        setLineupIds(finalLineupIds);
        setBenchIds(finalBenchIds);
        setPositions(
          stateData.positions || formations[formationName] || formations['4-3-3']
        );
        setSelectedId(finalLineupIds[0] || loadedPlayers[0]?.id || '');
      } else {
        setLineupIds(loadedPlayers.slice(0, 11).map((player) => player.id));
        setBenchIds(loadedPlayers.slice(11).map((player) => player.id));
        setSelectedId(loadedPlayers[0]?.id || '');
      }
    } else {
      setLineupIds(starterSquad.slice(0, 11).map((player) => player.id));
      setBenchIds(starterSquad.slice(11).map((player) => player.id));
      setSelectedId(starterSquad[0]?.id || '');
    }

    setHasLoadedOnline(true);
    setIsLoading(false);
  }

  async function loadEvents(options = {}) {
    const { silent = false } = options;

    setEventsLoading(true);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true });

    setEventsLoading(false);

    if (error) {
      console.error('Erro ao carregar agenda:', error);

      if (!silent) {
        alert('Erro ao carregar agenda: ' + error.message);
      }

      return;
    }

    const loadedEvents = (data || []).map((event) => ({
      id: event.id,
      title: event.title,
      eventType: event.event_type,
      eventDate: event.event_date,
      eventTime: event.event_time || '',
      location: event.location || '',
      opponent: event.opponent || '',
      description: event.description || '',
      status: event.status || 'marcado',
    }));

    setEvents(sortEventsByDate(loadedEvents));
  }

  function updateEventForm(patch) {
    setEventForm((previousForm) => ({
      ...previousForm,
      ...patch,
    }));
  }

  function startEditEvent(event) {
    setEditingEventId(event.id);

    setEventForm({
      title: event.title || '',
      eventType: event.eventType || 'treino',
      eventDate: event.eventDate || '',
      eventTime: event.eventTime || '',
      location: event.location || '',
      opponent: event.opponent || '',
      description: event.description || '',
      status: event.status || 'marcado',
    });
  }

  function cancelEventEdit() {
    setEditingEventId(null);
    setEventForm(createEmptyEvent());
  }

  async function saveEvent() {
    if (!eventForm.title.trim()) {
      alert('Digite o título do evento.');
      return;
    }

    if (!eventForm.eventDate) {
      alert('Escolha a data do evento.');
      return;
    }

    const payload = {
      title: eventForm.title.trim(),
      event_type: eventForm.eventType,
      event_date: eventForm.eventDate,
      event_time: eventForm.eventTime || null,
      location: 'Online',
      opponent: eventForm.opponent.trim() || null,
      description: eventForm.description.trim() || null,
      status: eventForm.status,
    };

    setEventsLoading(true);

    const { error } = editingEventId
      ? await supabase.from('events').update(payload).eq('id', editingEventId)
      : await supabase.from('events').insert(payload);

    setEventsLoading(false);

    if (error) {
      alert('Erro ao salvar evento: ' + error.message);
      return;
    }

    const wasEditing = Boolean(editingEventId);

    setEditingEventId(null);
    setEventForm(createEmptyEvent());

    await loadEvents();

    alert(wasEditing ? 'Evento atualizado!' : 'Evento adicionado!');
  }

  async function removeEvent(id) {
    const confirmDelete = window.confirm('Deseja excluir este evento da agenda?');

    if (!confirmDelete) {
      return;
    }

    setEventsLoading(true);

    const { error } = await supabase.from('events').delete().eq('id', id);

    setEventsLoading(false);

    if (error) {
      alert('Erro ao excluir evento: ' + error.message);
      return;
    }

    if (editingEventId === id) {
      cancelEventEdit();
    }

    await loadEvents();
  }

  function exportLineupImage() {
    const element = document.querySelector('[data-export-lineup]');

    if (!element) {
      alert('Área da escalação não encontrada.');
      return;
    }

    const rect = element.getBoundingClientRect();
    const clone = element.cloneNode(true);

    clone.style.width = `${Math.ceil(rect.width)}px`;
    clone.style.minHeight = `${Math.ceil(rect.height)}px`;
    clone.style.background = '#030303';
    clone.style.borderRadius = '28px';
    clone.style.boxSizing = 'border-box';
    clone.style.margin = '0';

    const cssText = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(
        rect.width
      )}" height="${Math.ceil(rect.height)}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            <style>
              ${cssText}

              body {
                margin: 0;
                background: #030303;
              }

              .lineup-card {
                width: ${Math.ceil(rect.width)}px !important;
                min-height: ${Math.ceil(rect.height)}px !important;
                margin: 0 !important;
                background: #030303 !important;
                box-sizing: border-box !important;
              }

              .bench-list {
                display: flex !important;
                overflow: visible !important;
                flex-wrap: wrap !important;
              }
            </style>
            ${clone.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'retranca-united-escalacao-com-reservas.svg';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function swapArrayItems(array, fromIndex, toIndex) {
    const copy = [...array];
    const temporary = copy[fromIndex];
    copy[fromIndex] = copy[toIndex];
    copy[toIndex] = temporary;
    return copy;
  }

  function handleDropOnStarter(targetIndex) {
    if (!draggedItem) return;

    if (draggedItem.type === 'starter') {
      setLineupIds((previousLineupIds) =>
        swapArrayItems(previousLineupIds, draggedItem.index, targetIndex)
      );
    }

    if (draggedItem.type === 'bench') {
      const benchId = benchIds[draggedItem.index];
      const starterId = lineupIds[targetIndex];

      setLineupIds((previousLineupIds) =>
        previousLineupIds.map((id, index) =>
          index === targetIndex ? benchId : id
        )
      );

      setBenchIds((previousBenchIds) =>
        previousBenchIds.map((id, index) =>
          index === draggedItem.index ? starterId : id
        )
      );

      setSelectedId(benchId);
    }

    setDraggedItem(null);
  }

  function handleDropOnBench(targetIndex) {
    if (!draggedItem) return;

    if (draggedItem.type === 'bench') {
      setBenchIds((previousBenchIds) =>
        swapArrayItems(previousBenchIds, draggedItem.index, targetIndex)
      );
    }

    if (draggedItem.type === 'starter') {
      const starterId = lineupIds[draggedItem.index];
      const benchId = benchIds[targetIndex];

      setLineupIds((previousLineupIds) =>
        previousLineupIds.map((id, index) =>
          index === draggedItem.index ? benchId : id
        )
      );

      setBenchIds((previousBenchIds) =>
        previousBenchIds.map((id, index) =>
          index === targetIndex ? starterId : id
        )
      );

      setSelectedId(benchId);
    }

    setDraggedItem(null);
  }

  const filteredSquad = squad.filter((player) =>
    `${player.name} ${player.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingEvents = events
    .filter(
      (event) =>
        event.status === 'marcado' && event.eventDate >= getTodayString()
    )
    .slice(0, 5);

  const saveButtonDisabled = isLoading || !hasLoadedOnline || Boolean(loadError);

  if (isInitialLoading) {
    return (
      <div className="app-screen loading-screen">
        <div className="loading-card">
          <div className="loading-spinner" />
          <h1>{TEAM_NAME}</h1>
          <p>{initialLoadingMessage}</p>
        </div>
      </div>
    );
  }

  if (screen === 'menu') {
    return (
      <div className="app-screen menu-screen">
        <div className="menu-container">
          <div className="menu-title-box">
            <span className="eyebrow">Gerenciador e Escalação</span>
            <h1>{TEAM_NAME}</h1>
            <p>
              Cadastre jogadores, monte escalação e organize o banco de
              reservas.
            </p>
            {isLoading && <p className="muted-text">Sincronizando dados...</p>}
            {loadError && (
              <p className="muted-text">Erro ao sincronizar. Atualize a página.</p>
            )}
          </div>

          <div className="menu-grid">
            <button className="menu-card" onClick={() => setScreen('cadastro')}>
              <ClipboardList className="menu-icon red" />
              <h2>Cadastro</h2>
              <p>Adicionar jogadores, editar nome, posição, overall e foto.</p>
            </button>

            <button className="menu-card" onClick={() => setScreen('agenda')}>
              <CalendarDays className="menu-icon red" />
              <h2>Agenda</h2>
              <p>Organizar jogos, treinos, reuniões e horários do time.</p>
            </button>

            <button className="menu-card" onClick={() => setScreen('escalação')}>
              <LayoutDashboard className="menu-icon red" />
              <h2>Escalação</h2>
              <p>Alterar escalação, titulares e banco de reservas.</p>
            </button>
          </div>

          <div className="menu-actions">
            <Button
              className="btn-blue"
              onClick={saveOnline}
              disabled={saveButtonDisabled}
            >
              <Save size={16} /> Salvar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'cadastro') {
    return (
      <div className="app-screen">
        <div className="page-wrap">
          <header className="page-header">
            <div>
              <button className="back-link" onClick={() => setScreen('menu')}>
                <Home size={15} /> Menu Principal
              </button>

              <h1>Cadastro de Jogadores</h1>
              {isLoading && (
                <p className="muted-text">Sincronizando dados...</p>
              )}
              {loadError && (
                <p className="muted-text">Erro ao sincronizar. Atualize a página.</p>
              )}
            </div>

            <div className="header-actions">
              <Button className="btn-green" onClick={addPlayer} disabled={isLoading}>
                <Plus size={16} /> Adicionar
              </Button>

              <Button
                className="btn-blue"
                onClick={saveOnline}
                disabled={saveButtonDisabled}
              >
                <Save size={16} /> Salvar
              </Button>
            </div>
          </header>

          <div className="two-columns">
            <section className="main-card">
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar jogador..."
                />
              </div>

              <div className="players-grid">
                {filteredSquad.map((player) => (
                  <button
                    key={player.id}
                    className={`player-row ${
                      selectedId === player.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedId(player.id)}
                  >
                    <PlayerAvatar player={player} className="small-avatar" />

                    <div className="player-row-info">
                      <strong>{player.name}</strong>
                      <span>
                        {player.role} • OVR {player.rating}
                      </span>
                    </div>

                    <Trash2
                      className="trash"
                      size={18}
                      onClick={(event) => {
                        event.stopPropagation();
                        removePlayer(player.id);
                      }}
                    />
                  </button>
                ))}
              </div>
            </section>

            <PlayerForm
              player={selectedPlayer}
              title="Editar cadastro"
              onChange={(patch) => updatePlayer(selectedPlayer.id, patch)}
              onPhoto={handlePhoto}
            />
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'agenda') {
    return (
      <div className="app-screen">
        <div className="page-wrap">
          <header className="page-header">
            <div>
              <button className="back-link" onClick={() => setScreen('menu')}>
                <Home size={15} /> Menu Principal
              </button>

              <h1>Agenda</h1>

              {eventsLoading && (
                <p className="muted-text">Sincronizando agenda...</p>
              )}
            </div>

            <div className="header-actions">
              <Button className="btn-blue" onClick={loadEvents}>
                <CalendarDays size={16} /> Atualizar agenda
              </Button>
            </div>
          </header>

          <div className="agenda-layout">
            <section className="side-card agenda-form-card">
              <h3>{editingEventId ? 'Editar evento' : 'Novo evento'}</h3>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Título</label>
                  <input
                    value={eventForm.title}
                    onChange={(event) =>
                      updateEventForm({ title: event.target.value })
                    }
                    placeholder="Ex: Treino de sábado"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={eventForm.eventType}
                    onChange={(event) =>
                      updateEventForm({ eventType: event.target.value })
                    }
                  >
                    <option value="treino">Treino</option>
                    <option value="jogo">Jogo</option>
                    <option value="reuniao">Reunião</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(event) =>
                      updateEventForm({ status: event.target.value })
                    }
                  >
                    <option value="marcado">Marcado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(event) =>
                      updateEventForm({ eventDate: event.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Horário</label>
                  <input
                    type="time"
                    value={eventForm.eventTime}
                    onChange={(event) =>
                      updateEventForm({ eventTime: event.target.value })
                    }
                  />
                </div>

                <div className="form-group full">
                  <label>Adversário</label>
                  <input
                    value={eventForm.opponent}
                    onChange={(event) =>
                      updateEventForm({ opponent: event.target.value })
                    }
                    placeholder="Ex: Amigos FC"
                  />
                </div>

                <div className="form-group full">
                  <label>Observações</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(event) =>
                      updateEventForm({ description: event.target.value })
                    }
                    placeholder="Ex: Levar uniforme vermelho"
                  />
                </div>
              </div>

              <div className="agenda-form-actions">
                <Button className="btn-blue" onClick={saveEvent}>
                  <Save size={16} />
                  {editingEventId ? 'Salvar alterações' : 'Adicionar evento'}
                </Button>

                {editingEventId && (
                  <Button className="btn-dark" onClick={cancelEventEdit}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </section>

            <section className="main-card">
              <div className="agenda-head">
                <div>
                  <h2>Próximos eventos</h2>
                  <p className="muted-text">
                    {upcomingEvents.length} evento(s) marcado(s)
                  </p>
                </div>
              </div>

              <div className="events-list">
                {events.length === 0 && (
                  <div className="empty-agenda">
                    Nenhum evento cadastrado ainda.
                  </div>
                )}

                {events.map((event) => (
                  <article key={event.id} className="event-card">
                    <div className="event-main">
                      <div className={`event-type-badge ${getEventTypeClass(event.eventType)}`}>
                        {eventTypeLabels[event.eventType] || event.eventType}
                      </div>

                      <h3>{event.title}</h3>

                      <div className="event-meta">
                        <span>
                          <CalendarDays size={15} />
                          {formatEventDate(event.eventDate)}
                        </span>

                        <span>
                          <Clock size={15} />
                          {formatEventTime(event.eventTime)}
                        </span>
                      </div>

                      {event.opponent && (
                        <p className="event-opponent">
                          Adversário: <strong>{event.opponent}</strong>
                        </p>
                      )}

                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}
                    </div>

                    <div className="event-side">
                      <span className={`event-status ${getEventStatusClass(event.status)}`}>
                        {eventStatusLabels[event.status] || event.status}
                      </span>

                      <div className="event-actions">
                        <button
                          className="icon-action"
                          onClick={() => startEditEvent(event)}
                          title="Editar evento"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="icon-action danger"
                          onClick={() => removeEvent(event.id)}
                          title="Excluir evento"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-screen">
      <div className="lineup-layout">
        <section className="lineup-card" data-export-lineup>
          <header className="page-header compact">
            <div>
              <button className="back-link" onClick={() => setScreen('menu')}>
                <Home size={15} /> Menu Principal
              </button>

              <h1>{TEAM_NAME}</h1>
              {isLoading && (
                <p className="muted-text">Sincronizando dados...</p>
              )}
              {loadError && (
                <p className="muted-text">Erro ao sincronizar. Atualize a página.</p>
              )}
            </div>

            <div className="header-actions">
              <select
                value={formation}
                onChange={(event) => changeFormation(event.target.value)}
              >
                {Object.keys(formations).map((formationName) => (
                  <option key={formationName}>{formationName}</option>
                ))}
              </select>
            </div>
          </header>

          <div data-field className="field-shell">
            <SoccerField />

            {positions.map((slot, index) => (
              <FieldPlayer
                key={index}
                slot={slot}
                player={lineupPlayers[index]}
                selected={lineupPlayers[index]?.id === selectedId}
                onClick={() => setSelectedId(lineupPlayers[index]?.id || '')}
                onDragStart={() => setDraggedItem({ type: 'starter', index })}
                onDrop={() => handleDropOnStarter(index)}
              />
            ))}
          </div>

          <section className="bench-box">
            <div className="bench-head">
              <h2>Banco de Reservas</h2>
              <span>{benchPlayers.length} reservas</span>
            </div>

            <div className="bench-list">
              {benchPlayers.map((player, index) => (
                <button
                  key={player?.id || index}
                  draggable
                  onDragStart={() => setDraggedItem({ type: 'bench', index })}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDropOnBench(index)}
                  className={`bench-card ${
                    selectedId === player?.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedId(player?.id || '')}
                  title="Arraste para trocar com outro reserva ou titular"
                >
                  <PlayerAvatar
                    player={player}
                    fallbackIcon="shield"
                    className="bench-avatar"
                  />

                  <strong>
                    R{index + 1} • {player?.role}
                  </strong>
                  <span>{player?.name}</span>
                </button>
              ))}
            </div>
          </section>
        </section>

        <aside className="side-panel">
          <div className="side-card selected-view-card">
            <h3>Jogador selecionado</h3>

            <div className="selected-view-head">
              <PlayerAvatar player={selectedPlayer} className="edit-photo" />

              <div>
                <strong>{selectedPlayer?.name || 'Nenhum jogador'}</strong>
                <span>
                  {selectedPlayer?.role || '--'} • OVR{' '}
                  {selectedPlayer?.rating || '--'}
                </span>
              </div>
            </div>

            <p className="hint-text">
              Para alterar nome, posição, overall ou foto, volte ao cadastro.
            </p>
          </div>

          <div className="side-card">
            <h3>Ações</h3>

            <div className="save-grid vertical-actions">
              <Button
                className="btn-blue"
                onClick={saveOnline}
                disabled={saveButtonDisabled}
              >
                <Save size={16} /> Salvar alterações
              </Button>

              <Button className="btn-red-outline" onClick={exportLineupImage}>
                <Download size={16} /> Exportar escalação
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
