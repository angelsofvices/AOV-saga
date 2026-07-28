(function(){'use strict';var g,aa=typeof Object.create=="function"?Object.create:function(a){function b(){}
b.prototype=a;return new b},h=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;
a[b]=c.value;return a};
function ba(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}
var ca=ba(this);function k(a,b){if(b)a:{var c=ca;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&h(c,a,{configurable:!0,writable:!0,value:b})}}
var l;if(typeof Object.setPrototypeOf=="function")l=Object.setPrototypeOf;else{var m;a:{var da={a:!0},n={};try{n.__proto__=da;m=n.a;break a}catch(a){}m=!1}l=m?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var p=l;
function q(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}
function r(a){var b=typeof Symbol!="undefined"&&Symbol.iterator&&a[Symbol.iterator];if(b)return b.call(a);if(typeof a.length=="number")return{next:q(a)};throw Error(String(a)+" is not an iterable or ArrayLike");}
k("Symbol",function(a){function b(f){if(this instanceof b)throw new TypeError("Symbol is not a constructor");return new c(d+(f||"")+"_"+e++,f)}
function c(f,v){this.g=f;h(this,"description",{configurable:!0,writable:!0,value:v})}
if(a)return a;c.prototype.toString=function(){return this.g};
var d="jscomp_symbol_"+(Math.random()*1E9>>>0)+"_",e=0;return b});
k("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");h(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return ha(q(this))}});
return a});
function ha(a){a={next:a};a[Symbol.iterator]=function(){return this};
return a}
k("Symbol.dispose",function(a){return a?a:Symbol("Symbol.dispose")});
function ia(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}d=!0;return{done:!0,value:void 0}}};
e[Symbol.iterator]=function(){return e};
return e}
k("Object.values",function(a){return a?a:function(b){var c=[],d;for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&c.push(b[d]);return c}});
k("Array.prototype.values",function(a){return a?a:function(){return ia(this,function(b,c){return c})}});/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var t=this||self;function u(a){a=a.split(".");for(var b=t,c=0;c<a.length;c++)if(b=b[a[c]],b==null)return null;return b}
function w(a,b){a=a.split(".");for(var c=t,d;a.length&&(d=a.shift());)a.length||b===void 0?c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}:c[d]=b}
;var x=Math.max,ja=x.apply,y=Object.values({da:1,ca:2,ba:4,ha:8,ja:16,fa:32,W:64,Z:128,X:256,ia:512,Y:1024,aa:2048,ga:4096,ea:8192}),z;if(y instanceof Array)z=y;else{for(var ka=r(y),A,B=[];!(A=ka.next()).done;)B.push(A.value);z=B}ja.call(x,Math,z);function C(){this.v=this.v;this.C=this.C}
C.prototype.v=!1;C.prototype.dispose=function(){this.v||(this.v=!0,this.H())};
C.prototype[Symbol.dispose]=function(){this.dispose()};
C.prototype.H=function(){if(this.C)for(;this.C.length;)this.C.shift()()};var D=t.window,E,F,G=(D==null?void 0:(E=D.yt)==null?void 0:E.config_)||(D==null?void 0:(F=D.ytcfg)==null?void 0:F.data_)||{};w("yt.config_",G);function H(a){a=I(a);return typeof a==="string"&&a==="false"?!1:!!a}
function I(a,b){var c={};a=("EXPERIMENT_FLAGS"in G?G.EXPERIMENT_FLAGS:c)[a];return a!==void 0?a:b}
;var J=1E3/60,la=Number(I("web_emulated_idle_callback_delay",300)||0),K=J-3,L=[8,5,4,3,2,1,0];function M(a){a=a===void 0?{}:a;C.call(this);var b=this;this.i=[];this.h={};this.F=this.g=0;this.D=this.l=!1;this.A=[];this.B=this.G=!1;for(var c=r(L),d=c.next();!d.done;d=c.next())this.i[d.value]=[];this.j=0;this.R=a.timeout||1;this.u=K;this.m=0;this.I=this.U.bind(this);this.P=this.V.bind(this);this.L=this.S.bind(this);this.M=this.T.bind(this);this.N=this.K.bind(this);this.O=function(){b.K(performance.now())};
this.J=!!window.requestIdleCallback&&!!window.cancelIdleCallback&&!H("disable_scheduler_requestIdleCallback");((this.o=a.useRaf!==!1&&!!window.requestAnimationFrame)||H("enable_scheduler_simulate_raf"))&&document.addEventListener("visibilitychange",this.I)}
M.prototype=aa(C.prototype);M.prototype.constructor=M;if(p)p(M,C);else for(var N in C)if(N!="prototype")if(Object.defineProperties){var O=Object.getOwnPropertyDescriptor(C,N);O&&Object.defineProperty(M,N,O)}else M[N]=C[N];function P(a,b){var c=Date.now();Q(b);b=Date.now()-c;a.l||(a.u-=b)}
function R(a,b,c,d){++a.F;if(c===10)return P(a,b),a.F;var e=a.F;a.h[e]=b;a.l&&!d?a.A.push({id:e,priority:c}):(a.i[c].push(e),a.D||a.l||(a.g!==0&&S(a)!==a.m&&T(a),a.start()));return e}
function U(a){a.A.length=0;for(var b=5;b>=0;b--)a.i[b].length=0;a.i[8].length=0;a.h={};T(a)}
function S(a){var b=H("enable_scheduler_simulate_raf");if(a.i[8].length){if(a.B)return 4;if(b){if(!document.hidden)return a.o?3:5}else if(!document.hidden&&a.o)return 3}for(var c=5;c>=a.j;c--)if(a.i[c].length>0)return c>0?b?document.hidden?2:a.o?3:5:!document.hidden&&a.o?3:2:1;return 0}
function ma(a){var b=u("yt.logging.errors.log");b&&b(a)}
function Q(a){try{a()}catch(b){ma(b)}}
function na(a){for(var b=r(L),c=b.next();!c.done;c=b.next())if(a.i[c.value].length)return!0;return!1}
g=M.prototype;g.T=function(a){var b=void 0;a&&(b=a.timeRemaining());this.G=!0;V(this,b);this.G=!1};
g.V=function(){V(this)};
g.S=function(){oa(this)};
g.K=function(a){this.B=!0;var b=S(this);b===4&&b!==this.m&&(T(this),this.start());V(this,void 0,a);this.B=!1};
g.U=function(){document.hidden||oa(this);this.g&&(T(this),this.start())};
function oa(a){T(a);a.l=!0;for(var b=Date.now(),c=a.i[8];c.length;){var d=c.shift(),e=a.h[d];delete a.h[d];e&&Q(e)}pa(a);a.l=!1;na(a)&&a.start();a.u-=Date.now()-b}
function pa(a){for(var b=0,c=a.A.length;b<c;b++){var d=a.A[b];a.i[d.priority].push(d.id)}a.A.length=0}
function V(a,b,c){a.B&&a.m===4&&a.g||T(a);a.l=!0;b=Date.now()+(b||a.u);for(var d=a.i[5];d.length;){var e=d.shift(),f=a.h[e];delete a.h[e];if(f)try{f(c)}catch(va){ma(va)}}for(d=a.i[4];d.length;)c=d.shift(),e=a.h[c],delete a.h[c],e&&Q(e);d=a.G?0:1;d=a.j>d?a.j:d;if(!(Date.now()>=b)){do{a:{c=a;e=d;for(f=3;f>=e;f--)for(var v=c.i[f];v.length;){var ea=v.shift(),fa=c.h[ea];delete c.h[ea];if(fa){c=fa;break a}}c=null}c&&Q(c)}while(c&&Date.now()<b)}a.l=!1;pa(a);a.u=K;na(a)&&a.start()}
g.start=function(){this.D=!1;if(this.g===0)switch(this.m=S(this),this.m){case 1:var a=this.M;this.g=this.J?window.requestIdleCallback(a,{timeout:3E3}):window.setTimeout(a,la);break;case 2:this.g=window.setTimeout(this.P,this.R);break;case 3:this.g=window.requestAnimationFrame(this.N);break;case 4:this.g=window.setTimeout(this.L,0);break;case 5:this.g=window.setTimeout(this.O,J)}};
function T(a){if(a.g){switch(a.m){case 1:var b=a.g;a.J?window.cancelIdleCallback(b):window.clearTimeout(b);break;case 5:case 2:case 4:window.clearTimeout(a.g);break;case 3:window.cancelAnimationFrame(a.g)}a.g=0}}
g.H=function(){U(this);T(this);(this.o||H("enable_scheduler_simulate_raf"))&&document.removeEventListener("visibilitychange",this.I);C.prototype.H.call(this)};var W=u("yt.scheduler.instance.timerIdMap_")||{},qa=Number(I("kevlar_tuner_scheduler_soft_state_timer_ms",800)||0),X=0,Y=0;function Z(){var a=u("ytglobal.schedulerInstanceInstance_");if(!a||a.v)a=new M(("scheduler"in G?G.scheduler:void 0)||{}),w("ytglobal.schedulerInstanceInstance_",a);return a}
function ra(){sa();var a=u("ytglobal.schedulerInstanceInstance_");a&&(a&&typeof a.dispose=="function"&&a.dispose(),w("ytglobal.schedulerInstanceInstance_",null))}
function sa(){U(Z());for(var a in W)W.hasOwnProperty(a)&&delete W[Number(a)]}
function ta(a,b,c){if(!c)return c=c===void 0,-R(Z(),a,b,c);var d=window.setTimeout(function(){var e=R(Z(),a,b);W[d]=e},c);
return d}
function ua(a){var b=Z();P(b,a)}
function wa(a){var b=Z();if(a<0)delete b.h[-a];else{var c=W[a];c?(delete b.h[c],delete W[a]):window.clearTimeout(a)}}
function xa(){ya()}
function ya(){window.clearTimeout(X);Z().start()}
function za(){var a=Z();T(a);a.D=!0;window.clearTimeout(X);X=window.setTimeout(xa,qa)}
function Aa(){window.clearTimeout(Y);Y=window.setTimeout(function(){Ba(0)},qa)}
function Ba(a){Aa();var b=Z();b.j=a;b.start()}
function Ca(a){Aa();var b=Z();b.j>a&&(b.j=a,b.start())}
function Da(){window.clearTimeout(Y);var a=Z();a.j=0;a.start()}
;u("yt.scheduler.initialized")||(w("yt.scheduler.instance.dispose",ra),w("yt.scheduler.instance.addJob",ta),w("yt.scheduler.instance.addImmediateJob",ua),w("yt.scheduler.instance.cancelJob",wa),w("yt.scheduler.instance.cancelAllJobs",sa),w("yt.scheduler.instance.start",ya),w("yt.scheduler.instance.pause",za),w("yt.scheduler.instance.setPriorityThreshold",Ba),w("yt.scheduler.instance.enablePriorityThreshold",Ca),w("yt.scheduler.instance.clearPriorityThreshold",Da),w("yt.scheduler.initialized",!0));}).call(this);
