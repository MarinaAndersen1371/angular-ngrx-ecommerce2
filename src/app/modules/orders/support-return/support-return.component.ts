import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { AppState } from 'src/app/store';
import * as fromOrderSelectors from 'src/app/modules/orders/state/order.selectors';
import { loadSupportOrder } from 'src/app/modules/orders/state/order.actions';

@Component({
  selector: 'app-support-return',
  templateUrl: './support-return.component.html',
  styleUrls: ['./support-return.component.scss'],
})
export class SupportReturnComponent implements OnInit {
  vm$!: Observable<fromOrderSelectors.OrderViewModel>;
  faArrowRight = faArrowRight;
  orderId!: string | null;

  constructor(private store: Store<AppState>, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');

    if (this.orderId) {
      this.vm$ = this.store.pipe(
        select(fromOrderSelectors.selectOrderViewModel)
      );
      this.store.dispatch(loadSupportOrder({ _id: this.orderId }));
    }
  }
}
