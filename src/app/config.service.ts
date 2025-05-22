import { computed, Injectable, signal } from '@angular/core';
import { AppState, Step } from './shared/types';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public state = signal<AppState>({ longBreakLength: 15, loopsBeforeLongBreak: 2, pomodoroLength: 1, shortBreakLength: 5 })

  public setState(updatedState: Partial<Record<keyof AppState, number>>) {
    this.state.set({ ...this.state(), ...updatedState });
  }

  public orderedSteps = computed<{ [index: number]: Step }>(() => {
    return {
      0: { stepDescription: 'Focus', duration: this.state().pomodoroLength, backgroundColor: "#ff6b6b", icon: '💪' },
      1: { stepDescription: 'Break', duration: this.state().shortBreakLength, backgroundColor: "#6bcb77", icon: '☕' },
      2: { stepDescription: 'Long-break', duration: this.state().longBreakLength, backgroundColor: "#4d96ff", icon: '💤' }

    }
  }

  )

}
