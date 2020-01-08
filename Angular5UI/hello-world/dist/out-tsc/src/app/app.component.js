import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { JwksValidationHandler } from 'angular-oauth2-oidc';
import { authConfig } from './sso.config';
let AppComponent = class AppComponent {
    constructor(oauthService) {
        this.oauthService = oauthService;
        this.title = 'hello-world';
        //this.configureSingleSignOn();
    }
    configureSingleSignOn() {
        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        // this.oauthService.loadDiscoveryDocumentAndTryLogin();
        this.oauthService.loadDiscoveryDocumentAndLogin();
    }
};
AppComponent = tslib_1.__decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['app.component.css']
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map