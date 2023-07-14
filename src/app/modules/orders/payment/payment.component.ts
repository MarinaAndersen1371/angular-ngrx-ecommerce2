import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  constructor() {}
  @Input() method!: string;
  @Input() account!: string;
  @Input() isPaid!: boolean;
  @Input() invoiceSent!: boolean;
  @Input() paidAt!: string;
  @Input() invoiceAt!: string;

  ngOnInit(): void {}
}
