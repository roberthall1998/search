export class Document {
    id: string;
    title: string;
    content: string[];

    constructor(id: string, title: string, content: string[]){
        this.id = id;
        
        if(!title){
            this.title = id.substr(id.lastIndexOf('/')+1,id.length-1);
        }else{
            this.title = title;
        }
        this.content = content;
    }
}