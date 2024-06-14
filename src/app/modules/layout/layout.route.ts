import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
    {
        path:'',
        component:LayoutComponent,
        children:[
            {
                path:'',
                redirectTo:'home',
                pathMatch:'full'
            },
            {
                path:'home',
                loadComponent:()=>import('../admin/components/dashboard/dashboard.component').then((m)=>m.DashboardComponent)
            },
            {
                path:'addExpenses',
                loadComponent:()=>import('../admin/components/addExpenses/addExpenses.component').then((m)=>m.AddExpensesComponent)
            },
            {
                path:'transactions',
                loadComponent:()=>import('../admin/components/transection/transection.component').then((m)=>m.TransectionComponent)
            }
            
        ]
    }
]