interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="card">
      <div className="card__body">
        <div className="d-flex justify-between items-start">
          <div>
            <p className="text-sm text-secondary mb-1">{title}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
            {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
            {trend && (
              <p className={`text-sm font-medium mt-2 ${trend.isPositive ? 'text-success' : 'text-error'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
                <span className="text-secondary ml-1">vs mes anterior</span>
              </p>
            )}
          </div>
          <div className="d-flex items-center justify-center" style={{ width: 48, height: 48 }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
