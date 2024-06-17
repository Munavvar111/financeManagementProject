import { Component } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Category } from '../../../../common/models/expenses.model';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from './add-category/add-category.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { response } from 'express';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,CommonModule,SubCategoryComponent],
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
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      filterText: ['']
    });

    this.addCategoryForm = this.fb.group({
      name: ['']
    });

    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
      this.filteredCategories = this.categories;
    });

    

    this.searchForm.get('filterText').valueChanges.subscribe(value => {
      this.filterCategories(value);
    });
  }

  filterCategories(searchText: string): void {
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  addCategory(): void {
    if (this.addCategoryForm.valid && this.selectedSection) {
      const newCategory = { ...this.addCategoryForm.value, section: this.selectedSection };
      this.categoryService.addCategory(newCategory).subscribe(addedCategory => {
        this.categories.push(addedCategory);
        this.filteredCategories = this.categories;
        this.addCategoryForm.reset();
      });
    }
  }

  updateCategory(category): void {
    this.categoryService.updateCategory(category.id, category).subscribe(updatedCategory => {
      const index = this.categories.findIndex(c => c.id === updatedCategory.id);
      this.categories[index] = updatedCategory;
      this.filteredCategories = this.categories;
    });
  }

  deleteCategory(categoryId): void {
    this.categoryService.deleteCategory(categoryId).subscribe(() => {
      this.categories = this.categories.filter(c => c.id !== categoryId);
      this.filteredCategories = this.categories;
    });
  }

  selectSection(section: 'Income' | 'Expenses'): void {
    this.selectedSection = section;
  }
}
