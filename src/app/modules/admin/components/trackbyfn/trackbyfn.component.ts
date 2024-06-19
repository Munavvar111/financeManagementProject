import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-trackbyfn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trackbyfn.component.html',
  styleUrl: './trackbyfn.component.css'
})
export class TrackbyfnComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' }
  ];
  items1 = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' }
  ];

  shuffleItemswithout() {
    this.items.sort(() => Math.random() - 0.5);
  }
  shuffleItems() {
    this.items1.sort(() => Math.random() - 0.5);
  }
  trackById(index: number, item: any): number {
    return item.id;
  }
}
