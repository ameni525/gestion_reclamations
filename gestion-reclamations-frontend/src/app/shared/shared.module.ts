import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoaderComponent } from './components/loader/loader.component';
import { AlertComponent } from './components/alert/alert.component';
import { ModalComponent } from './components/modal/modal.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';


import { HasRoleDirective } from './directives/has-role.directive';


import { DateFormatPipe } from './pipes/date-format.pipe';
import { FilterPipe } from './pipes/filter.pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,


    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    AlertComponent,
    ModalComponent,
    EmptyStateComponent,


    HasRoleDirective,


    DateFormatPipe,
    FilterPipe
  ],
  exports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    AlertComponent,
    ModalComponent,
    EmptyStateComponent,
    HasRoleDirective,
    DateFormatPipe,
    FilterPipe
  ]
})
export class SharedModule { }
