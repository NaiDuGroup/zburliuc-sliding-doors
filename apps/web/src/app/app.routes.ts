import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./features/catalog/catalog.component').then(
        (m) => m.CatalogComponent,
      ),
  },
  {
    path: 'catalog/:slug',
    loadComponent: () =>
      import('./features/catalog/portfolio-detail.component').then(
        (m) => m.PortfolioDetailComponent,
      ),
  },
  {
    path: 'configurator',
    loadComponent: () =>
      import('./features/configurator/configurator.component').then(
        (m) => m.ConfiguratorComponent,
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./features/faq/faq.component').then((m) => m.FaqComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login.component').then(
        (m) => m.AdminLoginComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then(
        (m) => m.AdminShellComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'quotes',
        pathMatch: 'full',
      },
      {
        path: 'quotes',
        loadComponent: () =>
          import('./features/admin/quotes/admin-quotes.component').then(
            (m) => m.AdminQuotesComponent,
          ),
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./features/admin/materials/admin-materials.component').then(
            (m) => m.AdminMaterialsComponent,
          ),
      },
      {
        path: 'portfolio',
        loadComponent: () =>
          import('./features/admin/portfolio/admin-portfolio.component').then(
            (m) => m.AdminPortfolioComponent,
          ),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./features/admin/pricing/admin-pricing.component').then(
            (m) => m.AdminPricingComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
