import { Injectable } from '@angular/core';

import { Movie } from '../models/Movie';
import { Neo4jService } from '../neo4j.service';

@Injectable({
    providedIn: 'root'
})
export class MovieService {

    constructor(private neo4jService: Neo4jService) {

    }

    getMovies(): Promise<Array<Movie>> {
        return this.neo4jService.run("MATCH (n:Movie) RETURN id(n) AS id, n.title AS name").then(result => result.records.map(record => {
            var movie = new Movie();
            movie.id = record.get('id');
            movie.name = record.get('name');

            return movie;
        }))
    }
}