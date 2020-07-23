import { Component, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';

interface Cell {
  value?: number;
  dirty?: boolean;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const random = arr => arr[Math.floor(Math.random() * arr.length)];
const GRID_SIZE = 4;

const inBounds = (x, y) => x < 4 && y < 4 && x >= 0 && y >= 0;

const range = (from, to, callback) => {
  if (from < to) {
    for (let n = from; n <= to; n++) {
      callback(n);
    }
  } else {
    for (let n = from; n >= to; n--) {
      callback(n);
    }
  }
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {

  grid: Cell[][] = [];
  score = 0;
  highscore = 0;

  scores = JSON.parse(localStorage.getItem('scores'));
  // scorelist = this.scores.sort((n1, n2) => n2 - n1);
  name;

  constructor() {
  }

  ngOnInit(): void {

    this.initialize();
    this.spawnCell(2);
    this.spawnCell(2);
    console.log(this.scores);
  }

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        return this.swipe('left');
      case 'ArrowRight':
        event.preventDefault();
        return this.swipe('right');
      case 'ArrowUp':
        event.preventDefault();
        return this.swipe('up');
      case 'ArrowDown':
        event.preventDefault();
        return this.swipe('down');
    }
  }
  onSwipe(evt) {
    const x = Math.abs(evt.deltaX) > 40 ? (evt.deltaX > 0 ? 'right' : 'left') : '';
    const y = Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? 'down' : 'up') : '';
    this.swipe('left');
    var eventText = x + y;
    console.log(eventText);
    switch (eventText) {
      case 'left':
        event.preventDefault();
        return this.swipe('left');
      case 'right':
        event.preventDefault();
        return this.swipe('right');
      case 'up':
        event.preventDefault();
        return this.swipe('up');
      case 'down':
        event.preventDefault();
        return this.swipe('down');
    }
  }

  private swipe(direction: Direction) {
    const isRight = direction === 'right';
    const isDown = direction === 'down';

    const startX = isRight ? GRID_SIZE - 1 : 0;
    const startY = isDown ? GRID_SIZE - 1 : 0;
    const endX = isRight ? 0 : GRID_SIZE - 1;
    const endY = isDown ? 0 : GRID_SIZE - 1;

    let moved = false;

    range(startX, endX, x => {
      range(startY, endY, y => {
        const cell = this.grid[x][y];

        if (cell.value) {
          if (this.moveCell(x, y, direction)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      setTimeout(() => this.spawnCell(2), 100);
    }
  }

  private moveCell(x: number, y: number, direction: Direction) {
    const cell = this.grid[x][y];
    const neighbour = this.findNeighbour(x, y, cell.value, direction);

    if (neighbour && neighbour.value === cell.value) {
      // move to that cell
      neighbour.value *= 2;
      neighbour.dirty = true;
      cell.value = undefined;
      this.score += neighbour.value;

      return true;
    } else if (neighbour && !neighbour.value) {
      // move to that cell
      neighbour.value = cell.value;
      cell.value = undefined;

      return true;
    }

    return false;
  }

  private findNeighbour(x: number, y: number, value: number, direction: Direction) {
    const relX = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const relY = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;

    x += relX;
    y += relY;

    let neighbour;

    while (inBounds(x, y)) {
      const nextNeighbour = this.grid[x][y];

      if (nextNeighbour.dirty) {
        return neighbour;
      } else if (nextNeighbour.value === value) {
        return nextNeighbour;
      } else if (nextNeighbour.value !== undefined) {
        return neighbour;
      }

      x += relX;
      y += relY;

      neighbour = nextNeighbour;
    }

    return neighbour;
  }

  private initialize(): void {
    this.grid = [];

    for (let x = 0; x < GRID_SIZE; x++) {
      this.grid[x] = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        this.grid[x][y] = {};
      }
    }
  }

  private spawnCell(value = 2): void {
    this.cells.forEach(c => c.dirty = false);
    random(this.cells.filter(c => c.value === undefined)).value = value;
  }

  private get cells(): Cell[] {
    return this.grid
      .reduce((acc, val) => acc.concat(val));
  }

  restart() {

    // this.scorelist.push(this.score);
    this.scores.push(this.score);
    this.score = 0;
    this.scores = this.scores.sort((n1, n2) => n2 - n1);
    localStorage.setItem('scores', JSON.stringify(this.scores));
    this.highscore = this.scores[0];
    console.log(this.scores);
    this.ngOnInit();
  }
}