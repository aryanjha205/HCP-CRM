import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logInteraction } from '../store/interactionsSlice';
import { Save, Calendar, Clock, User, MessageCircle, FileBarChart, ThumbsUp, CheckSquare, Target } from 'lucide-react';

export default function FormLog() {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        doctor_name: '',
        interaction_type: 'In-person Meeting',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        topics_discussed: '',
        materials_shared: '',
        sentiment: 'Positive',
        outcomes: '',
        follow_up_actions: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(logInteraction(formData)).then(() => {
            alert("Interaction logged successfully!");
            setFormData({
                doctor_name: '', interaction_type: 'In-person Meeting', date: new Date().toISOString().split('T')[0], time: '12:00',
                topics_discussed: '', materials_shared: '', sentiment: 'Positive', outcomes: '', follow_up_actions: ''
            });
        });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" />
                Structured Logging
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Doctor Name</label>
                        <input required type="text" name="doctor_name" value={formData.doctor_name} onChange={handleChange} className="w-full relative px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-gray-800" placeholder="Dr. John Doe" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Interaction Type</label>
                        <select name="interaction_type" value={formData.interaction_type} onChange={handleChange} className="w-full relative px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800 bg-white">
                            <option>In-person Meeting</option>
                            <option>Virtual Call</option>
                            <option>Email</option>
                            <option>Phone Call</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</label>
                        <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</label>
                        <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800" />
                    </div>

                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Topics Discussed</label>
                    <textarea required rows="2" name="topics_discussed" value={formData.topics_discussed} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800 resize-none" placeholder="Clinical trials, product efficacy..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><FileBarChart className="w-4 h-4" /> Materials Shared</label>
                        <input type="text" name="materials_shared" value={formData.materials_shared} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800" placeholder="Efficacy Brochure PDF" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> Sentiment</label>
                        <select name="sentiment" value={formData.sentiment} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800 bg-white">
                            <option>Positive</option>
                            <option>Neutral</option>
                            <option>Negative</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Outcomes</label>
                    <textarea rows="2" name="outcomes" value={formData.outcomes} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800 resize-none" placeholder="Doctor agreed to prescribed the new drug for specific patient profiles."></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Target className="w-4 h-4" /> Follow-up Actions</label>
                    <input type="text" name="follow_up_actions" value={formData.follow_up_actions} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-gray-800" placeholder="Schedule follow-up call in 2 weeks" />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Interaction
                    </button>
                </div>
            </form>
        </div>
    );
}
