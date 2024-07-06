import { AfterViewInit, Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, UntypedFormGroup, UntypedFormControl, Validator, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { ReplaySubject, Subject, of, timer } from 'rxjs';
import { debounce, debounceTime, take, takeUntil } from 'rxjs/operators';
import { LookupItem } from './lookup-item';

@Component({
  selector: 'app-mat-dynamic-select',
  standalone: true,
  imports: [],
  template: `
   <ng-container [formGroup]="form">
    <mat-form-field fxFlex="auto" [appearance]="appearance" [class]="class">   
        <mat-label class="px-0 py-2" fxLayoutGap="12px" *ngIf="title">{{title}}</mat-label>
        <mat-select [formControlName]="formControlName" matInput [multiple]="!isSingleSelect"
            (selectionChange)="onSelectionChange($event.value)" [disabled]="isDisabled" [matTooltip]="tooltip">
            <mat-option>
                <ngx-mat-select-search [formControl]="filterCtrl" [showToggleAllCheckbox]="showToggleAllCheckbox"
                    (toggleAll)="onToggleAll($event)"
                    [toggleAllCheckboxTooltipMessage]="toggleAllCheckboxTooltipMessage"></ngx-mat-select-search>
            </mat-option>

            <mat-option selected *ngIf="defaultSelected"> {{defaultSelected}} </mat-option>

            <ng-container *ngIf="!isGroup; else groupedList">
                <mat-option *ngFor="let item of filteredList | async" [value]="item.id" [disabled]="item.isDisabled"
                    [matTooltip]="item.toolTip">
                    <span [style.color]="item.colorCode ? item.colorCode : 'inherit'">{{item.name}}</span>
                </mat-option>
            </ng-container>
            <ng-template #groupedList>
                <ng-container *ngFor="let group of filteredList | async">
                    <mat-optgroup [label]="group.name" *ngIf="group.childs.length > 0">
                        <mat-option *ngFor="let item of group.childs" [value]="item.id" 
                        [disabled]="item.isDisabled" [matTooltip]="item.toolTip">
                            {{ item.name }}
                        </mat-option>
                    </mat-optgroup>
                </ng-container>
            </ng-template>
        </mat-select>
    </mat-form-field>
</ng-container>
  `,
  styles: ``
})
export class MatDynamicSelectComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges, ControlValueAccessor {

  @Input() list: LookupItem[] = [];

  @Input() searchProperties: string[] = ['name'];   //[searchProperties]="['name']"
  @Input() title: string | undefined;
  @Input() formControlName: string | undefined;
  //@Input() control: AbstractControl = new FormControl(); //[control]="searchData.get('rfqStatus')"

  @Input() form: UntypedFormGroup | undefined;
  @Input() isGroup: boolean = false;
  @Input() isRemoveRole: boolean = false;
  @Input() defaultSelected: any = null;
  @Input() isSingleSelect: boolean = false;
  @Input() appearance: string = "";
  @Input() class: string = "";
  @Input() isDisabled: boolean = false;
  @Input() showToggleAllCheckbox: boolean = false;
  @Input() toggleAllCheckboxTooltipMessage: string | undefined;
  @Input() tooltip: string = "";
  @Input() isAutoComplete: boolean = false;

  @Output() selectionChanged = new EventEmitter<string>();
  @Output() FilterFromDB = new EventEmitter<any>();
  public filterCtrl: UntypedFormControl = new UntypedFormControl();
  public filteredList: ReplaySubject<LookupItem[]> = new ReplaySubject<LookupItem[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
    this.filterCtrl.valueChanges
      .pipe(debounce(ev => this.isAutoComplete ? timer(2000) : of({})), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterList();
      });

  }
  ngAfterViewInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (this.list !== undefined && this.list != null) {
    //   console.log(this.formControlName, this.list, this.list.slice())
    //   this.filteredList.next(this.list.slice());
    // }

    if (changes['list'] && Array.isArray(changes['list'].currentValue)) {
      //console.log(this.formControlName, this.list, this.list.slice())
      this.filteredList.next(this.copyList(this.list));
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected filterList() {
    if (!this.list) {
      return;
    }

    let search = this.filterCtrl.value;
    const listGroupsCopy = this.copyList(this.list);
    if (!search) {
      if (this.isAutoComplete) {
        if (!this.selected) {
          this.FilterFromDB.emit(null);
        }
      }
      else {
        this.filteredList.next(listGroupsCopy);
      }
      return;
    } else {
      search = search.toLowerCase();
    }

    if (this.isGroup) {
      this.filteredList.next(
        listGroupsCopy.filter((itemGroup:any) => {
          const showGroup = itemGroup.name.toLowerCase().indexOf(search) > -1;
          if (!showGroup) {
            itemGroup.childs = itemGroup.childs.filter((item:any) => item.name.toLowerCase().indexOf(search) > -1);
          }
          return itemGroup.childs.length > 0;
        })
      );
    }
    else {
      this.filteredList.next(
        listGroupsCopy.filter((item:any) => item.name.toLowerCase().indexOf(search) > -1)

      );
    }
    if (this.isAutoComplete) {
      this.FilterFromDB.emit(search);
    }
  }

  protected copyList(listGroups: LookupItem[]) {
    const listGroupsCopy:any = [];
    if (!this.isRemoveRole) {
      listGroups.forEach(item => {
        listGroupsCopy.push({
          id: item.id,
          name: item.name,
          code: item.code,
          childs: item.childs ? item.childs.slice() : null,
          colorCode: item.colorCode
        });
      });
    }
    else
    {
      listGroups.forEach(item => {
        if (item.childs) {
          item.childs.forEach((childitem:any) => {
            listGroupsCopy.push({
              id: childitem.id,
              name: childitem.name,
              code: childitem.code,
              colorCode: childitem.colorCode
            });
          });
        }
      });
    }
    return listGroupsCopy;
  }

  public onTouched: () => void = () => { };

  writeValue(val: any): void {
    //val && this.form.setValue(val, { emitEvent: false });
  }
  registerOnChange(fn: any): void {
    // console.log("on change");
    // this.form.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    // console.log("on blur");
    // this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    //isDisabled ? this.form.disable() : this.form.enable();
  }

  public selected: any = null;
  onSelectionChange(value: string) {
    this.selected = value;
    this.selectionChanged.emit(value);
  }

  onToggleAll(selectAllValue: boolean) {
    this.filteredList.pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(val => {
        if (this.formControlName) {
          if (selectAllValue) {
            this.form?.get(this.formControlName)?.patchValue([...val.map((x) => x.id), 0]);
          } else {
            this.form?.get(this.formControlName)?.patchValue([]);
          }
        }
      });
  }
}

