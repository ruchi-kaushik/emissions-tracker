import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ArrowUp, ArrowDown, Target, TrendingUp } from 'lucide-react';
import './App.css';


// --- Helper Components ---

const KPICard = ({ title, value, change, unit = '%' }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0 || !isFinite(change);
    const colorClass = isPositive ? 'text-red-500' : 'text-green-500';
    const Icon = isPositive ? ArrowUp : ArrowDown;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center">
            <h3 className="text-md font-semibold text-gray-500 mb-2">{title}</h3>
            <p className="text-4xl font-bold text-gray-800">{value.toFixed(1)}{unit}</p>
            {!isNeutral && (
                 <div className={`flex items-center mt-2 text-sm font-medium ${colorClass}`}>
                    <Icon size={16} className="mr-1" />
                    <span>{Math.abs(change).toFixed(1)}% {isPositive ? 'Increase' : 'Reduction'} vs Previous Year</span>
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, name, value, onChange, year }) => (
    <div>
        <label htmlFor={`${name}-${year}`} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input
            type="number"
            id={`${name}-${year}`}
            name={name}
            value={value}
            onChange={(e) => onChange(year, name, e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., 5000"
            min="0"
        />
    </div>
);

// --- Main App Component ---

export default function App() {
    const [data, setData] = useState({
        previous: { scope1: 12000, scope2: 8000, scope3: 25000 },
        current: { scope1: 11000, scope2: 7500, scope3: 26000 },
    });
    const [kpi, setKpi] = useState(10); // Default 10% reduction target

    const handleDataChange = (year, scope, value) => {
        setData(prev => ({
            ...prev,
            [year]: {
                ...prev[year],
                [scope]: parseFloat(value) || 0
            }
        }));
    };

    const totals = useMemo(() => {
        const sum = (yearData) => yearData.scope1 + yearData.scope2 + yearData.scope3;
        return {
            previous: sum(data.previous),
            current: sum(data.current)
        };
    }, [data]);

    const changes = useMemo(() => {
        const calculateChange = (prev, curr) => {
            if (prev === 0) return curr > 0 ? Infinity : 0;
            return ((curr - prev) / prev) * 100;
        };
        return {
            scope1: calculateChange(data.previous.scope1, data.current.scope1),
            scope2: calculateChange(data.previous.scope2, data.current.scope2),
            scope3: calculateChange(data.previous.scope3, data.current.scope3),
            total: calculateChange(totals.previous, totals.current)
        };
    }, [data, totals]);

    const chartData = useMemo(() => [
        { name: 'Scope 1', 'Previous Year': data.previous.scope1, 'Current Year': data.current.scope1 },
        { name: 'Scope 2', 'Previous Year': data.previous.scope2, 'Current Year': data.current.scope2 },
        { name: 'Scope 3', 'Previous Year': data.previous.scope3, 'Current Year': data.current.scope3 },
    ], [data]);

    const kpiProgress = useMemo(() => {
        const reductionAchieved = -changes.total; // Invert for reduction
        if (reductionAchieved <= 0) return 0;
        if (kpi === 0) return reductionAchieved > 0 ? 100 : 0;
        return Math.min((reductionAchieved / kpi) * 100, 100); // Cap at 100%
    }, [changes.total, kpi]);
    
    const kpiChartData = [{ name: 'Progress', value: kpiProgress, fill: '#82ca9d' }];

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800">Emissions Performance Tracker</h1>
                    <p className="mt-2 text-lg text-gray-600">Compare year-over-year emissions and track progress against your reduction targets.</p>
                </header>

                {/* --- Data Input Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6">Emissions Data (Kg/CO2e)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-4">Previous Year</h3>
                                <div className="space-y-4">
                                    <InputField label="Scope 1" name="scope1" value={data.previous.scope1} onChange={handleDataChange} year="previous" />
                                    <InputField label="Scope 2" name="scope2" value={data.previous.scope2} onChange={handleDataChange} year="previous" />
                                    <InputField label="Scope 3" name="scope3" value={data.previous.scope3} onChange={handleDataChange} year="previous" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-4">Current Year</h3>
                                <div className="space-y-4">
                                    <InputField label="Scope 1" name="scope1" value={data.current.scope1} onChange={handleDataChange} year="current" />
                                    <InputField label="Scope 2" name="scope2" value={data.current.scope2} onChange={handleDataChange} year="current" />
                                    <InputField label="Scope 3" name="scope3" value={data.current.scope3} onChange={handleDataChange} year="current" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6">Set Your Goal</h2>
                        <div className="flex items-center gap-2">
                           <Target size={24} className="text-indigo-600" />
                           <h3 className="text-lg font-semibold text-gray-600">Reduction Target</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 mb-4">Set the desired % reduction in total emissions for the current year.</p>
                        <div className="relative">
                            <input
                                type="number"
                                value={kpi}
                                onChange={(e) => setKpi(parseFloat(e.target.value) || 0)}
                                className="w-full pl-4 pr-12 py-3 text-2xl font-bold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                min="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">%</span>
                        </div>
                    </div>
                </div>

                {/* --- Visualization Dashboard --- */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Performance Analysis</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                        <KPICard title="Total Emissions Change" value={changes.total} change={changes.total} />
                        <KPICard title="Scope 1 Change" value={changes.scope1} change={changes.scope1} />
                        <KPICard title="Scope 2 Change" value={changes.scope2} change={changes.scope2} />
                        <KPICard title="Scope 3 Change" value={changes.scope3} change={changes.scope3} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-700 mb-4">Year-over-Year Emissions Comparison</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${value.toLocaleString()} Kg/CO2e`} />
                                    <Legend />
                                    <Bar dataKey="Previous Year" fill="#a0aec0" />
                                    <Bar dataKey="Current Year" fill="#4c51bf" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-700 mb-4">Progress to KPI Target</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadialBarChart 
                                    innerRadius="50%" 
                                    outerRadius="80%" 
                                    data={kpiChartData} 
                                    startAngle={180} 
                                    endAngle={0}
                                >
                                    <PolarAngleAxis
                                        type="number"
                                        domain={[0, 100]}
                                        angleAxisId={0}
                                        tick={false}
                                    />
                                    <RadialBar
                                        background
                                        clockWise
                                        dataKey="value"
                                        cornerRadius={10}
                                    />
                                    <text
                                        x="50%"
                                        y="55%"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-5xl font-bold fill-gray-700"
                                    >
                                        {kpiProgress.toFixed(0)}%
                                    </text>
                                     <text
                                        x="50%"
                                        y="70%"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-lg fill-gray-500"
                                    >
                                        of {kpi}% target
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
