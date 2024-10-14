"use client";
import { useState } from 'react';

interface Workday {
    start: string;
    end: string;
    breakStart: string;
    breakEnd: string;
    hasBreak: boolean;
}

const Home: React.FC = () => {
    const [hourlyWage, setHourlyWage] = useState<number>(0);
    const [workdays, setWorkdays] = useState<Workday[]>([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);

    const addWorkday = () => {
        setWorkdays([...workdays, { start: '', end: '', breakStart: '', breakEnd: '', hasBreak: false }]);
    };

    const handleChange = (index: number, field: keyof Workday, value: string | boolean) => {
        const newWorkdays = [...workdays];
        if (field === 'hasBreak') {
            newWorkdays[index][field] = value as boolean;
        } else {
            newWorkdays[index][field] = value as string;
        }
        setWorkdays(newWorkdays);
    };

    const calculateIncome = () => {
        let income = 0;

        workdays.forEach(day => {
            const { start, end, breakStart, breakEnd, hasBreak } = day;

            const startTime = new Date(`1970-01-01T${start}:00`);
            const endTime = new Date(`1970-01-01T${end}:00`);
            let workDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            if (hasBreak) {
                const breakStartTime = new Date(`1970-01-01T${breakStart}:00`);
                const breakEndTime = new Date(`1970-01-01T${breakEnd}:00`);
                const breakDuration = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60);
                workDuration -= breakDuration;
            }

            if (workDuration > 8) {
                income += (8 * hourlyWage) + ((workDuration - 8) * hourlyWage * 1.25);
            } else {
                income += workDuration * hourlyWage;
            }
        });

        setTotalIncome(income);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">アルバイトの月収自動計算機</h1>
            
            <div className="mb-4">
                <label className="block text-lg text-gray-700 mb-2">時給</label>
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={hourlyWage === 0 ? '' : hourlyWage}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        if (!isNaN(Number(inputValue))) {
                            setHourlyWage(Number(inputValue));
                        }
                    }}
                />
            </div>
            
            {workdays.map((workday, index) => (
                <div key={index} className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">出勤日 {index + 1}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 mb-2">出勤時間</label>
                            <input
                                type="time"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={workday.start}
                                onChange={(e) => handleChange(index, 'start', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2">退勤時間</label>
                            <input
                                type="time"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={workday.end}
                                onChange={(e) => handleChange(index, 'end', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-600 mb-2">休憩があったか</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={workday.hasBreak.toString()}
                            onChange={(e) => handleChange(index, 'hasBreak', e.target.value === 'true')}
                        >
                            <option value="false">いいえ</option>
                            <option value="true">はい</option>
                        </select>
                    </div>
                    {workday.hasBreak && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-gray-600 mb-2">休憩開始時間</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={workday.breakStart}
                                    onChange={(e) => handleChange(index, 'breakStart', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-2">休憩終了時間</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={workday.breakEnd}
                                    onChange={(e) => handleChange(index, 'breakEnd', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <div className="flex gap-4 mt-4">
                <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600"
                    onClick={addWorkday}
                >
                    出勤日を追加
                </button>
                <button
                    className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600"
                    onClick={calculateIncome}
                >
                    収入を計算
                </button>
            </div>

            <h2 className="text-xl font-semibold mt-8 text-gray-800">合計収入: {totalIncome.toFixed(2)} 円</h2>
        </div>
    );
};

export default Home;