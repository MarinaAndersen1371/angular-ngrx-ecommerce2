import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  faSearch,
  faTimes,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';

import { AppState } from 'src/app/store';
import { loadManagerOrders } from 'src/app/modules/orders/state/order.actions';
import * as OrderSelector from 'src/app/modules/orders/state/order.selectors';

@Component({
  selector: 'app-manager-invoices',
  templateUrl: './manager-invoices.component.html',
  styleUrls: ['./manager-invoices.component.scss'],
})
export class ManagerInvoicesComponent implements OnInit {
  vm$!: Observable<OrderSelector.OrdersViewModel>;
  faSearch = faSearch;
  faTimes = faTimes;
  faBoxOpen = faBoxOpen;
  page = 1;
  pageSize = 5;
  collectionSize!: number;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.vm$ = this.store.pipe(select(OrderSelector.selectOrdersViewModel));
    this.store.dispatch(loadManagerOrders());
  }
}
