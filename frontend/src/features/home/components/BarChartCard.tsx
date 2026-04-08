import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

const BarChartCard: React.FC = () => {
  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Archivos subidos',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(227, 24, 55, 0.8)',
        borderColor: '#E31837',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Archivos descargados',
        data: [45, 70, 60, 50, 75, 40],
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        borderColor: '#1A1A2E',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">Actividad de Archivos</h3>
        <p className="card__subtitle">Archivos subidos y descargados por mes</p>
      </div>
      <div className="card__body" style={{ height: 300 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChartCard;
