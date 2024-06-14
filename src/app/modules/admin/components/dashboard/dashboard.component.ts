import { Component } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ApiServiceService } from '../../../../common/services/apiService.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  chartOptions = {
	  animationEnabled: true,
	  // theme: "dark2",
	  exportEnabled: true,
	  title: {
		  text: "Developer Work Week"
	  },
	  subtitles: [{
		  text: "Median hours/week"
	  }],
	  data: [{
		  type: "pie", //change type to column, line, area, doughnut, etc
		  indexLabel: "{name}: {y}%",
		  dataPoints: []
	  }]
	}
  constructor(private apiService: ApiServiceService) { }
  ngOnInit(): void {
    this.apiService.getExpenses().subscribe((data: any[]) => {
      const transformedData = this.transformDataForChart(data);
      this.chartOptions.data[0].dataPoints = transformedData;
    });
  }
  transformDataForChart(data: any[]): any[] {
    // Transform your data to the format expected by CanvasJS
    // Assuming the fetched data is an array of objects like:
    // { id: number, date: string, type: string, category: string, amount: string, comment: string }
    // Transform the data according to your requirements
    return data.map(item => {
      return {
        name: item.category,
        y: parseFloat(item.amount)
      };
    });
  }
}
