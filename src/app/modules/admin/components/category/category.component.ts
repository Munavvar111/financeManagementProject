import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import {
  Category,
  Subcategory,
} from '../../../../common/models/expenses.model';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from './add-category/add-category.component';
import { response } from 'express';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    SubCategoryComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
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
    private dailog: MatDialog
  ) {
    this.addCategoryForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      filterText: [''],
    });

    this.getCategory();
    console.log(this.categories)
    this.searchForm.get('filterText').valueChanges.subscribe((value) => {
      this.filterCategories(value);
    });
  }

  getCategory(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
        this.filteredCategories = this.categories;
      },
    });
  }

  filterCategories(searchText: string): void {
    const lowerSearchText = searchText.toLowerCase();
    this.filteredCategories = this.categories
      .map((category) => {
        const matchingSubcategories = category.subcategories.filter(
          (subcategory) =>
            subcategory.name.toLowerCase().includes(lowerSearchText)
        );
        console.log(matchingSubcategories)
        return {
          ...category,
          subcategories: matchingSubcategories,
          isOpen: matchingSubcategories.length > 0,
        };
      })
      .filter((category) => category.subcategories.length > 0);
  }

  openDialog(): void {
    this.dailog
      .open(AddCategoryComponent, {
        width: '300px',
        data: {
          form: this.addCategoryForm,
          isEdit: false,
          categories: this.categories,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.onSubmit();
        }
      });
  }

  onSubmit() {
    if (this.addCategoryForm.valid) {
      this.categoryService
        .addSubCategory(this.addCategoryForm.value)
        .subscribe({
          next: (response: Subcategory) => {
            this.getCategory();
            this.filterCategories('');
          },
        });
    }
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
