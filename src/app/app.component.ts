import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ClockComponent } from "./clock/clock.component";
import { ConfigService } from './config.service';
import { SettingsComponent } from './settings/settings.component';
import { ClockStatus } from './shared/types';

@Component({
  selector: 'app-root',
  imports: [ClockComponent, AsyncPipe, DialogModule, TitleCasePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: { class: 'focus' }

})
export class AppComponent {
  protected config = inject(ConfigService);
  protected clock = viewChild(ClockComponent);
  protected bgColor = signal(this.config.orderedSteps()[0].backgroundColor);
  private dialog = inject(Dialog);
  protected stepIndex: number = 0;
  private longBreakCount = 0;

  ngOnInit() {
    this.config.configChanged$.subscribe(() => this.triggerManualModeChange(0));
  }

  public startClock() {
    this.clock().start();
  }

  public stopClock() {
    this.clock().stop();
  }

  protected ngAfterViewInit() {
    this.clock().statusChanges
      .subscribe((c: ClockStatus) => {
        const mustChangeStep = c === 'STOPPED' && this.clock().timer() === 0;

        if (!mustChangeStep) return;

        this.determineNextStep()
        this.updateUiToNextStep();
        this.clock().reset(this.config.orderedSteps()[this.stepIndex].duration);
      })
  }

  protected triggerManualModeChange(nextIndex: number) {
    this.longBreakCount = 0;
    this.stepIndex = nextIndex;
    this.updateUiToNextStep();
    this.clock().reset(this.config.orderedSteps()[nextIndex].duration);
  }

  protected openDialog() {
    this.dialog.open(SettingsComponent);
  }

  private updateUiToNextStep() {
    let nextStep = this.config.orderedSteps()[this.stepIndex];
    this.bgColor.set(nextStep.backgroundColor)
  }

  private determineNextStep(): void {
    const currentStep = this.config.orderedSteps()[this.stepIndex];
    const isLongBreak = currentStep.stepDescription === 'LONG-BREAK';
    const isFocus = currentStep.stepDescription === 'FOCUS';

    if (isLongBreak) {
      this.longBreakCount = 0;
      this.stepIndex = 0;
      return;
    }

    if (isFocus) {
      const needsShortBreak = this.longBreakCount < this.config.state().loopsBeforeLongBreak;

      if (needsShortBreak) {
        this.longBreakCount++;
        this.stepIndex = 1; // Short break
      } else {
        this.stepIndex = 2; // Long break
      }

      return;
    }

    // Default to focus
    this.stepIndex = 0;
  }
}
