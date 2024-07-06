import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDynamicSelectComponent } from './mat-dynamic-select.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptgroup, MatOption, MatRippleModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  imports: [MatSelectModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatOptgroup,
    MatOption],
  declarations: [],
  exports: []
})
export class MatDynamicSelectModule {}