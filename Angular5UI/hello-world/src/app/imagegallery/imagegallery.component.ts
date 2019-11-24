import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-imagegallery',
  templateUrl: './imagegallery.component.html',
  styleUrls: ['./imagegallery.component.css']
})
export class ImagegalleryComponent implements OnInit {
  //slideIndex : any;
  constructor() { }

  ngOnInit() {
    $("#slideshow > div:gt(0)").hide();

    setInterval(function () {
      $('#slideshow > div:first')
        .fadeOut(1000)
        .next()
        .fadeIn(1000)
        .end()
        .appendTo('#slideshow');
    }, 3000);
  }

}
