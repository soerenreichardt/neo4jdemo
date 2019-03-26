import { Component, OnInit, OnDestroy } from '@angular/core';

import { Neo4jService } from './neo4j.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Neo4jDemo';

  constructor(private neo4jService: Neo4jService) {}

  ngOnInit() {
    this.neo4jService.connect();
  }

  ngOnDestroy() {
    this.neo4jService.disconnect();
  }

}
