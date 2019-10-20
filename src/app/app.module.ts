import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

//Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { CreateRouteComponent } from './content/create-route/create-route.component';
import { FooterComponent } from './footer/footer.component';
import { DetailsComponent } from './content/details/details.component';
import { ContentComponent } from './content/content.component';

//Services
import { HttpService } from './http.service';
import { MapService } from './map.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CreateRouteComponent,
    FooterComponent,
    DetailsComponent,
    ContentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    HttpService,
    MapService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
