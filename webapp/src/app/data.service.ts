import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Document } from './document.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //List of documents to be displayed on the page
  docs: Document[] = [];

  constructor(private http: HttpClient) {
    this.updateSearch(undefined);
  }

  //Called on each search request
  updateSearch(keyword: string){
    var localKeyword = keyword;
    
    //if there are no params select all
    if(!localKeyword){
      localKeyword = '*:*';
    }

    //empty doc array
    this.docs = [];
    //send API request with new keyword
    const url = 'http://0.0.0.0:8984/solr/search/select?q=' + localKeyword;

    //parse response and push each into docs array
    this.http.get(url + "&rows=10000").subscribe((data: any) => {
      for(let doc of data.response.docs){
        this.docs.push(new Document(doc.id, doc.title, this.parseContent(doc.content, keyword)));
      }
    });
  }


  //Convert the content JSON object to a string and highlight the keyword
  public parseContent(content: string, query: string){
    //Remove all \n and \t from the content
    var contentString = JSON.stringify(content).replace(/\\t./g, '').replace(/\\n/g, '');
    //Remove the square brackets and speech marks at the start and end of the content
    var betterContentString = contentString.replace('[" ','').replace('"]','');
    //generate a list of search results.
    var results: string[] = [];
    if(!query){
      //if no query just display the first 2000 chars
      results = [betterContentString.substring(0,2000)];
    }else{
      //display the first 5 sentences to contain the query
      results = this.searchResults(betterContentString, query);
    }
    //highlight results
    var list: string[] = [];
    for(let i=0; i<results.length; i++){
      list[i] = this.highlight(results[i],query);
    }
    
    return list;
  }

  public searchResults(content: string, query: string){
    var sentences: string[] = [];

    //Split the paragraph at each full stop
    var split = content.split('.');

    //If the sentence contains the keyword add to array
    for(let i=0; i<split.length; i++){
      var localQuery = query.replace (/"/g,'');
      if(this.contains(split[i], localQuery)){
        sentences.push(split[i]);
      }
    }

    //return array
    return sentences.slice(0,5);
  }

  //True if word in sentence, false if not
  public contains(sentence: string, query: string){
    if(sentence.toLowerCase().search(query.toLowerCase())>-1){
      return true;
    }
    return false;
  }

  //Add bold (<b>test</b>) tags around the keyword
  public highlight(content: string, query: string) {
    if(!query) {
        return content;
    }
    var parsedQuery = query.replace(/"/g,"").replace(' ', '\\s');
    return content.replace(new RegExp(parsedQuery, "gi"), match => {
        return '<b>' + match + '</b>';
    });
    
  }
}
