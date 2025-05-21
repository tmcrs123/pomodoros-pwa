import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigService } from '../config.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule,],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private config = inject(ConfigService);

  readonly dialogRef = inject(DialogRef<SettingsComponent>);
  protected close = output()


  protected settingsForm = this.fb.group({
    pomodoroLength: [this.config.state().pomodoroLength, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
    shortBreakLength: [this.config.state().shortBreakLength, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
    longBreakLength: [this.config.state().longBreakLength, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
    loopsBeforeLongBreak: [this.config.state().loopsBeforeLongBreak, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
  })

  protected save() {
    this.config.setState(this.settingsForm.getRawValue());
    this.dialogRef.close();
  }
}
