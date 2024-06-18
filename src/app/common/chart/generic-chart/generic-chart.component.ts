import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-generic-chart',
  standalone: true,
  imports: [],
  templateUrl: './generic-chart.component.html',
  styleUrl: './generic-chart.component.css'
})
export class GenericChartComponent {
  @Input() chartData!: ChartConfiguration['data'];
  @Input() chartOptions!: ChartConfiguration['options'];
  @Input() chartType!: ChartType;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  private initializeChart(): void {
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: this.chartType,
        data: this.chartData,
        options: this.chartOptions,
      });
    } else {
      console.error('Chart canvas element is not available.');
    }
  }
}
