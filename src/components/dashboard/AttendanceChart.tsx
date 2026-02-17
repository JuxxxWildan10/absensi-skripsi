import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AttendanceChartProps {
    data: Array<{
        date: string;
        present: number;
        alpha: number;
        late: number;
        sick: number;
    }>;
}

const COLORS = {
    present: '#10b981', // green
    sick: '#3b82f6',    // blue
    late: '#f59e0b',    // orange
    absent: '#ef4444'   // red
};

export const AttendanceBarChart: React.FC<AttendanceChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                    }}
                />
                <Legend />
                <Bar dataKey="present" name="Hadir" fill={COLORS.present} radius={[8, 8, 0, 0]} />
                <Bar dataKey="sick" name="Sakit" fill={COLORS.sick} radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" name="Terlambat" fill={COLORS.late} radius={[8, 8, 0, 0]} />
                <Bar dataKey="alpha" name="Alpa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

interface PieChartData {
    name: string;
    value: number;
}

export const AttendancePieChart: React.FC<{ data: PieChartData[] }> = ({ data }) => {
    const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};
