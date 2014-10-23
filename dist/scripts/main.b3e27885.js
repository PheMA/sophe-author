"use strict";var app=angular.module("sopheAuthorApp",["ngRoute","ui.bootstrap","sophe","security"]);app.config(["$routeProvider",function(a){a.when("/",{title:"Home",templateUrl:"views/main.html",controller:"MainCtrl"}).when("/dashboard",{title:"Dashboard",templateUrl:"views/dashboard.html",controller:"DashboardCtrl"}).when("/about",{title:"About",templateUrl:"views/about.html",controller:"AboutCtrl"}).when("/phenotype",{title:"Phenotypes",templateUrl:"views/phenotypes/edit.html",controller:"PhenotypeCtrl"}).when("/phenotype/new",{title:"Phenotypes",templateUrl:"views/phenotypes/edit.html",controller:"PhenotypeCtrl"}).when("/phenotype/:id",{title:"Phenotypes",templateUrl:"views/phenotypes/edit.html",controller:"PhenotypeCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("sophe.draggable",[]).directive("draggable",function(){var a={restrict:"A",link:function(a,b){var c=b[0];c.draggable=!0,c.addEventListener("dragstart",function(a){return a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("Text",c.getElementsByTagName("input")[0].value),this.classList.add("drag"),!1},!1),c.addEventListener("dragend",function(){return this.classList.remove("drag"),!1},!1)}};return a}),angular.module("sophe.droppable",[]).directive("droppable",function(){var a={restrict:"A",scope:{drop:"&"},link:function(a,b){var c=b[0];c.addEventListener("dragover",function(a){return a.dataTransfer.dropEffect="move",a.preventDefault&&a.preventDefault(),this.classList.add("over"),!1},!1),c.addEventListener("dragenter",function(){return this.classList.add("over"),!1},!1),c.addEventListener("dragleave",function(){return this.classList.remove("over"),!1},!1),c.addEventListener("drop",function(b){return b.stopPropagation&&b.stopPropagation(),this.classList.remove("over"),a.$apply(function(a){var c=a.drop;if("undefined"!=typeof c){var d={config:{x:b.layerX,y:b.layerY,element:JSON.parse(b.dataTransfer.getData("Text"))}};c(d)}}),!1},!1)}};return a}),function(){angular.module("sophe.kinetic",[]).directive("kineticCanvas",["$rootScope",function(){return{restrict:"A",scope:{canvasDetails:"="},link:function(a,b,c){if(!a.canvasDetails){a.canvasDetails={isdraggable:!0,kineticStageObj:null};var d=c.id;d||(d=Math.random().toString(36).substring(7)),a.canvasDetails.kineticStageObj||(a.canvasDetails.kineticStageObj=new Kinetic.Stage({container:d,width:600,height:400})),a.canvasDetails.kineticStageObj.container||(a.canvasDetails.kineticStageObj.attrs.container=d)}}}}])}(),angular.module("sophe.phenotype.toolbar",[]).directive("phenotypeToolbar",["$rootScope",function(){var a={templateUrl:"views/phenotypes/toolbar.html",restrict:"E",replace:!0,scope:!0,link:function(a){a.buttons=[{text:"Save",iconClass:"fa fa-save"},{text:"Export",iconClass:"fa fa-arrow-circle-down"},{spacer:!0},{text:"Copy",iconClass:"fa fa-copy"},{text:"Paste",iconClass:"fa fa-paste"},{text:"Undo",iconClass:"fa fa-undo"},{text:"Redo",iconClass:"fa fa-repeat"}]}};return a}]),angular.module("sophe.elements.phenotype",[]).directive("phenotypeElements",["$rootScope",function(){var a={templateUrl:"views/elements/phenotype.html",restrict:"A",replace:!0,scope:!0,link:function(){}};return a}]),angular.module("sophe.elements.qdm",[]).directive("qdmElements",["$rootScope",function(){var a={templateUrl:"views/elements/qdm.html",restrict:"A",replace:!0,scope:!0,link:function(){}};return a}]),angular.module("sophe",["sophe.kinetic","sophe.draggable","sophe.droppable","sophe.elements.qdm","sophe.elements.phenotype","sophe.phenotype.toolbar"]),angular.module("sopheAuthorApp").controller("MainCtrl",["$scope",function(a){a.numberOfPhenotypes=0,a.hasPhenotypes=function(){return a.numberOfPhenotypes>0}}]),angular.module("sopheAuthorApp").controller("AboutCtrl",["$scope",function(){}]),angular.module("sopheAuthorApp").controller("PhenotypeCtrl",["$scope","$http","$routeParams",function(a,b,c){function d(){}function e(b){b.on("mouseover",function(){document.body.style.cursor="pointer"}),b.on("mouseout",function(){document.body.style.cursor="default",a.$emit("CANVAS-MOUSEOUT")})}function f(a){a.on("mouseover",function(a){a.target.setStrokeWidth(3),a.target.parent.draw()}),a.on("mouseout",function(a){a.target.setStrokeWidth(1),a.target.parent.draw()})}function g(a,b){("undefined"==typeof a.text||""===a.text)&&(a.text="New Item");var c=new Kinetic.Text(a);return e(c),b.add(c),c}function h(a,b){var c=new Kinetic.Rect(a);return e(c),b.add(c),c}function i(a,b){var c=new Kinetic.Circle(a);return e(c),b.add(c),c}a.phenotype=c.id,b.get("data/phenotypes.json").success(function(b){a.phenotypes=b.sort(function(a,b){return a.name.localeCompare(b.name)})}),b.get("data/qdm-elements.json").success(function(b){if(a.dataElements=[],b&&b.results){for(var c=[],d=b.results.bindings,e=0;e<d.length;e++)"http://rdf.healthit.gov/qdm/element#qdm-4-1"===d[e].context.value&&c.push({name:d[e].datatypeLabel.value});a.dataElements=c.sort(function(a,b){return a.name.localeCompare(b.name)})}}),a.addWorkflowObject=function(b){if("undefined"==typeof a.canvasDetails)return null;var c={x:b?b.x:50,y:b?b.y:50,width:175,height:200,fill:"#dbeef4",stroke:"black",strokeWidth:1},e=new Kinetic.Layer({draggable:!0}),j=h(c,e),k={x:c.x,y:c.y,width:c.width,fontFamily:"Calibri",fontSize:14,fill:"black",text:b.element.name,align:"center",padding:5},l=g(k,e),m={x:c.x+10,y:l.height()+k.y+5,width:c.width-20,height:75,fill:"#EEEEEE",stroke:"#CCCCCC",strokeWidth:1},n=h(m,e),o={x:m.x,y:m.y,width:n.width(),height:n.height(),fontFamily:"Calibri",fontSize:14,fill:"gray",text:"Drag and drop clinical terms or value sets here, or search for terms",align:"center",padding:5};g(o,e);var p={x:m.x,y:n.height()+m.y+5,width:m.width,height:m.height,fill:"#EEEEEE",stroke:"#CCCCCC",strokeWidth:1},q=h(p,e);j.setHeight(q.getY()+q.getHeight()-c.y+10);var r={x:c.x,y:c.y+j.getHeight()/2,width:15,height:15,fill:"white",stroke:"black",strokeWidth:1},s=i(r,e);f(s),d(s);var t={x:c.x+c.width,y:c.y+j.getHeight()/2,width:15,height:15,fill:"white",stroke:"black",strokeWidth:1},u=i(t,e);return f(u),d(u),a.canvasDetails.kineticStageObj.add(e),j}}]),angular.module("security.login.form",[]).controller("LoginFormController",["$scope","security",function(a,b){a.user={},a.authError=null,a.authReason=null,b.getLoginReason()&&(a.authReason=b.isAuthenticated()?"You are not authorized to access this page":"Please log in to continue"),a.login=function(){a.authError=null,b.login(a.user.email,a.user.password).then(function(b){b||(a.authError="Invalid login or password")},function(b){a.authError=b})},a.clearForm=function(){a.user={}},a.cancelLogin=function(){b.cancelLogin()}}]),angular.module("sopheAuthorApp").controller("DashboardCtrl",["$scope",function(a){a.newsItems=[],a.phenotypes=[]}]),angular.module("security",["security.service","security.interceptor","security.login","security.authorization"]),angular.module("security.interceptor",["security.retryQueue"]).factory("securityInterceptor",["$injector","securityRetryQueue",function(a,b){return function(c){return c.then(null,function(d){return 401===d.status&&(c=b.pushRetryFn("unauthorized-server",function(){return a.get("$http")(d.config)})),c})}}]).config(["$httpProvider",function(a){a.responseInterceptors.push("securityInterceptor")}]),angular.module("security.retryQueue",[]).factory("securityRetryQueue",["$q","$log",function(a,b){var c=[],d={onItemAddedCallbacks:[],hasMore:function(){return c.length>0},push:function(a){c.push(a),angular.forEach(d.onItemAddedCallbacks,function(c){try{c(a)}catch(d){b.error("securityRetryQueue.push(retryItem): callback threw an error"+d)}})},pushRetryFn:function(b,c){1===arguments.length&&(c=b,b=void 0);var e=a.defer(),f={reason:b,retry:function(){a.when(c()).then(function(a){e.resolve(a)},function(a){e.reject(a)})},cancel:function(){e.reject()}};return d.push(f),e.promise},retryReason:function(){return d.hasMore()&&c[0].reason},cancelAll:function(){for(;d.hasMore();)c.shift().cancel()},retryAll:function(){for(;d.hasMore();)c.shift().retry()}};return d}]),angular.module("security.service",["security.retryQueue","security.login","ui.bootstrap.modal"]).factory("security",["$http","$q","$location","securityRetryQueue","$modal",function(a,b,c,d,e){function f(a){a=a||"/",c.path(a)}function g(){j||(j=e.open({templateUrl:"views/security/login.html",controller:"LoginFormController"}),j.result.then(i))}function h(a){j&&(j.close(a),j=null)}function i(a){a?d.retryAll():(d.cancelAll(),f())}var j=null;d.onItemAddedCallbacks.push(function(){d.hasMore()&&k.showLogin()});var k={getLoginReason:function(){return d.retryReason()},showLogin:function(){g()},login:function(b,c){var d=a.post("/login",{email:b,password:c});return d.then(function(a){k.currentUser=a.data.user,k.isAuthenticated()&&h(!0)})},cancelLogin:function(){h(!1),f()},logout:function(b){a.post("/logout").then(function(){k.currentUser=null,f(b)})},requestCurrentUser:function(){return k.isAuthenticated()?b.when(k.currentUser):a.get("/current-user").then(function(a){return k.currentUser=a.data.user,k.currentUser})},currentUser:null,isAuthenticated:function(){return null==k.currentUser&&(k.currentUser={firstName:"Test",lastName:"Person"}),!!k.currentUser},isAdmin:function(){return!(!k.currentUser||!k.currentUser.admin)}};return k}]),angular.module("security.authorization",["security.service"]).provider("securityAuthorization",{requireAdminUser:["securityAuthorization",function(a){return a.requireAdminUser()}],requireAuthenticatedUser:["securityAuthorization",function(a){return a.requireAuthenticatedUser()}],$get:["security","securityRetryQueue",function(a,b){var c={requireAuthenticatedUser:function(){var d=a.requestCurrentUser().then(function(){return a.isAuthenticated()?void 0:b.pushRetryFn("unauthenticated-client",c.requireAuthenticatedUser)});return d},requireAdminUser:function(){var d=a.requestCurrentUser().then(function(){return a.isAdmin()?void 0:b.pushRetryFn("unauthorized-client",c.requireAdminUser)});return d}};return c}]}),angular.module("security.login",["security.login.form","security.login.toolbar"]),angular.module("security.login.toolbar",[]).directive("loginToolbar",["security",function(a){var b={templateUrl:"views/security/toolbar.html",restrict:"E",replace:!0,scope:!0,link:function(b){b.isAuthenticated=a.isAuthenticated,b.login=a.showLogin,b.logout=a.logout,b.$watch(function(){return a.currentUser},function(a){b.currentUser=a})}};return b}]);