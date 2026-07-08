import React from 'react';
import { useSelector } from 'react-redux';
import { Calendar, MessageCircle, MoreVertical, Layers, Users, Smile } from 'lucide-react';

export default function Dashboard() {
    const { list, status } = useSelector(state => state.interactions);

    if (status === 'loading') {
        return (
            <div className="flex h-64 items-center justify-center p-8">
                <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        { 
            label: 'Total Interactions', 
            value: list.length, 
            trend: '+12% this month',
            icon: <Layers className="w-5 h-5 text-brand-600" />,
            bg: "bg-brand-50"
        },
        { 
            label: 'In-person Meetings', 
            value: list.filter(i => i.interaction_type === 'In-person Meeting').length, 
            trend: 'Most frequent',
            icon: <Users className="w-5 h-5 text-violet-600" />,
            bg: "bg-violet-50"
        },
        { 
            label: 'Positive Outcomes', 
            value: list.filter(i => i.sentiment === 'Positive').length, 
            trend: '85% success rate',
            icon: <Smile className="w-5 h-5 text-emerald-600" />,
            bg: "bg-emerald-50"
        },
    ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">Welcome back, SalesRep 👋</h2>
                    <p className="text-gray-500 mt-1">Here is your HCP interaction overview for today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                            <div className={`${stat.bg} p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-6 flex items-end justify-between">
                            <span className="text-4xl font-black text-gray-800 tracking-tight">{stat.value}</span>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm">
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Recent Interactions</h3>
                    <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">View All</button>
                </div>

                {list.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4 animate-pulse" />
                        <p className="text-lg font-bold text-gray-600">No interactions logged yet</p>
                        <p className="text-sm mt-1">Start logging your doctor visits to see them here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
                                    <th className="px-6 py-4">HCP Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Sentiment</th>
                                    <th className="px-6 py-4">Topics</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {list.slice(0, 10).map((item) => (
                                    <tr key={item.id} className="hover:bg-brand-50/20 transition-all duration-150 group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                                    {item.doctor_name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-gray-800">{item.doctor_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors
                                                ${item.interaction_type === 'In-person Meeting' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                  item.interaction_type === 'Virtual Call' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                  item.interaction_type === 'Email' ? 'bg-sky-50 text-sky-700 border-sky-100' : 
                                                  'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                {item.interaction_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-800">{item.date}</div>
                                            <div className="text-xs text-gray-400 font-medium">{item.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide border
                                                ${item.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                  item.sentiment === 'Negative' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                                                  'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                                {item.sentiment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-xs truncate font-medium">{item.topics_discussed}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                                            <button className="p-1.5 hover:text-brand-600 hover:bg-brand-50 transition-all rounded-lg">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
