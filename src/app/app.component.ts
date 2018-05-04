import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Title }     from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { ModalDirective } from 'ngx-bootstrap/modal';

class Comment{
  
  text:string;
  
  unsaved:boolean = false;
  
  line:number;
  
  cat:string[];
  catI:number[];
  start:string;
  
  constructor(line:Line){
    this.line = line.i;
    this.cat = line.cat;
    this.catI = line.catI;
  }
  
}

class Line{
  
  comments:Comment[] = [];
  
  open:boolean = false;
  
  constructor(public content:string,public i:number,public catI:number[],public cat:string[]){}
  
  openComments(){this.open = true;}
  closeComments(){this.open = false;}
  
  addComment(comment){
    this.comments.push(comment); 
  }
  
  removeComment(comment){
    this.comments = this.comments.filter(item => item !== comment);
  }
  
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.template.html',
  styleUrls: ['app.style.css']
})
export class AppComponent implements AfterViewInit {
  
  title:string;
  
  document:Line[];
  documentIndex:any = {};
  
  comments:Comment[] = [];
  newComments:Comment[] = [];
  
  currentLine:Line;
  editedComment:Comment;
  
  maxAlpha:number = 1;
  
  @ViewChild('document') documentEl: ElementRef;
    
  @ViewChild('commentModal') commentModal: ModalDirective;
  
  constructor(private http:HttpClient, private titleService: Title){
    
  }
  
  ngOnInit(){
    this.loadConfig();
  }
  
  ngAfterViewInit(){
    this.loadDocument()
      .then(document => {
        this.parseDocument(document);
        this.loadComments();
        
      });
  }
  
  loadConfig(){
    return this.http.get<any>("/data/config").toPromise()
      .then(config => {
        this.titleService.setTitle(config.title); 
        this.title = config.title;
      });
  }
  
  loadDocument(){
    return this.http.get("/data/document", {responseType: 'text'}).toPromise();
  }
  
  loadComments(){
    this.newComments = this.getTemp();
    this.comments = this.getSaved();
    
    this.parseComments();
  }
  
  parseComments(){
    this.document.forEach(line => line.comments = []);
    this.comments.forEach(comment => this.documentIndex[comment.line].addComment(comment));
    this.newComments.forEach(comment => this.documentIndex[comment.line].addComment(comment));   
    
    this.updateAlpha();
  }
  
  parseDocument(document:string){
    this.documentIndex = {};
    var parser = new DOMParser();
    
    var dom = parser.parseFromString(document,"text/html");
    var nodeList = dom.querySelectorAll("body > *");
    
    var catI = [0,0,0,0,0];
    var cat = ["","","",""];
    this.document = Array.from(nodeList).map((node,i) => {
      
      // save headings as categories
      switch(node.nodeName){
        case "H1":          
          catI[0]++;
          catI[1] = catI[2] = catI[3] = catI[4] = 0;
          cat[0] = node.innerHTML;
          cat[1] = cat[2] = cat[3] = cat[4] = "";
          console.log(node.nodeName,catI,cat);
          break;
          
        case "H2":
          catI[1]++;
          catI[2] = catI[3] = catI[4] = 0;
          cat[1] = node.innerHTML;
          cat[2] = cat[3] = cat[4] = "";
          break;
          
        case "H3":
          catI[2]++;
          catI[3] = catI[4] = 0;
          cat[2] = node.innerHTML;
          cat[3] = cat[4] = "";
          break;

        case "H4":
          catI[3]++;
          catI[4] = 0;
          cat[3] = node.innerHTML;
          cat[4] = "";
          break;
          
        default:
          catI[4]++;
          cat[4] = node.innerHTML.substring(0,30).replace(/(<([^>]+)>)/ig,"").replace("\n","");
      }
      
      // save line
      let line = new Line(node.outerHTML,i,catI.slice(0),cat.slice(0));
      this.documentIndex[i] = line;
      return line;
    });
  }
  
  saveTemp(){
    localStorage.setItem('comments', JSON.stringify(this.newComments));
  }
  
  saveSaved(){
    localStorage.setItem('savedComments', JSON.stringify(this.comments));
  }
  
  getTemp(){
    return JSON.parse(localStorage.getItem('comments')) || [];
  }
  getSaved(){
    return JSON.parse(localStorage.getItem('savedComments')) || [];
  }
  
  publishComments(){
    this.http.post<Comment[]>("/data/revisions",{revisions:this.newComments}).toPromise()
      .then(comments => {
        
        this.comments = this.comments.concat(comments); 
        this.newComments = [];
      
        this.saveTemp();
        this.saveSaved();
      
        this.parseComments();
      });
   
  }

  openComments(line:Line){
    this.currentLine = line;
    this.closeComments();
    line.openComments();
  }
    
  closeComments(line?:Line){
    if(line) line.closeComments();
    else this.document.forEach(line => line.closeComments());
  }
  
  addComment(line:Line){
    var comment = new Comment(line);
    comment.unsaved = true;
    
    this.newComments.push(comment);
    this.saveTemp();
    
    this.editedComment = comment;
    line.addComment(this.editedComment);
    this.commentModal.show();
    
    this.updateAlpha();
  }
  
  editComment(comment){
    if(!comment.unsaved) return;
    this.editedComment = comment;
    this.commentModal.show();
  }
  
  saveComment(){    
    this.saveTemp();
    this.commentModal.hide();    
  }
  
  deleteComment(){
    let comment = this.editedComment;
    let line = this.documentIndex[comment.line];
    
    line.removeComment(comment);
    
    this.newComments = this.newComments.filter(item => item !== comment);
    this.saveTemp();
    
    this.commentModal.hide();
    
    this.updateAlpha();
  }
  
  isLineUnsaved(line:Line){
    return line.comments.some(comment => comment.unsaved === true);
  }
  
  updateAlpha(){
    this.maxAlpha = 1;
    this.document.forEach(line => this.maxAlpha = Math.max(this.maxAlpha,line.comments.length));
  }
  
  getRedAlpha(line){
    return 'rgba(0,255,0,' + (line.comments.length/this.maxAlpha/2) + ')';
  }
  
}
