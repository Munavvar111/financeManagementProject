// transection.component.ts
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Expense, Incomes } from '../../../../common/models/expenses.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-transection',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './transection.component.html',
  styleUrls: ['./transection.component.css'],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class TransectionComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'date', 'type', 'category', 'amount', 'comment'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  selected = 'option2';
filterForm = new FormGroup({
    fromDate: new FormControl(),
    toDate: new FormControl(),
});
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: any;
  @ViewChild('content') content!: ElementRef;

  constructor(private apiService: ApiServiceService,private cdr:ChangeDetectorRef) { }

  ngOnInit() {
    this.fetchData();
    this.range.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyFilter();
  }
  exportAsPDF() {

    const doc = new jspdf.jsPDF();
    const content = this.content.nativeElement;

    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 297; 
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save('transactions.pdf');
    });
  }
  exportAsExcel(): void {
    // Filtered data to export
    const filteredData = this.dataSource.filteredData;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Save to file
    XLSX.writeFile(wb, 'transactions.xlsx');
  }
  fetchData() {
    this.apiService.getExpenses().subscribe({
      next: (expenses: Expense[]) => {
        this.apiService.getIncomeDetails().subscribe({
          next: (income: Incomes[]) => {
            const combinedData = [
              ...expenses.map(expense => ({ ...expense, type: 'Expense' })),
              ...income.map(incomeItem => ({
                id: incomeItem.id,
                date: incomeItem.date,
                type: 'Income',
                category: incomeItem.accountType,
                amount: incomeItem.amount,
                comment: 'Add Money'
              }))
            ];
            this.dataSource.data = combinedData;
            this.applyFilter();
          },
          error: err => {
            console.error(err);
          }
        });
      },
      error: err => {
        console.error(err);
      }
    });
  }
  applyFilter() {
    const filterValue = this.input ? this.input.nativeElement.value.trim().toLowerCase() : '';
    const { start, end } = this.range.value;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const combinedFilter = filterValue || ' ';
    console.log(combinedFilter)
    this.dataSource.filterPredicate = (data, combinedFilter) => {
      const date = new Date(data.date); 
      console.log(data)
      console.log(combinedFilter)
      const isAfterStart = !startDate || date >= startDate;
      const isBeforeEnd = !endDate || date <= endDate;

      const matchesDateRange = isAfterStart && isBeforeEnd;
      const matchesFilterValue = Object.keys(data).some(key => data[key].toString().toLowerCase().includes(combinedFilter.trim()));
      return matchesDateRange && matchesFilterValue;
    };

    console.log(filterValue)
    this.dataSource.filter = combinedFilter;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearDateRange() {
    this.range.reset()
    this.applyFilter(); 
  }
}
