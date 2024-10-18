"use client";
import { useEffect, useState } from 'react';

type WorkTime = {
  start: string;
  end: string;
  breakStart?: string;
  breakEnd?: string;
  income?: number;
};

export default function Home() {
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
    const jst = 32400000; //日本時間に合わせるため（9時間は32400000ms）
    const daysecond = 86400000; //1日の秒数[ms]
    const newWorkTimes = [...workTimes];

    const dailySalaries = workTimes.map(({ start, end, breakStart, breakEnd }, index) => {
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
        const overtimeEnd = new Date(`1970-01-02T05:00:00`);

        // 変数一覧
        const st = startTime.getTime() + jst;
        const bst = breakStartTime.getTime() + jst;
        const bet = breakEndTime.getTime() + jst;
        const et = endTime.getTime() + jst;
        const os = overtimeStart.getTime() + jst;
        const oe = overtimeEnd.getTime() + jst;
    
        const totalWorkHours = (et - bet + bst - st) / (1000 * 60 * 60);
        newWorkTimes[index].income = totalWorkHours;
    
        let dailySalary = totalWorkHours * hourlyRate;

        let overtimeHours = 0;
        if (totalWorkHours > 8) {
            overtimeHours = totalWorkHours - 8;
            dailySalary += overtimeHours * (hourlyRate * 0.25);
        }

        let nightHours = 0;
        //休憩がないとして計算

        //日を跨いでいない場合
        if (et < daysecond) {
          //出勤時間が5時より前の場合
          if (st < oe - daysecond) {
            nightHours += (Math.min(oe - daysecond,et) - st) / (1000 * 60 * 60);
            //退勤時間が22時より後の場合
            if (os < et) {
              nightHours += (et - os) / (1000 * 60 * 60);
            }
          }
          //出勤時間が5時〜22時の場合
          else if (st < os) {
            nightHours += Math.max(et - os,0) / (1000 * 60 * 60);
          }
          //出勤時間が22時より後の場合
          else {
            nightHours += (et - st) / (1000 * 60 * 60);
          }
        }
        //日を跨ぐ場合
        else {
          //出勤時間が5時より前の場合
          if (st < oe - daysecond) {
            nightHours += ((oe - daysecond) - st) / (1000 * 60 * 60);
            nightHours += (et - os) / (1000 * 60 * 60);
          }
          //出勤時間が5時〜22時の場合
          else if (st < os) {
            nightHours += (Math.min(oe,et) - os) / (1000 * 60 * 60);
          }
          //出勤時間が22時より後の場合
          else {
            nightHours += (Math.min(oe, et) - st) / (1000 * 60 * 60);
            nightHours += (Math.max(et - (os + daysecond),0)) / (1000 * 60 * 60);
          }
        }
        //休憩分を引く

        //日を跨いでいない場合
        if (bet < daysecond) {
          //休憩開始時間が5時より前の場合
          if (bst < oe - daysecond) {
            nightHours -= (Math.min(oe - daysecond,bet) - bst) / (1000 * 60 * 60);
            //休憩終了時間が22時より後の場合
            if (os < bet) {
              nightHours -= (bet - os) / (1000 * 60 * 60);
            }
          }
          //休憩開始時間が5時〜22時の場合
          else if (bst < os) {
            nightHours -= Math.max(bet - os,0) / (1000 * 60 * 60);
          }
          //休憩開始時間が22時より後の場合
          else {
            nightHours -= (bet - bst) / (1000 * 60 * 60);
          }
        }
        //日を跨ぐ場合
        else {
          //休憩開始時間が5時より前の場合
          if (bst < oe - daysecond) {
            nightHours -= ((oe - daysecond) - bst) / (1000 * 60 * 60);
            nightHours -= (bet - os) / (1000 * 60 * 60);
          }
          //休憩開始時間が5時〜22時の場合
          else if (bst < os) {
            nightHours -= (Math.min(oe,bet) - os) / (1000 * 60 * 60);
          }
          //休憩開始時間が22時〜29時の場合
          else if (bst < oe) {
            nightHours -= (Math.min(oe, bet) - bst) / (1000 * 60 * 60);
            nightHours -= (Math.max(bet - (os + daysecond),0)) / (1000 * 60 * 60);
          }
          //休憩開始時間が29時より後の場合
          else {
            nightHours -= Math.max(bet - (os + daysecond),0) / (1000 * 60 * 60);
          }
        }
        dailySalary += nightHours * (hourlyRate * 0.25);
    
        total += dailySalary;
        return dailySalary;
       
    });
  
    if (JSON.stringify(newWorkTimes) !== JSON.stringify(workTimes)) {
        setWorkTimes(newWorkTimes);
    }
    setDailySalaries([...dailySalaries]);
    setTotalSalary(total);
  }, [workTimes]);
  const totalWorkHours = workTimes.reduce((acc, workTime) => acc + (workTime.income || 0), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">給料自動計算機</h1>
      
      <div className="flex items-center mb-6">
        <h3 className="text-xl font-semibold mr-4">時給:</h3>
        <input
          type="text"
          placeholder="例) 1200"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(e.target.value)}
          className="w-1/4 p-2 border border-gray-300 rounded text-center"
        />
        <span className="ml-2 text-lg">円</span>
      </div>
  
      <div className="h-[450px] overflow-y-auto">
        {workTimes.map((workTime, index) => (
          <div key={index} className="mb-6 border-b p-4 bg-blue-50 shadow-lg rounded-xl border">
            <h3 className="text-xl font-semibold mb-2">出勤日 {index + 1}</h3>
            
            <div className="flex gap-4 mb-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">出勤時間</label>
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
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">退勤時間</label>
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
            </div>
  
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">休憩</label>
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
                className="w-1/4 p-2 border border-gray-300 rounded"
              >
                <option value="no">なし</option>
                <option value="yes">あり</option>
              </select>
            </div>
  
            {workTime.breakStart !== undefined && (
              <div className="flex gap-4 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">休憩開始時間</label>
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
  
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">休憩終了時間</label>
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
              </div>
            )}
  
            <div className="mt-2">
              <p className="font-semibold">給料: {Math.round(dailySalaries[index])} 円</p>
            </div>
          </div>
        ))}
      </div>
  
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-center space-y-4 md:space-y-0">
        <button
          onClick={handleAddDay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          出勤日を追加
        </button>

        <h2 className="text-2xl font-semibold">出勤日数: {workTimes.length} 日</h2>

        <h2 className="text-2xl font-semibold">総労働時間: {Math.round(totalWorkHours)} 時間</h2>

        <h2 className="text-2xl font-semibold">月収: {Math.round(totalSalary)} 円</h2>
      </div>
    </div>
  );
};