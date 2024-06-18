import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { ApiServiceService } from '../../../../../common/services/apiService.service';
import { CommonModule } from '@angular/common';
import { Subcategory } from '../../../../../common/models/expenses.model';

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
  deleteCategory(subcategoryId:number): void {
    this.categoryService.deleteSubCategory(subcategoryId).subscribe({
      next:(response:Subcategory)=>{
        this.subcategories=this.subcategories.filter(c=>c.id!==response.id);
      }
    })
    console.log(subcategoryId)
  }

  // updateCategory(category: any): void {
  //   this.categoryService.updateCategory(category.id, category).subscribe(updatedCategory => {
  //     const index = this.subcategories.findIndex(c => c.id === updatedCategory.id);
  //     this.subcategories[index] = updatedCategory;
  //   });
  // }
}
