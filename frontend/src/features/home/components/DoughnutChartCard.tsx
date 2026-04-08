import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

const DoughnutChartCard: React.FC = () => {
  const data = {
    labels: ['Documentos', 'Imagenes', 'Videos', 'Audio', 'Otros'],
    datasets: [
      {
        data: [35, 25, 20, 10, 10],
        backgroundColor: [
          '#E31837',
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#6B7280',
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
    },
  };

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">Tipos de Archivo</h3>
        <p className="card__subtitle">Distribucion por tipo de contenido</p>
      </div>
      <div className="card__body d-flex justify-center" style={{ height: 300 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChartCard;
