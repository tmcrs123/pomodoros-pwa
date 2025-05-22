import { computed, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AppState, Step } from './shared/types';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public state = signal<AppState>({ longBreakLength: 15, loopsBeforeLongBreak: 2, pomodoroLength: 60, shortBreakLength: 5 })

  public setState(updatedState: Partial<Record<keyof AppState, number>>) {
    this.state.set({ ...this.state(), ...updatedState });
    this.configChanged$.next();
  }

  public configChanged$ = new Subject<void>();

  public orderedSteps = computed<{ [index: number]: Step }>(() => {
    return {
      0: { stepDescription: 'FOCUS', duration: this.state().pomodoroLength, backgroundColor: "#ff6b6b", icon: '💪' },
      1: { stepDescription: 'BREAK', duration: this.state().shortBreakLength, backgroundColor: "#6bcb77", icon: '☕' },
      2: { stepDescription: 'LONG-BREAK', duration: this.state().longBreakLength, backgroundColor: "#4d96ff", icon: '💤' }
    }
  })
}
