export type ClockStatus = 'RUNNING' | 'STOPPED' | 'IDLE';

export type StepDescription = 'focus' | 'break' | 'long-break'

export type Step = {
    stepDescription: StepDescription,
    duration: number,
    backgroundColor: string
}

export type AppState = {
    pomodoroLength: number
    shortBreakLength: number
    longBreakLength: number
    loopsBeforeLongBreak: number
}