"use client";
import { useEffect, useState } from 'react';

type WorkTime = {
  start: string;
  end: string;
  breakStart?: string;
  breakEnd?: string;
};

const Home = () => {
  const [hourlyWage, setHourlyWage] = useState<string>('');
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([{ start: '', end: '' }]);
  const [dailySalaries, setDailySalaries] = useState<number[]>([]);
  const [totalSalary, setTotalSalary] = useState<number>(0);

  const handleAddDay = () => {
    setWorkTimes([...workTimes, { start: '', end: '' }]);
  };

  useEffect(() => {
    let total = 0;
    const hourlyRate = parseFloat(hourlyWage);

    const dailySalaries = workTimes.map(({ start, end, breakStart, breakEnd }) => {
        if (!start || !end) return 0;
    
        const startTime = new Date(`1970-01-01T${start}`);
        let endTime = new Date(`1970-01-01T${end}`);
        if (start > end){
            endTime = new Date(`1970-01-02T${end}`);
        }
        let breakStartTime = endTime;
        let breakEndTime = endTime;
    
        if (breakStart && breakEnd) {
            breakStartTime = new Date(`1970-01-01T${breakStart}`);
            breakEndTime = new Date(`1970-01-01T${breakEnd}`);
            if (start > breakStart) {
                breakStartTime = new Date(`1970-01-02T${breakStart}`);
                breakEndTime = new Date(`1970-01-02T${breakEnd}`);
            } else if(breakStart > breakEnd){
                breakEndTime = new Date(`1970-01-02T${breakEnd}`);
            }
        }
    
        const overtimeStart = new Date(`1970-01-01T22:00:00`);
        const overtimeEnd = new Date(`1970-01-01T29:00:00`);
    
        // 実際に労働していた時間を計算
        const workDurationBeforeBreak = (breakStartTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const workDurationAfterBreak = (endTime.getTime() - breakEndTime.getTime()) / (1000 * 60 * 60);
        const totalWorkHours = workDurationBeforeBreak + workDurationAfterBreak;
    
        // 基本給を用いて基本的な給料を計算
        let dailySalary = totalWorkHours * hourlyRate;
    
        // 労働時間が8時間を超過している場合
        if (totalWorkHours > 8) {
            const overtimeHours = totalWorkHours - 8;
            dailySalary += overtimeHours * (hourlyRate * 0.25); // 超過分の給料を追加
        }
    
        // 22時以降29時以前に働いていた場合の計算
        let lateNightHours = 0;
        if (endTime > overtimeStart　|| startTime < overtimeEnd) {
            const lateNightStart = Math.max(startTime.getTime(), overtimeStart.getTime());
            const lateNightEnd = Math.min(endTime.getTime(), overtimeEnd.getTime());
            lateNightHours = (Math.max(breakStartTime.getTime() - lateNightStart,0) + Math.max(lateNightEnd - breakEndTime.getTime(),0)) / (1000 * 60 * 60);
            dailySalary += lateNightHours * (hourlyRate * 0.25); // 深夜手当を追加
        }
    
        total += dailySalary; // 合計給料に加算
        return dailySalary; // 日ごとの給料を返す
    });
  
    setDailySalaries([...dailySalaries]);
    setTotalSalary(total);
  }, [workTimes]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">給料自動計算機</h1>
      
      <div className="mb-4">
        <label className="block text-lg mb-2">時給:</label>
        <input
          type="text"
          placeholder="例）1200"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {workTimes.map((workTime, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold">出勤日 {index + 1}</h3>

          <div className="mb-2">
            <label className="block mb-1">出勤時間:</label>
            <input
              type="time"
              value={workTime.start}
              onChange={(e) => {
                const newWorkTimes = [...workTimes];
                newWorkTimes[index].start = e.target.value;
                setWorkTimes(newWorkTimes);
              }}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">退勤時間:</label>
            <input
              type="time"
              value={workTime.end}
              onChange={(e) => {
                const newWorkTimes = [...workTimes];
                newWorkTimes[index].end = e.target.value;
                setWorkTimes(newWorkTimes);
              }}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">休憩:</label>
            <select
              onChange={(e) => {
                const newWorkTimes = [...workTimes];
                if (e.target.value === 'yes') {
                  newWorkTimes[index].breakStart = '';
                  newWorkTimes[index].breakEnd = '';
                } else {
                  delete newWorkTimes[index].breakStart;
                  delete newWorkTimes[index].breakEnd;
                }
                setWorkTimes(newWorkTimes);
              }}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="no">なし</option>
              <option value="yes">あり</option>
            </select>
          </div>

          {workTime.breakStart !== undefined && (
            <>
              <div className="mb-2">
                <label className="block mb-1">休憩開始時間:</label>
                <input
                  type="time"
                  value={workTime.breakStart}
                  onChange={(e) => {
                    const newWorkTimes = [...workTimes];
                    newWorkTimes[index].breakStart = e.target.value;
                    setWorkTimes(newWorkTimes);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1">休憩終了時間:</label>
                <input
                  type="time"
                  value={workTime.breakEnd}
                  onChange={(e) => {
                    const newWorkTimes = [...workTimes];
                    newWorkTimes[index].breakEnd = e.target.value;
                    setWorkTimes(newWorkTimes);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          <div className="mt-2">
            <p className="font-semibold">給料: {String(dailySalaries[index])}</p>
          </div>
        </div>
      ))}

      <div className="mb-4">
        <button
          onClick={handleAddDay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          出勤日を追加
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-semibold">総給料: {totalSalary.toFixed(2)} 円</h2>
      </div>
    </div>
  );
};

export default Home;