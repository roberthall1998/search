import { Component } from '@angular/core';
import {DataService} from './data.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Kainos Search';
  public docs;

  constructor(private _dataService: DataService){}
  
  ngOnInit() {
  }
}
