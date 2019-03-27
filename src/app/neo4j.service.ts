import { Injectable } from '@angular/core';

import { v1 as neo4j } from 'neo4j-driver';

@Injectable({
    providedIn: 'root'
})
export class Neo4jService {

    driver: neo4j.Driver;
    session: neo4j.Session;

    connect() {
      this.driver = neo4j.driver('bolt://52.3.253.48:37643', neo4j.auth.basic('neo4j', 'racks-stools-batches'));
      this.session = this.driver.session();
    }

    run(query: string): neo4j.Result {
        return this.session.run(query);
    }

    disconnect() {
      this.session.close();
      this.driver.close();
    }
}
