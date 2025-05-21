import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { AsyncPipe } from '@angular/common';
import { Component, inject, viewChild, ViewContainerRef } from '@angular/core';
import { bufferCount, tap } from 'rxjs';
import { ClockComponent } from "./clock/clock.component";
import { SettingsComponent } from './settings/settings.component';
import { ClockStatus, Step } from './shared/types';

@Component({
  selector: 'app-root',
  imports: [ClockComponent, AsyncPipe, DialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: { class: 'focus' }

})
export class AppComponent {
  title = 'pomodoros';

  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(SettingsComponent, {
      minWidth: '300px',
    });

  }

  protected clock = viewChild(ClockComponent);

  public orderedSteps: { [index: number]: Step } = {
    0: { stepDescription: 'focus', duration: 1, backgroundColor: "#ff6b6b" },
    1: { stepDescription: 'break', duration: 1, backgroundColor: "#6bcb77" },
    2: { stepDescription: 'long-break', duration: 1, backgroundColor: "#4d96ff" }
  }

  private longBreakInterval = 2;
  private longBreakCount = 0;

  public currentStepIndex = 0
  private nextStepIndex: number = undefined;

  private vcr = inject(ViewContainerRef);

  ngAfterViewInit() {
    this.clock().statusChanges
      .pipe(
        bufferCount(2, 1)
      )
      .subscribe((c: ClockStatus[]) => {
        console.log('ClockStatus t lsast: ', c);

        const changeToIdleStatus = c[0] !== 'IDLE' && c[1] === 'IDLE';

        if (!changeToIdleStatus) return;

        if (!this.nextStepIndex) {
          this.determineNextStep()
        }

        this.changeStep()
      })
  }

  startClock() {
    this.clock().start();
  }

  stopClock() {
    this.clock().stop();
  }

  protected handleManualModeChange(nextIndex: number) {
    this.longBreakCount = 0;
    this.nextStepIndex = nextIndex;
    this.changeStep();
  }

  protected changeStep() {
    let currentStep = this.orderedSteps[this.currentStepIndex];
    let nextStep = this.orderedSteps[this.nextStepIndex];

    let el: HTMLElement = this.vcr.element.nativeElement
    el.classList.replace(currentStep.stepDescription, nextStep.stepDescription);

    this.clock().reset(this.orderedSteps[this.nextStepIndex].duration);

    this.currentStepIndex = this.nextStepIndex;
    this.nextStepIndex = undefined;
    console.log(this.currentStepIndex);
  }

  protected determineNextStep() {
    /***
       * first interval - longBreakCount = 1 - short - 1
       * second interval - longBreakCount = 2 - short - 0
       * thirt interval - longBreakCount = 3 - LONG - 2
      */
    const currentStep = this.orderedSteps[this.currentStepIndex]

    if (currentStep.stepDescription === 'long-break') {
      this.longBreakCount = 0
      this.nextStepIndex = 0
      return;
    }

    if (currentStep.stepDescription === 'focus') {
      if (this.longBreakInterval >= this.longBreakCount) {
        this.longBreakCount += 1;
        this.nextStepIndex = 1
      }

      else {
        this.nextStepIndex = 2;
      }

      return
    }

    this.nextStepIndex = 0;
  }
}
