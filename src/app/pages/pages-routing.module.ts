import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from 'src/app/pages/home/home.component';
import { NotFoundComponent } from 'src/app/pages/not-found/not-found.component';
import { InfoEnglishComponent } from 'src/app/pages/info/info-english/info-english.component';
import { InfoGermanComponent } from 'src/app/pages/info/info-german/info-german.component';
import { InfoSpanishComponent } from 'src/app/pages/info/info-spanish/info-spanish.component';
import { InfoRussianComponent } from 'src/app/pages/info/info-russian/info-russian.component';
import { CustomerSupportComponent } from 'src/app/pages/customer-support/customer-support.component';
import { AdminGuard } from 'src/app/modules/auth/resources/admin.guard';
import { ManagerGuard } from 'src/app/modules/auth/resources/manager.guard';
import { SupportGuard } from 'src/app/modules/auth/resources/support.guard';
import { TicketsComponent } from 'src/app/pages/customer-support/tickets.component';
import { TicketComponent } from 'src/app/pages/customer-support/ticket/ticket.component';
import { ManagerTicketsComponent } from 'src/app/pages/customer-support/manager-tickets/manager-tickets.component';
import { ManagerTicketComponent } from 'src/app/pages/customer-support/manager-ticket/manager-ticket.component';
import { SupportTicketsComponent } from 'src/app/pages/customer-support/support-tickets/support-tickets.component';
import { SupportTicketComponent } from 'src/app/pages/customer-support/support-ticket/support-ticket.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'info-english', component: InfoEnglishComponent },
  { path: 'info-german', component: InfoGermanComponent },
  { path: 'info-spanish', component: InfoSpanishComponent },
  { path: 'info-russian', component: InfoRussianComponent },
  { path: 'support', component: CustomerSupportComponent },
  {
    path: 'admin-tickets',
    canActivate: [AdminGuard],
    component: TicketsComponent,
  },
  {
    path: 'manager-tickets',
    canActivate: [ManagerGuard],
    component: ManagerTicketsComponent,
  },
  {
    path: 'support-tickets',
    canActivate: [SupportGuard],
    component: SupportTicketsComponent,
  },
  {
    path: 'ticket/:id',
    canActivate: [AdminGuard],
    component: TicketComponent,
  },
  {
    path: 'manager/ticket/:id',
    canActivate: [ManagerGuard],
    component: ManagerTicketComponent,
  },
  {
    path: 'support/ticket/:id',
    canActivate: [SupportGuard],
    component: SupportTicketComponent,
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'not-found', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
