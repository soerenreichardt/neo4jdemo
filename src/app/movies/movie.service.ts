import { Injectable } from '@angular/core';

import { Movie } from '../models/Movie';
import { Neo4jService } from '../neo4j.service';

@Injectable({
    providedIn: 'root'
})
export class MovieService {

    constructor(private neo4jService: Neo4jService) {

    }

    getMovies(searchString: string): Promise<Array<Movie>> {
        return this.neo4jService.run(
          `
          MATCH (n:Movie)
          WHERE toLower(n.title) CONTAINS toLower("`+ searchString +`")
          RETURN id(n) AS id, n.title AS name
          `
        ).then(result => result.records.map(record => {
            var movie = new Movie();
            movie.id = record.get('id');
            movie.name = record.get('name');

            return movie;
        }))
    }

    getRecommendation(movies: Movie[]): Promise<Array<Movie>> {
        var movieIds = movies.map(m => m.id).join(", ");
        var query =
        `
        MATCH (movie:Movie)-[:IN_GENRE]->(genre: Genre)
        WHERE id(movie) IN [`+ movieIds +`]
        WITH COLLECT(DISTINCT genre) as likedGenres, COLLECT(DISTINCT movie) as movies

        UNWIND movies as likedMovie
        MATCH (likedMovie)<-[rated:RATED]-(user)
        WHERE rated.rating >= 4

        WITH user, likedGenres
        MATCH (user)-[rated:RATED]->(movie:Movie)-[:IN_GENRE]->(genre)
        WHERE rated.rating >= 4
          AND NOT id(movie) IN [`+ movieIds +`]

        WITH DISTINCT movie, COUNT(user) * size(apoc.coll.intersection(collect(genre), likedGenres)) as score
        RETURN  id(movie) as id, movie.title as name, score
        ORDER BY score DESC
        LIMIT 25
        `

        return this.neo4jService.run(query).then(result => result.records.map(record => {
            var movie = new Movie();
            movie.id = record.get('id');
            movie.name = record.get('name');
            movie.score = record.get('score');

            return movie;
        }))
    }
}
