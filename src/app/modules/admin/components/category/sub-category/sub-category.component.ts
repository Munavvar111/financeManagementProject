import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';
import { ApiServiceService } from '../../../../../common/services/apiService.service';
import { CommonModule } from '@angular/common';
import { Category, Subcategory } from '../../../../../common/models/expenses.model';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  templateUrl: './sub-category.component.html',
  styleUrl: './sub-category.component.css'
})
export class SubCategoryComponent {
  @Input() subcategories: any[];
  editForm:FormGroup;
  categoryList:Category[];
  constructor(private categoryService: ApiServiceService,private dailog:MatDialog,private fb:FormBuilder) { 

    this.editForm=this.fb.group({
      name:["",Validators.required],
      categoryId:["",Validators.required]
    })
    this.getCategory()
  }
  deleteCategory(subcategoryId:number): void {
    Swal.fire({
      position: 'top',
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think'
    }).then((result) => {
      if (result.value) {
        Swal.fire(
          'Removed!',
          'Item removed successfully.',
          'success'
        )
        this.categoryService.deleteSubCategory(subcategoryId).subscribe({
          next:(response:Subcategory)=>{
            this.subcategories=this.subcategories.filter(c=>c.id!==response.id);
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Item is safe.)',
          'error'
        )
      }
    })
   
  }

  getCategory(){
    this.categoryService.getCategories().subscribe({
      next:(response:Category[])=>{
        this.categoryList=response
      }
    })
  }
  updateCategory(subcategoryId:string):void{
    const subcategoryById=this.subcategories.find(item=>item.id==subcategoryId);
    this.editForm.setValue({
      name:subcategoryById.name,
      categoryId:subcategoryById.categoryId
    })
    this.dailog.open(AddCategoryComponent,{
      width:'300px',
      data:{
        form:this.editForm,
        isEdit:true,
        categories:this.categoryList
      }
    }).afterClosed().subscribe(result=>{
      if(result){

      }
    })
  }
  
  // updateCategory(category: any): void {
  //   this.categoryService.updateCategory(category.id, category).subscribe(updatedCategory => {
  //     const index = this.subcategories.findIndex(c => c.id === updatedCategory.id);
  //     this.subcategories[index] = updatedCategory;
  //   });
  // }
}
