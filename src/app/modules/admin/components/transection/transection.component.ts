import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Expense } from '../../../../common/models/expenses.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}
const FRUITS: string[] = [
  'blueberry',
  'lychee',
  'kiwi',
  'mango',
  'peach',
  'lime',
  'pomegranate',
  'pineapple',
];
const NAMES: string[] = [
  'Maia',
  'Asher',
  'Olivia',
  'Atticus',
  'Amelia',
  'Jack',
  'Charlotte',
  'Theodore',
  'Isla',
  'Oliver',
  'Isabella',
  'Jasper',
  'Cora',
  'Levi',
  'Violet',
  'Arthur',
  'Mia',
  'Thomas',
  'Elizabeth',
];
@Component({
  selector: 'app-transection',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './transection.component.html',
  styleUrl: './transection.component.css'
})
export class TransectionComponent implements OnInit  {

  displayedColumns: string[] = ['id', 'date', 'type', 'category',"amount","comment"];
  dataSource: MatTableDataSource<Expense> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private apiService:ApiServiceService) {
  }
  ngOnInit() {
    this.apiService.getExpenses().subscribe({
      next:(data:Expense[])=>{
        this.dataSource.data=data
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
