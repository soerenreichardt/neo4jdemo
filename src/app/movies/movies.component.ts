import { Component, OnInit } from '@angular/core';
import { Movie } from '../models/Movie';
import { MovieService } from './movie.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ENTER_CLASSNAME } from '@angular/animations/browser/src/util';


@Component({
    selector: 'movies',
    templateUrl: './movies.component.html',
    styleUrls: ['movies.component.scss'],
  })
  export class MoviesComponent implements OnInit {

    movies: Movie[];

    moviesFormControl = new FormControl();
    filteredOptions: Observable<Movie[]>;
    selectedMovies: Movie[];

    constructor(private movieService: MovieService) {
      this.movies = new Array();
      this.selectedMovies = new Array();
    }

    ngOnInit() {
      this.getMovies();
    }

    async getMovies() {
      this.movies = await this.movieService.getMovies();

      this.filteredOptions = this.moviesFormControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value)),
        debounceTime(500),
        distinctUntilChanged(),
      );
    }

    selectMovie(event: any) {
      if(event.source.selected) {
        this.selectedMovies.push(event.source.value);
        console.log(this.selectedMovies);
        event.source.value = "";
      }
    }

    private _filter(value: string): Movie[] {
      const filterValue = value.toLowerCase();

      return this.movies.filter(option => option.name.toLowerCase().includes(filterValue));
    }
  }