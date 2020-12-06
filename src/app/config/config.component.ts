import { Component, OnInit } from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

export interface Config {
  xAxis: number;
  yAxis: number;
  x: number;
  y: number;
  orientation: number;
  instruction: string;
}

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less']
})
export class ConfigComponent implements OnInit {

  form: FormGroup;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      xAxis: [null, [Validators.required]],
      yAxis: [null, [Validators.required]],
      x: [null, [Validators.required]],
      y: [null, [Validators.required]],
      orientation: [null, [Validators.required]],
      instruction: [null, [Validators.required]],
    });
  }

  submit(): void {
    // tslint:disable-next-line:forin
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.invalid) {
      return;
    }
    this.destroyModal(this.form.value);
  }


  destroyModal(config?: Config): void {
    this.modal.destroy(config);
  }

}
