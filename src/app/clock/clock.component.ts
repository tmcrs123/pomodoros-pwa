import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, inject, Input, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, EMPTY, finalize, interval, map, of, skip, Subscription, switchMap, takeWhile, tap } from 'rxjs';
import { ConfigService } from '../config.service';
import { SecondsToHoursPipe } from '../seconds-to-hours.pipe';
import { ClockStatus } from '../shared/types';

@Component({
  selector: 'app-clock',
  imports: [FormsModule, AsyncPipe, SecondsToHoursPipe],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent {
  @HostBinding('style.backgroundColor') @Input() bgColor: string = '';


  protected config = inject(ConfigService);
  protected timer = signal(this.config.state().pomodoroLength * 60);
  private audio = new Audio();

  protected running$ = new BehaviorSubject({ isRunning: false, hasBeenReset: false });
  protected statusChanges$ = new BehaviorSubject<ClockStatus>('IDLE')
  public statusChanges = this.statusChanges$.asObservable();

  private tickSubscription: Subscription;

  private clockRunning$ = of(null)
    .pipe(
      tap(() => this.statusChanges$.next("RUNNING")),
      switchMap(() => interval(1000)),
      map(() => this.timer() - 1),
      takeWhile(next => next >= 0),
      tap((next) => {
        this.timer.set(next)
      }),
      finalize(() => {
        console.log('In finalize block');
        this.running$.next({ isRunning: false, hasBeenReset: false })
      })
    )

  private clockStopped = (hasBeenReset: boolean) => EMPTY.pipe(
    finalize(() => {
      if (this.timer() > 0 && !hasBeenReset) this.statusChanges$.next('STOPPED')
      else {
        this.statusChanges$.next("IDLE")
        if (this.timer() == 0) {
          this.audio.play();
        }
      }
    }));

  private tick$ = this.running$.pipe(
    skip(1),
    switchMap(running => running.isRunning ? this.clockRunning$ : this.clockStopped(running.hasBeenReset)))

  public start() {
    this.running$.next({ isRunning: true, hasBeenReset: false });
  }

  public stop() {
    this.running$.next({ isRunning: false, hasBeenReset: false });
  }

  public reset(minutes: number) {
    this.timer.set(minutes * 60)
    this.running$.next({ isRunning: false, hasBeenReset: true });
  }

  ngOnInit() {
    this.audio.src = 'assets/alarm.mp3';
    this.audio.load();
    this.tickSubscription = this.tick$.subscribe();
  }

  ngOnDestroy() {
    this.tickSubscription.unsubscribe();
  }
}
