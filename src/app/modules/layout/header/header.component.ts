import { Component } from '@angular/core';
import { MaterialModule } from '../../../common/matrial/matrial.module';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule,RouterOutlet,HttpClientModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
