import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

const LineChartCard: React.FC = () => {
  const data = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [
      {
        label: 'Almacenamiento usado (GB)',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#E31837',
        backgroundColor: 'rgba(227, 24, 55, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#E31837',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Usuarios activos',
        data: [5, 12, 8, 15, 10, 18, 14],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
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
        <h3 className="card__title">Tendencia Semanal</h3>
        <p className="card__subtitle">Uso de almacenamiento y usuarios activos</p>
      </div>
      <div className="card__body" style={{ height: 300 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChartCard;
