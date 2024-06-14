import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:"",
    loadChildren: () => import('./modules/layout/layout.route').then((m) => m.layoutRoutes)}
];
