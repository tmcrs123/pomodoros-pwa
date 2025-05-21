import { Injectable, signal } from '@angular/core';
import { AppState } from './shared/types';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public state = signal<AppState>({ longBreakLength: 15, loopsBeforeLongBreak: 2, pomodoroLength: 60, shortBreakLength: 5 })

  public setState(updatedState: Partial<Record<keyof AppState, number>>) {
    this.state.set({ ...this.state(), ...updatedState });
  }
}
