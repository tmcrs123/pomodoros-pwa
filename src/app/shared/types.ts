export type ClockStatus = 'RUNNING' | 'STOPPED';

export type Step = {
    backgroundColor: string
    duration: number,
    icon: string,
    stepDescription: string,
}

export type AppState = {
    longBreakLength: number
    loopsBeforeLongBreak: number
    pomodoroLength: number
    shortBreakLength: number
}