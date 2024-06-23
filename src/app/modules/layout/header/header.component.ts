import { Component, HostListener, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../common/matrial/matrial.module';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatSidenav } from '@angular/material/sidenav';
import { ChangeDetectorRef } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule,RouterOutlet,HttpClientModule,RouterLink,FooterComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor( private cdref: ChangeDetectorRef ) {}   

  @ViewChild('drawer') drawer!: MatSidenav;
  isScreenSmall = false;

  @HostListener('window:resize', ['$event'])
onResize(event: any) {
  this.isScreenSmall = event.target.innerWidth < 992;
  this.setSidenavMode();
  setTimeout(() => {
}, 0);

}
ngAfterViewInit() {
  if (typeof window !== "undefined") {
    this.isScreenSmall = window.innerWidth < 992;
    this.cdref.detectChanges();
    setTimeout(() => {
    }, 0);  }
}

setSidenavMode() {
  if (this.drawer) {
    this.drawer.mode = this.isScreenSmall ? 'push' : 'side';
  }
}
} 
