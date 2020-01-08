import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import * as $ from 'jquery';
let ImagegalleryComponent = class ImagegalleryComponent {
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
};
ImagegalleryComponent = tslib_1.__decorate([
    Component({
        selector: 'app-imagegallery',
        templateUrl: './imagegallery.component.html',
        styleUrls: ['./imagegallery.component.css']
    })
], ImagegalleryComponent);
export { ImagegalleryComponent };
//# sourceMappingURL=imagegallery.component.js.map