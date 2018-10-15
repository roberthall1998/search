import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { NgForm } from '@angular/forms';
import { MyFilterPipe } from '../pipe';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  data: DataService;

  formValue: any;

  evidence: boolean = false;
  response:boolean = false;
  cv:boolean = false;

  count: number;

  constructor(dataService: DataService){
    this.data = dataService;
    this.count = this.data.docs.length;
  }

  ngOnInit() {
    
  }

  onSubmit(form:NgForm){
    this.evidence = false;
    this.response = false;
    this.cv = false;
    this.formValue = form.value.textBox;
    this.data.updateSearch(this.formValue);
    this.updateCount();
  }

  updateCount(){
    var num = 0;

    if(!this.evidence && !this.response && !this.cv && this.data.docs){
      num = this.data.docs.length;
    }

    if(this.evidence){
      let ev = new MyFilterPipe().transform(this.data.docs, '/Evidence Responses/');
      num += ev.length;
    }
    if(this.response){
      let ev = new MyFilterPipe().transform(this.data.docs, '/Previous Responses/');
      num += ev.length;
    }
    if(this.cv){
      let ev = new MyFilterPipe().transform(this.data.docs, '/CVs/');
      num += ev.length;
    }
    this.count = num;
  }

}
