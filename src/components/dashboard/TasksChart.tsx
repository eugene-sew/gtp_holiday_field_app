import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "../ui/Card";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

const TasksChart = ({ data }: { data: ChartDataItem[] }) => {
  const chartData = data.filter((item) => item.value > 0);
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  if (totalValue === 0) {
    return (
      <Card title="Task Status Distribution" className="h-full">
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <p>No task data to display.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Task Status Distribution" className="h-full">
      <ResponsiveContainer width="100%" height={256}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} tasks`,
              name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TasksChart;
