import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Movie } from '../models/Movie';
import { MovieService } from './movie.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { mergeMap, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';

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

    filteredMovies: Observable<Movie[]>;
    selectedMovies: Movie[];
    recommendations: Movie[];

    moviesFormControl = new FormControl();

    @ViewChild('movieInput') movieInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(private movieService: MovieService) {
      this.selectedMovies = new Array();
    }

    ngOnInit() {
      this.filteredMovies = this.moviesFormControl.valueChanges
      .pipe(
        startWith(''),
        mergeMap(searchString => {
          var a = this.filter(searchString)
          return from(a)
        }),
        debounceTime(500),
        distinctUntilChanged(),
      )
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
      this.recommendations = await this.movieService.getRecommendation(this.selectedMovies);
    }

    async filter(value: string) {
      if (!(typeof(value) === "string") || value === "") return Promise.resolve(new Array<Movie>());
      var filteredMovies = await this.movieService.getMovies(value)
      return filteredMovies
    }
  }
