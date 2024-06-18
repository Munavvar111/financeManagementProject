import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Category } from '../../../../common/models/expenses.model';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { AddCategoryComponent } from './add-category/add-category.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { GenericChartComponent } from '../../../../common/chart/generic-chart/generic-chart.component';

@Component({
  selector: 'app-category',
    standalone: true,
    imports: [MaterialModule,ReactiveFormsModule,CommonModule,SubCategoryComponent,],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
  categories: any[] = [];
  filteredCategories: any[] = [];
  searchForm: FormGroup;
  addCategoryForm: FormGroup;
  selectedSection: 'Income' | 'Expenses' | null = null;

  constructor(
    private categoryService: ApiServiceService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      filterText: ['']
    });


    this.categoryService.getCategories().subscribe({
      next:(response:Category[])=>{
          this.categories = response;
          this.filteredCategories = this.categories;
          console.log(response)
      }
    });

    

    this.searchForm.get('filterText').valueChanges.subscribe(value => {
      this.filterCategories(value);
    });
  }
 
  filterCategories(searchText: string): void {
    const lowerSearchText = searchText.toLowerCase();
    this.filteredCategories = this.categories.map(category => {
      const matchingSubcategories = category.subcategories.filter(subcategory =>
        subcategory.name.toLowerCase().includes(lowerSearchText)
      );
      return {
        ...category,
        subcategories: matchingSubcategories,
        isOpen: matchingSubcategories.length > 0
      };
    }).filter(category => category.subcategories.length > 0);

    //detect the change manually if the data async or not automatic change by angular then this will used for the change detection manully
    this.cdr.detectChanges();
  }

  // updateCategory(category): void {
  //   this.categoryService.updateCategory(category.id, category).subscribe(updatedCategory => {
  //     const index = this.categories.findIndex(c => c.id === updatedCategory.id);
  //     this.categories[index] = updatedCategory;
  //     this.filteredCategories = this.categories;
  //   });
  // }

  // deleteCategory(categoryId): void {
  //   this.categoryService.deleteCategory(categoryId).subscribe(() => {
  //     this.categories = this.categories.filter(c => c.id !== categoryId);
  //     this.filteredCategories = this.categories;
  //   });
  // }

  selectSection(section: 'Income' | 'Expenses'): void {
    this.selectedSection = section;
  }
}
