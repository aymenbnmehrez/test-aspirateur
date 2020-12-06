import {Component, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartTooltipItem} from 'chart.js';
import { Color, Label } from 'ng2-charts';
import {from, of} from 'rxjs';
import {concatMap, delay} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Config, ConfigComponent} from './config/config.component';
import {childOfKind} from 'tslint';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
  // data config
  config: Config = {
    xAxis: 10,
    yAxis: 10,
    instruction: null,
    orientation : 0,
    x: 5,
    y: 5
  };
  data: { x: number; y: number }[] = [];
  cardinals: ('N' | 'E' | 'S' | 'W')[] = ['N', 'E', 'S', 'W', 'N'];
  orientation = 0;
  position: { x: number; y: number } = { x: 5, y: 5 };

  // chart config
  lineChartData: ChartDataSets[] = [
    {
      label: '1',
      data: [],
      pointRadius: 15,
      pointHoverRadius: 20,
      pointStyle: 'triangle',
      pointRotation: 0,
      borderColor: 'rgba(255,0,0,0.3)',
      backgroundColor: 'black'
    },
    {
      type: 'line',
      label: '2',
      data: [],
      pointStyle: 'circle',
      fill: false,
      borderColor: 'black',
      cubicInterpolationMode: 'monotone'
    }
  ];
  lineChartLabels: Label[] = [];
  lineChartOptions: ChartOptions = {};
  lineChartColors: Color[] = [];
  lineChartLegend = false;
  lineChartType = 'scatter';
  lineChartPlugins = [];

  constructor(
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.showModal();
  }

  showModal(): void {
    const modal = this.modalService.create({
      nzTitle: 'Config',
      nzContent: ConfigComponent
    });
    modal.afterClose.subscribe((config: Config) => {
      this.config = config;
      this.setConfig(config);
    });

  }

  setConfig(config: Config): void {
    this.lineChartOptions = {
      responsive: true,
      scales: {
        xAxes: [
          {
            id: 'xAxis',
            ticks: {
              min: -config.xAxis,
              max: config.xAxis,
              stepSize: 1,
              callback: (v: any) => (v === 0 ? '' : v)
            },
            gridLines: {
              drawTicks: false
            }
          }
        ],
        yAxes: [
          {
            id: 'yAxis',
            ticks: {
              min: -config.yAxis,
              max: config.yAxis,
              stepSize: 1,
              callback: (v: any) => (v === 0 ? '' : v)
            },
            gridLines: {
              drawTicks: false
            }
          }
        ]
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem: ChartTooltipItem) => {
            let msg =  `x: ${tooltipItem?.xLabel},y: ${tooltipItem?.yLabel}`;
            if (tooltipItem?.datasetIndex === 0) {
              msg = `${msg}, dir: ${this.getDirection(this.orientation)}`;
            }
            return msg;
          }
        }
      }
    };
    this.lineChartPlugins = [
      {
        beforeDraw: (chart: any) => {
          const xAxis = chart.scales.xAxis;
          const yAxis = chart.scales.yAxis;
          const scales = chart.chart.config.options.scales;
          scales.xAxes[0].ticks.padding =
            yAxis.top - yAxis.getPixelForValue(0) + 5;
          scales.yAxes[0].ticks.padding =
            xAxis.getPixelForValue(0) - xAxis.right + 5;
        }
      }
    ];
    this.position = {x: config.x, y: config.y};
    this.orientation = config.orientation;
    this.data = [];
    this.lineChartData[0].data = [];
    this.lineChartData[1].data = [];
    this.start(config.instruction);
  }

  start(cmd: string): void {
    this.data.push(this.position);
    from(cmd.split(''))
      .pipe(
        concatMap(item => of(item).pipe(delay(1000))))
      .subscribe((timedItem: 'A' | 'D' | 'G') => {
        if (timedItem === 'A' || timedItem === 'D'  || timedItem === 'G' ) {
          this.move(timedItem);
          this.lineChartData[0].data = Array.from([this.data.slice(-1).pop()]);
          this.lineChartData[0].pointRotation = this.orientation;
          this.lineChartData[1].data = Array.from(this.data);
        }
      });
  }

  move(key: 'A' | 'D' | 'G'): void {
    switch (key) {
      case 'A':
        const lastElement = this.data[this.data.length - 1];
        const direction = this.getDirection(this.orientation);
        if (direction === 'N') {
          this.data.push({
            x: lastElement.x,
            y: lastElement.y + 1
          });
        } else if (direction === 'E') {
          this.data.push({
            x: lastElement.x + 1,
            y: lastElement.y
          });
        } else if (direction === 'S') {
          this.data.push({
            x: lastElement.x,
            y: lastElement.y - 1
          });
        } else if (direction === 'W') {
          this.data.push({
            x: lastElement.x - 1,
            y: lastElement.y
          });
        }
        break;
      case 'D':
        this.orientation += 90;
        break;
      case 'G':
        this.orientation -= 90;
        break;
    }
  }

  getDirection(angle: number): 'N' | 'E' | 'S' | 'W' {
    return this.cardinals[Math.round(angle % 360) / 90];
  }
}
