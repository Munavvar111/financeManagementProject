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
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    SubCategoryComponent,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  categories: Category[] = [];
  subcategories:Subcategory[];
  displayedSubcategories: any[] = [];
  searchForm: FormGroup;
  addCategoryForm: FormGroup;
  editForm: FormGroup;
  selectedSection: 'Income' | 'Expenses' | null = null;
  dataIsLoad: boolean = false;
  displayedColumns: string[] = ['id', 'categoryName', 'subcategoryName', 'actions'];
  showLinebar = false;
  isLoading:boolean;
  constructor(
    private categoryService: ApiServiceService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router:Router
    
  ) {
    this.addCategoryForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
    });
    this.editForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      filterText: [''],
    });
    this.getSubCategory();
    this.getCategory();
    this.searchForm.get('filterText').valueChanges.subscribe((value) => {
      this.filterCategories(value);
    });
    setTimeout(() => {
      this.dataIsLoad = true;
    }, 3000);
  }

  getSubCategory():void{
    this.categoryService.getSubCategories().subscribe({
      next:(response:Subcategory[])=>{
        console.log(response)
        this.subcategories=response;
      },
      error:err=>{
        this.snackbar.open("SomeThing Went Wrong","Close",{duration:3000});
        this.router.navigate(['/home'])
      }
    })
  }
  getCategory(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
        this.filterCategories('');
      },
    });
  }

  filterCategories(searchText: string): void {
    const lowerSearchText = searchText.toLowerCase();
    this.displayedSubcategories = this.categories
      .reduce((acc, category) => {
        const matchingSubcategories = category.subcategories.filter(subcategory =>
          subcategory.name.toLowerCase().includes(lowerSearchText)
        );
        if (matchingSubcategories.length > 0 || category.name.toLowerCase().includes(lowerSearchText)) {
          matchingSubcategories.forEach(subcategory => {
            acc.push({
              id: subcategory.id,
              categoryName: category.name,
              subcategoryName: subcategory.name,
            });
          });
        }
        this.isLoading=false;
        return acc;
      }, []);
  }

  openDialog(): void {
    this.dialog
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
        this.isLoading=true;
        if (result) {
          this.onSubmit();
        }
      });
  }

  onSubmit() {
    if (this.addCategoryForm.valid) {
      this.categoryService.addSubCategory(this.addCategoryForm.value).subscribe({
        next: (response: Subcategory) => {
          this.getCategory();
          this.filterCategories('');
          this.getSubCategory();
        },
        error: (err) => {
        this.isLoading=false;
          this.snackbar.open('Error While Submitting The Category', 'Close', { duration: 3000 });
        },
      });
    }
  }

  updateCategory(subcategoryId: string): void {
    console.log(this.subcategories)
    console.log(subcategoryId)
    const subcategoryById = this.subcategories.find(
      (item) => item.id == subcategoryId
    );
    this.editForm.setValue({
      id: subcategoryById.id,
      name: subcategoryById.name,
      categoryId: subcategoryById.categoryId,
    });
    this.dialog
      .open(AddCategoryComponent, {
        width: '300px',
        data: {
          form: this.editForm,
          isEdit: true,
          categories: this.categories,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        this.isLoading=true;
        if (result) {
          this.onEditSubmit();
        }
      });
  }
  onEditSubmit() {
    if (this.editForm.valid) {
      this.categoryService.updateSubCategory(this.editForm.value).subscribe({
        next: (response: Subcategory) => {
         this.getCategory()
         this.filterCategories("")
        },
        error:err=>{
        this.isLoading=false;
          this.snackbar.open("Error While The Updateing The Data","Close",{duration:3000})
        }
      });
    }
  }

  deleteSubcategory(subcategoryId:number): void {

    Swal.fire({
      position: 'top',
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think',
    }).then((result) => {
      if (result.value) {
        Swal.fire('Removed!', 'Item removed successfully.', 'success');
        this.categoryService.deleteSubCategory(subcategoryId).subscribe({
          next: (response: Subcategory) => {
            this.getCategory()
         this.filterCategories("")
            
          },
          error:err=>{
            
            this.snackbar.open("error while removing the category","Close",{duration:3000})
          }
          
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Item is safe.)', 'error');
      }
    });  }

  selectSection(section: 'Income' | 'Expenses'): void {
    this.selectedSection = section;
  }
}
