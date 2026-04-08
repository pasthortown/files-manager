import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { StatsCard } from './index';
import BarChartCard from './BarChartCard';
import LineChartCard from './LineChartCard';
import DoughnutChartCard from './DoughnutChartCard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Dashboard: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard</h1>
          <p className="page-header__subtitle">Resumen general del administrador de archivos</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="d-grid gap-6 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <StatsCard
          title="Total Archivos"
          value="1,248"
          subtitle="En todas las carpetas"
          icon={
            <svg width="32" height="32" fill="none" stroke="#E31837" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Almacenamiento"
          value="45.2 GB"
          subtitle="De 100 GB disponibles"
          icon={
            <svg width="32" height="32" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          }
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatsCard
          title="Usuarios Activos"
          value="32"
          subtitle="Conectados esta semana"
          icon={
            <svg width="32" height="32" fill="none" stroke="#10B981" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          trend={{ value: -2.1, isPositive: false }}
        />
        <StatsCard
          title="Carpetas"
          value="86"
          subtitle="Organizacion activa"
          icon={
            <svg width="32" height="32" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          trend={{ value: 5.0, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="d-grid gap-6 mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <BarChartCard />
        <LineChartCard />
      </div>

      {/* Bottom Row */}
      <div className="d-grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <DoughnutChartCard />
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Actividad Reciente</h3>
            <p className="card__subtitle">Ultimas acciones realizadas</p>
          </div>
          <div className="card__body">
            <div className="d-flex flex-column gap-4">
              <ActivityItem
                action="subio"
                fileName="Informe_Q1_2026.pdf"
                user="Maria Garcia"
                time="Hace 5 min"
                type="upload"
              />
              <ActivityItem
                action="descargo"
                fileName="Presentacion_ventas.pptx"
                user="Carlos Lopez"
                time="Hace 15 min"
                type="download"
              />
              <ActivityItem
                action="elimino"
                fileName="borrador_antiguo.docx"
                user="Ana Martinez"
                time="Hace 1 hora"
                type="delete"
              />
              <ActivityItem
                action="compartio"
                fileName="Fotos_evento.zip"
                user="Pedro Sanchez"
                time="Hace 2 horas"
                type="share"
              />
              <ActivityItem
                action="creo carpeta"
                fileName="Proyectos 2026"
                user="Laura Torres"
                time="Hace 3 horas"
                type="folder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  action: string;
  fileName: string;
  user: string;
  time: string;
  type: 'upload' | 'download' | 'delete' | 'share' | 'folder';
}

const activityColors: Record<ActivityItemProps['type'], string> = {
  upload: '#10B981',
  download: '#3B82F6',
  delete: '#EF4444',
  share: '#F59E0B',
  folder: '#6B7280',
};

const ActivityItem: React.FC<ActivityItemProps> = ({ action, fileName, user, time, type }) => {
  return (
    <div className="d-flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
      <div
        className="d-flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          backgroundColor: `${activityColors[type]}1A`,
        }}
      >
        <svg width="18" height="18" fill="none" stroke={activityColors[type]} viewBox="0 0 24 24">
          {type === 'upload' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          )}
          {type === 'download' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          )}
          {type === 'delete' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          )}
          {type === 'share' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          )}
          {type === 'folder' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          )}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          <span className="text-secondary">{user}</span>{' '}
          {action}{' '}
          <span className="font-semibold">{fileName}</span>
        </p>
        <p className="text-xs text-secondary">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
