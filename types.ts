
export interface HourlyLog {
  [hour: number]: number;
}

export interface Exercise {
  id: string;
  name: string;
  goal: number;
  hourlyLogs: HourlyLog;
}
