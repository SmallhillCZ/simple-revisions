
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ModalModule } from 'ngx-bootstrap/modal';

import { nl2brPipe } from "../pipes/nl2br.pipe";

import { AppComponent } from './app.component';


@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ModalModule.forRoot()
  ],
  declarations: [
    AppComponent,
    nl2brPipe
  ],
  providers: [ Title ],
  bootstrap: [AppComponent]
})
export class AppModule { }
