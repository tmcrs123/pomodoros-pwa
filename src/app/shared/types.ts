export type ClockStatus = 'RUNNING' | 'STOPPED';
export type StepDescription = 'FOCUS' | 'BREAK' | 'LONG-BREAK'

export type Step = {
    backgroundColor: string
    duration: number,
    icon: string,
    stepDescription: StepDescription,
}

export type AppState = {
    longBreakLength: number
    loopsBeforeLongBreak: number
    pomodoroLength: number
    shortBreakLength: number
}