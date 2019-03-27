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

    getRecommendation(movies: Movie[]): Promise<Array<Movie>> {
        var movieIds = movies.map(m => m.id).join(", ");
        var query = `       
        MATCH (m:Movie)<-[r2:RATED]-(u2)
        WHERE id(m) in [` + movieIds + `]
        WITH m, u2, COLLECT(r2) AS ratings
        
        UNWIND ratings AS r
        
        WITH m, u2, sum( (5) * (r.rating) ) AS nom,
            sqrt( 25 * sum( (r.rating) ^2)) AS denom
        WHERE denom <> 0
        
        WITH m, u2, nom/denom AS pearson
        ORDER BY pearson DESC LIMIT 10
        
        MATCH (u2)-[r:RATED]->(m2:Movie) WHERE m <> m2
        
        RETURN m2.title AS name, id(m2) AS id, SUM( pearson * r.rating) AS score
        ORDER BY score DESC LIMIT 25`

        // var foo =
        // `
        // MATCH (u1:User {name:"Cynthia Freeman"})-[r:RATED]->(m:Movie)
        // WITH u1, avg(r.rating) AS u1_mean

        // MATCH (u1)-[r1:RATED]->(m:Movie)<-[r2:RATED]-(u2)
        // WITH u1, u1_mean, u2, COLLECT({r1: r1, r2: r2}) AS ratings WHERE size(ratings) > 10

        // MATCH (u2)-[r:RATED]->(m:Movie)
        // WITH u1, u1_mean, u2, avg(r.rating) AS u2_mean, ratings

        // UNWIND ratings AS r

        // WITH sum( (r.r1.rating-u1_mean) * (r.r2.rating-u2_mean) ) AS nom,
        //     sqrt( sum( (r.r1.rating - u1_mean)^2) * sum( (r.r2.rating - u2_mean) ^2)) AS denom,
        //     u1, u2 WHERE denom <> 0

        // WITH u1, u2, nom/denom AS pearson
        // ORDER BY pearson DESC LIMIT 10

        // MATCH (u2)-[r:RATED]->(m:Movie) WHERE NOT EXISTS( (u1)-[:RATED]->(m) )

        // RETURN m.title, SUM( pearson * r.rating) AS score
        // ORDER BY score DESC LIMIT 25`

        return this.neo4jService.run(query).then(result => result.records.map(record => {
            var movie = new Movie();
            movie.id = record.get('id');
            movie.name = record.get('name');
            movie.score = record.get('score');

            return movie;
        }))
    }
}