import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

import { AppState } from 'src/app/store';
import { loadSupportTickets } from 'src/app/pages/customer-support/state/ticket.actions';
import * as TicketSelector from 'src/app/pages/customer-support/state/ticket.selectors';

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.scss'],
})
export class SupportTicketsComponent implements OnInit {
  vm$!: Observable<TicketSelector.TicketsViewModel>;
  faSearch = faSearch;
  faBoxOpen = faBoxOpen;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.vm$ = this.store.pipe(select(TicketSelector.selectTicketsViewModel));
    this.store.dispatch(loadSupportTickets());
  }
}
