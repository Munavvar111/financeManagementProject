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
            },
            {
                path:'accounts',
                loadComponent:()=>import('../admin/components/accounts/accounts.component').then((m)=>m.AccountsComponent)
            },
            {
                path:'incomes',
                loadComponent:()=>import('../admin/components/incomes/incomes.component').then((m)=>m.IncomesComponent)
            },
            
        ]
    }
]