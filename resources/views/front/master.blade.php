<!DOCTYPE>
<html ng-app="interMap">
    <head>
        <title>InterMap</title>
        <link rel="stylesheet" type="text/css" href="{{asset('bower_components/bootstrap/dist/css/bootstrap.min.css')}}"/>
        <link rel="stylesheet" type="text/css" href="{{asset('css/app.css')}}"/>
        <link rel="stylesheet" type="text/css" href="{{asset('css/main.css')}}"/>
        <link rel="stylesheet" type="text/css" href="{{asset('bower_components/angular-growl/build/angular-growl.min.css')}}"/>
        <link rel="stylesheet" type="text/css" href="{{asset('bower_components/angular-input-stars-directive/angular-input-stars.css')}}"/>
        <link rel="stylesheet" type="text/css" href="{{asset('bower_components/leaflet/dist/leaflet.css')}}"/>
        <link rel="stylesheet" type="text/css" href="{{asset('/bower_components/leaflet-draw/dist/leaflet.draw.css')}}"/>
        <!--<link rel="stylesheet" type="text/css" href="{{asset('bower_components/Leaflet.label/dist/leaflet.label.css')}}"/>-->
    </head>
    <body ng-controller="bodyController">
        <!-- Widok Główny -->
        <div ng-hide="loggedUser == false" id="page-wrapper" ng-class="{'open': toggle}" ng-cloak>
            <div nav-bar></div>
            <div id="content-wrapper">
                <div class="page-content">
                    <div id="header" header-bar></div>
                    <div class="row">
                        <div growl></div>
                        <div ui-view></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Rejestracja -->
        <div ng-if="$state.current.name == 'register'" class="row">
            <div growl></div>
            <div ui-view></div>
        </div>
        <!-- Logowanie -->
        <div class="row" ng-show="loggedUser == false && $state.current.name != 'register'">
            <div growl></div>
            <div class="col-md-4 col-md-push-4 col-sm-4 col-sm-push-4 col-xs-12 well">
                <h1>Logowanie</h1>
                <form name="loginForm" ng-submit="logIn(loginForm)">
                    <div class="form-group">
                        <input type="email" class="form-control" name="email" ng-model="login.username" placeholder="Wpisz adres email..." required/>
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control" name="password" ng-model="login.password" placeholder="Wpisz hasło..." required/>
                    </div>
                    <input type="submit" class="btn btn-success" name="save" value="Zaloguj"/>
                </form>
                <br/>
                <div class="form-group">
                    <button ng-click="register()" type="button" class="btn btn-default">
                        <span class="row">Zarejestruj Się !</span>
                    </button>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="{{asset('bower_components/angular/angular.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/jquery/dist/jquery.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-sanitize/angular-sanitize.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-route/angular-route.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-cookies/angular-cookies.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-ui-router/release/angular-ui-router.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-growl/build/angular-growl.min.js')}}"></script>
        <!--<script type="text/javascript" src="{{asset('bower_components/requirejs/require.js')}}"></script>-->
        <script type="text/javascript" src="{{asset('bower_components/angular-bootstrap/ui-bootstrap.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-input-stars-directive/angular-input-stars.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-cookies/angular-cookies.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-translate/angular-translate.min.js')}}"></script>
        <!-- Leaflet -->
        <script type="text/javascript" src="{{asset('bower_components/leaflet/dist/leaflet.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('bower_components/leaflet-draw/dist/leaflet.draw.js')}}"></script>
        <!-- App -->
        <script type="text/javascript" src="{{asset('front/scripts/app.js')}}"></script>
        <!-- Controllers --> 
        <script type="text/javascript" src="{{asset('front/scripts/controllers.js')}}"></script>
        <!-- Services  -->
        <script type="text/javascript" src="{{asset('front/scripts/services.js')}}"></script>
        <!-- Directives --> 
        <script type="text/javascript" src="{{asset('front/scripts/directives.js')}}"></script>
        
    </body>
</html>