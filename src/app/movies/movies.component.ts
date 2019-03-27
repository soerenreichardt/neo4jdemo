import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Movie } from '../models/Movie';
import { MovieService } from './movie.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';

@Component({
    selector: 'movies',
    templateUrl: './movies.component.html',
    styleUrls: ['movies.component.scss'],
  })
  export class MoviesComponent implements OnInit {

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = false;
    separatorKeyCodes: number[] = [];

    movies: Movie[];
    filteredMovies: Observable<Movie[]>;
    selectedMovies: Movie[];

    moviesFormControl = new FormControl();

    @ViewChild('movieInput') movieInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(private movieService: MovieService) {
      this.movies = new Array();
      this.selectedMovies = new Array();
    }

    ngOnInit() {
      this.getMovies();
    }

    async getMovies() {
      this.movies = await this.movieService.getMovies();

      this.filteredMovies = this.moviesFormControl.valueChanges
      .pipe(
        startWith(''),
        // map((movieName: string | null) => movieName ? this._filter(movieName) : this.movies),
        map(movieName => this._filter(movieName)),
        debounceTime(500),
        distinctUntilChanged(),
      );

      // this.filteredMovies.subscribe(m => console.log(m.map(n => n.name)));
    }

    selectMovie(event: MatAutocompleteSelectedEvent) {
      if(event.option.selected) {
        this.selectedMovies.push(event.option.value);
        this.movieInput.nativeElement.value = '';
        this.moviesFormControl.setValue(null);
        event.option.value = "";
      }
    }

    remove(movie: Movie): void {
      const selectedMoviesIndex = this.selectedMovies.indexOf(movie);

      if (selectedMoviesIndex >= 0) {
        this.selectedMovies.splice(selectedMoviesIndex, 1);
      }
    }

    async recommendMovies() {
      var recommendations = await this.movieService.getRecommendation(this.selectedMovies);
      console.log(recommendations);
    }

    private _filter(value: string): Movie[] {
      if (!(typeof(value) === "string")) return this.movies;
      const filterValue = value.toLowerCase();

      return this.movies.filter(option => option.name.toLowerCase().includes(filterValue));
    }
  }