import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { AppState } from 'src/app/store';
import { loadAdminOrder } from 'src/app/modules/orders/state/order.actions';
import * as fromOrderSelectors from 'src/app/modules/orders/state/order.selectors';

@Component({
  selector: 'app-admin-device',
  templateUrl: './admin-device.component.html',
  styleUrls: ['./admin-device.component.scss'],
})
export class AdminDeviceComponent implements OnInit {
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
      this.store.dispatch(loadAdminOrder({ _id: this.orderId }));
    }
  }
}
