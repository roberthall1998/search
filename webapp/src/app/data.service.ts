import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Document } from './document.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Properties
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //List of documents to be displayed on the page
  docs: Document[] = [];
  //Boolean to identify if page has loaded and array is still empty
  empty:boolean = false;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Constructor
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(private http: HttpClient) {
    this.updateSearch(undefined);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  Methods
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Called on each search request to call the solr API and return the relevant results
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  updateSearch(keyword: string){
    var localKeyword = keyword;
    
    //if there are no params select all
    if(!localKeyword){
      localKeyword = '*:*';
    }

    //parse the query into an array of queries
    var queries = this.parseQuery(keyword);

    //empty doc array
    this.docs = [];
    //indicate loading has started
    this.empty = false;
    //send API request with new keyword
    const url = 'http://thesearch.kainos.com:8984/solr/search/select?q=' + localKeyword.replace(' ','%20');

    //parse response and push each into docs array
    this.http.get(url + "&rows=10000").subscribe((data: any) => {
      for(let doc of data.response.docs){
        var id = this.parseID(doc.id);
        var content = this.parseContent(doc.content, queries);
        if(content.length>0){
          this.docs.push(new Document(id, doc.title, content));
        }
      }

      //indicate loading has finished
      if(this.docs.length == 0){
        this.empty = true;
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // To convert the id to a sharepoint url
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  public parseID(id: string){
    var start = id.indexOf('/docs/');
    var path = 'https://kainossoftwareltd.sharepoint.com/sites/presales/gov/Collateral1'+id.substring(start+5,id.length);
    return path;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // To convert the content into a list of highlighted search results
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public parseContent(content: string, queries: string[]){
    //Remove all \n and \t from the content
    var contentString = JSON.stringify(content).replace(/\\t./g, '').replace(/\\n/g, '');
    //Remove the square brackets and speech marks at the start and end of the content
    var betterContentString = contentString.replace('[" ','').replace('"]','');

    if(!queries){
      //if no query just display the first 2000 chars
      return [betterContentString.substring(0,2000)];
    }else{
      var highlighted:string[] = [];
      var sentences = this.paragraphToSentences(content, queries);
      //for every sentence, store it locally then run it through highlighting with each query, then push
      for(let s of sentences){
        var plain = s;
        for(let q of queries){
          plain = this.highlight(plain,q);
        }
        highlighted.push(plain);
      }
      
      return highlighted;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // To convert the content into a list of highlighted search results
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public paragraphToSentences(paragraph: string, queries: string[]){
    //empty list to store results
    var results: string[] = [];
    
    var sentences = paragraph.toString().split('.');

    var count = 0;

    //For each sentence check query up to max 5
    for(let sentence of sentences){
      for(let q of queries){
        if(this.contains(sentence,q)){
          results.push(sentence.substring(0,1000));
          count++;
          if(count == 5){
            return results;
          }
        }
      }
    }
    //return array
    return results;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // True if string contains query, false if not
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Add bold (<b>test</b>) tags around the keyword
  public highlight(content: string, query: string) {
    return content.toString().replace(new RegExp(query, "gi"), match => {
        return '<b>' + match + '</b>';
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // True if string contains query, false if not
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public contains(sentence: string, query: string){
    if(sentence.toLowerCase().indexOf(query.toLowerCase())>-1){
      return true;
    }else{
      return false;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // To convert the content into a list of highlighted search results
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public parseQuery(query: string){
    if(!query){
      return undefined;
    }
    //empty list to store queries
    var queries: string[] = [];
    //if query has quotes just store full phrase as query
    if(query.charAt(0) == '"' && query.charAt(query.length-1) == '"'){
      queries.push(query.replace (/"/g,''));
    //otherwise split the query up
    }else{
      queries = query.split(' ');
    }

    return queries;
  }
}
