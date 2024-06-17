import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { ApiServiceService } from '../../../../../common/services/apiService.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  templateUrl: './sub-category.component.html',
  styleUrl: './sub-category.component.css'
})
export class SubCategoryComponent {
  @Input() subcategories: any[];

  constructor(private categoryService: ApiServiceService) { }
  deleteCategory(categoryId: number,subcategoryId:number): void {
    console.log(categoryId)
    this.categoryService.deleteSubCategory(categoryId,subcategoryId).subscribe(() => {
      this.subcategories = this.subcategories.filter(c => c.id !== categoryId);
      console.log(this.subcategories)
    });
  }

  updateCategory(category: any): void {
    this.categoryService.updateCategory(category.id, category).subscribe(updatedCategory => {
      const index = this.subcategories.findIndex(c => c.id === updatedCategory.id);
      this.subcategories[index] = updatedCategory;
    });
  }
}
