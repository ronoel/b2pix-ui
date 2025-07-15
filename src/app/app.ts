import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './components/loading/loading.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent, ToolbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
