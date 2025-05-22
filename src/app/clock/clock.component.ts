import { Component, HostBinding, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, EMPTY, finalize, interval, map, of, skip, Subscription, switchMap, takeWhile, tap } from 'rxjs';
import { ConfigService } from '../config.service';
import { SecondsToHoursPipe } from '../seconds-to-hours.pipe';
import { ClockStatus } from '../shared/types';

@Component({
  selector: 'app-clock',
  imports: [FormsModule, SecondsToHoursPipe],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent {
  @HostBinding('style.backgroundColor') @Input() bgColor: string = '';
  private audio = new Audio();
  private tickSubscription: Subscription;
  protected config = inject(ConfigService);
  protected running$ = new BehaviorSubject(false);
  protected statusChanges$ = new BehaviorSubject<ClockStatus>('STOPPED')
  public statusChanges = this.statusChanges$.asObservable();
  public timer = signal(this.config.state().pomodoroLength * 60);

  private clockRunning = of(null)
    .pipe(
      tap(() => this.statusChanges$.next("RUNNING")),
      switchMap(() => interval(1000)),
      map(() => this.timer() - 1),
      takeWhile(next => next >= 0),
      tap((next) => {
        this.timer.set(next)
        if (next == 0) {
          this.running$.next(false)
        }
      }),
    )

  private clockStopped = EMPTY.pipe(
    finalize(() => {
      this.statusChanges$.next('STOPPED')
      if (this.timer() == 0) {
        this.audio.play();
      }

    }));

  private tick$ = this.running$.pipe(
    skip(1),
    switchMap(running => running ? this.clockRunning : this.clockStopped))

  ngOnInit() {
    this.audio.src = 'assets/alarm.mp3';
    this.audio.load();
    this.tickSubscription = this.tick$.subscribe();
  }

  ngOnDestroy() {
    this.tickSubscription.unsubscribe();
  }

  public start() {
    this.running$.next(true);
  }

  public stop() {
    this.running$.next(false);
  }

  public reset(minutes: number) {
    this.timer.set(minutes * 60)
    if (this.running$.value) this.stop();
  }
}
