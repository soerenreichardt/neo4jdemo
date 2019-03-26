import { Component, OnInit } from '@angular/core';
import { Movie } from '../models/Movie';
import { MovieService } from './movie.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@Component({
    selector: 'movies',
    templateUrl: './movies.component.html',
    styleUrls: ['movies.component.scss'],
  })
  export class MoviesComponent implements OnInit {

    movies: Movie[];

    moviesFormControl = new FormControl();
    filteredOptions: Observable<string[]>;

    constructor(private movieService: MovieService) {

    }

    ngOnInit() {
      this.getMovies();
    }

    async getMovies() {
        this.movies = await this.movieService.getMovies();
        this.filteredOptions = this.moviesFormControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
    }

    private _filter(value: string): string[] {
      const filterValue = value.toLowerCase();

      return this.movies.map(m => m.name).filter(option => option.toLowerCase().includes(filterValue));
    }
  }