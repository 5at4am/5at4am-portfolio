(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,5014,e=>{"use strict";var t=e.i(71645);let r=(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim(),n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"},o=(0,t.createContext)({}),i=(0,t.forwardRef)(({color:e,size:i,width:a,height:l,strokeWidth:s,absoluteStrokeWidth:c,nonScalingStroke:u,className:f="",children:d,iconNode:m=[],icon:p={node:m,aliases:[],size:24},...g},h)=>{let{size:v=24,strokeWidth:b=2,absoluteStrokeWidth:y=!1,nonScalingStroke:$=!1,color:x="currentColor",className:w=""}=(0,t.useContext)(o)??{},k=!!d||(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(g),[_,j,T=[]]=function(e,t={}){return function(e,t={}){let o=t.attributeNames??{},i=e=>o[e]??e,a=e.size??e.width??n.width,l=e.size??e.height??n.height,s=e.aliases?.filter(e=>"string"==typeof e&&""!==e.trim()).map(e=>`lucide-${e}`)??[],c=[...e.name?[`lucide-${e.name}`]:[],...s],u=t.className?.split(" ").filter(Boolean)??[],f=!1===t.includeDefaultClasses?r(...u):r("lucide",...c,...u),d=t.absoluteStrokeWidth?Number(t.strokeWidth??n["stroke-width"])*Number(e.size??e.width??n.width)/Number(t.size??t.width??n.width):t.strokeWidth??n["stroke-width"];return["svg",{...Object.entries(n).reduce((e,[t,r])=>(e[i(t)]=r,e),{}),..."color"in t&&t.color&&{[i("stroke")]:t.color},..."size"in t&&null!=t.size&&{[i("width")]:t.size,[i("height")]:t.size},..."width"in t&&null!=t.width&&{[i("width")]:t.width},..."height"in t&&null!=t.height&&{[i("height")]:t.height},[i("stroke-width")]:d,...f&&{[i("class")]:f},[i("viewBox")]:`0 0 ${a} ${l}`,...!1===t.hasA11yProp?{[i("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(e=>{let[r,n,o]=e,a=t.nonScalingStroke?{[i("vector-effect")]:"non-scaling-stroke",...n}:n;return o?[r,a,o]:[r,a]})]}(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}(p,{color:e??x,width:a??i??v,height:l??i??v,strokeWidth:s??b,absoluteStrokeWidth:c??y,nonScalingStroke:u??$,className:r(w,f),hasA11yProp:k,attributes:g});return(0,t.createElement)(_,{ref:h,...j},[...T.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(d)?d:[d]])});e.s(["default",0,i],5014)},56420,e=>{"use strict";var t=e.i(71645),r=e.i(5014);e.s(["default",0,function(e,n=[],o=[]){let i,a="string"==typeof e?function(e,t,r=[]){if(null==t)throw Error("[lucide]: iconNode is required when icon name is used");return{name:e?.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),size:24,node:t,...r.length>0?{aliases:r}:{}}}(e,n,o):e,l=(0,t.forwardRef)(({className:e,...n},o)=>(0,t.createElement)(r.default,{ref:o,icon:a,className:e,...n}));return a.name&&(l.displayName=(i=(e=>{let t="",r=!1;for(let n of e){if("-"===n||"_"===n||n<=" "){r=t.length>0;continue}0===t.length?t+=n.toLowerCase():t+=r?n.toUpperCase():n,r=!1}return t})(a.name)).charAt(0).toUpperCase()+i.slice(1)),l}],56420)},22016,(e,t,r)=>{"use strict";e.i(47167),Object.defineProperty(r,"__esModule",{value:!0});var n={default:function(){return v},useLinkStatus:function(){return y}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let i=e.r(90809),a=e.r(43476),l=i._(e.r(71645)),s=e.r(95057),c=e.r(8372),u=e.r(18581),f=e.r(18967),d=e.r(5550),m=e.r(88540),p=e.r(91949),g=e.r(73668),h=e.r(9396);function v(t){var r;let n,o,i,[v,y]=(0,l.useOptimistic)(p.IDLE_LINK_STATUS),$=(0,l.useRef)(null),{href:x,as:w,children:k,prefetch:_=null,passHref:j,replace:T,shallow:C,scroll:P,onClick:E,onMouseEnter:N,onTouchStart:S,legacyBehavior:z=!1,onNavigate:O,transitionTypes:R,ref:A,unstable_dynamicOnHover:L,...B}=t;n=k,z&&("string"==typeof n||"number"==typeof n)&&(n=(0,a.jsx)("a",{children:n}));let M=l.default.useContext(c.AppRouterContext),I=!1!==_,U=!1===_?"none":!0===_?"full":"auto",F="none"!==U?"auto"===U?h.FetchStrategy.PPR:h.FetchStrategy.Full:h.FetchStrategy.PPR,D="string"==typeof(r=w||x)?r:(0,s.formatUrl)(r);if(z){if(n?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});o=l.default.Children.only(n)}let W=z?o&&"object"==typeof o&&o.ref:A,V,K=l.default.useCallback(e=>(null!==M&&($.current=(0,p.mountLinkInstance)(e,D,M,F,I,y,V)),()=>{$.current&&((0,p.unmountLinkForCurrentNavigation)($.current),$.current=null),(0,p.unmountPrefetchableInstance)(e)}),[I,D,M,F,y,V]),Z={ref:(0,u.useMergedRef)(K,W),onClick(t){z||"function"!=typeof E||E(t),z&&o.props&&"function"==typeof o.props.onClick&&o.props.onClick(t),!M||t.defaultPrevented||function(t,r,n,o,i,a,s,c="none"){if("u">typeof window){let u,{nodeName:f}=t.currentTarget;if("A"===f.toUpperCase()&&((u=t.currentTarget.getAttribute("target"))&&"_self"!==u||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,g.isLocalURL)(r)){o&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),a){let e=!1;if(a({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:d}=e.r(99781);l.default.startTransition(()=>{d(r,o?"replace":"push",!1===i?m.ScrollBehavior.NoScroll:m.ScrollBehavior.Default,n.current,s,c)})}}(t,D,$,T,P,O,R,U)},onMouseEnter(e){z||"function"!=typeof N||N(e),z&&o.props&&"function"==typeof o.props.onMouseEnter&&o.props.onMouseEnter(e),M&&I&&(0,p.onNavigationIntent)(e.currentTarget,!0===L)},onTouchStart:function(e){z||"function"!=typeof S||S(e),z&&o.props&&"function"==typeof o.props.onTouchStart&&o.props.onTouchStart(e),M&&I&&(0,p.onNavigationIntent)(e.currentTarget,!0===L)}};return(0,f.isAbsoluteUrl)(D)?Z.href=D:z&&!j&&("a"!==o.type||"href"in o.props)||(Z.href=(0,d.addBasePath)(D)),i=z?l.default.cloneElement(o,Z):(0,a.jsx)("a",{...B,...Z,children:n}),(0,a.jsx)(b.Provider,{value:v,children:i})}let b=(0,l.createContext)(p.IDLE_LINK_STATUS),y=()=>(0,l.useContext)(b);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},18581,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"useMergedRef",{enumerable:!0,get:function(){return o}});let n=e.r(71645);function o(e,t){let r=(0,n.useRef)(null),o=(0,n.useRef)(null);return(0,n.useCallback)(n=>{if(null===n){let e=r.current;e&&(r.current=null,e());let t=o.current;t&&(o.current=null,t())}else e&&(r.current=i(e,n)),t&&(o.current=i(t,n))},[e,t])}function i(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},18967,(e,t,r)=>{"use strict";e.i(47167),Object.defineProperty(r,"__esModule",{value:!0});var n={DecodeError:function(){return v},MiddlewareNotFoundError:function(){return x},MissingStaticPage:function(){return $},NormalizeError:function(){return b},PageNotFoundError:function(){return y},SP:function(){return g},ST:function(){return h},WEB_VITALS:function(){return i},execOnce:function(){return a},getDisplayName:function(){return f},getLocationOrigin:function(){return c},getURL:function(){return u},isAbsoluteUrl:function(){return s},isResSent:function(){return d},loadGetInitialProps:function(){return p},normalizeRepeatedSlashes:function(){return m},stringifyError:function(){return w}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let i=["CLS","FCP","FID","INP","LCP","TTFB"];function a(e){let t,r=!1;return(...n)=>(r||(r=!0,t=e(...n)),t)}let l=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,s=e=>{let t=e.charCodeAt(0);return!!(t>=65&&t<=90||t>=97&&t<=122)&&l.test(e)};function c(){let{protocol:e,hostname:t,port:r}=window.location;return`${e}//${t}${r?":"+r:""}`}function u(){let{href:e}=window.location,t=c();return e.substring(t.length)}function f(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function d(e){return e.finished||e.headersSent}function m(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function p(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await p(t.Component,t.ctx)}:{};let n=await e.getInitialProps(t);if(r&&d(r))return n;if(!n)throw Object.defineProperty(Error(`"${f(e)}.getInitialProps()" should resolve to an object. But found "${n}" instead.`),"__NEXT_ERROR_CODE",{value:"E1025",enumerable:!1,configurable:!0});return n}let g="u">typeof performance,h=g&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class v extends Error{}class b extends Error{}class y extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class $ extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class x extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function w(e){return JSON.stringify({message:e.message,stack:e.stack})}},73668,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return i}});let n=e.r(18967),o=e.r(52817);function i(e){if(!(0,n.isAbsoluteUrl)(e))return!0;try{let t=(0,n.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,o.hasBasePath)(r.pathname)}catch(e){return!1}}},98183,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={assign:function(){return s},searchParamsToUrlQuery:function(){return i},urlQueryToSearchParams:function(){return l}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});function i(e){let t={};for(let[r,n]of e.entries()){let e=t[r];void 0===e?t[r]=n:Array.isArray(e)?e.push(n):t[r]=[e,n]}return t}function a(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function l(e){let t=new URLSearchParams;for(let[r,n]of Object.entries(e))if(Array.isArray(n))for(let e of n)t.append(r,a(e));else t.set(r,a(n));return t}function s(e,...t){for(let r of t){for(let t of r.keys())e.delete(t);for(let[t,n]of r.entries())e.append(t,n)}return e}},95057,(e,t,r)=>{"use strict";e.i(47167),Object.defineProperty(r,"__esModule",{value:!0});var n={formatUrl:function(){return l},formatWithValidation:function(){return c},urlObjectKeys:function(){return s}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let i=e.r(90809)._(e.r(98183)),a=/https?|ftp|gopher|file/;function l(e){let{auth:t,hostname:r}=e,n=e.protocol||"",o=e.pathname||"",l=e.hash||"",s=e.query||"",c=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?c=t+e.host:r&&(c=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(c+=":"+e.port)),s&&"object"==typeof s&&(s=String(i.urlQueryToSearchParams(s)));let u=e.search||s&&`?${s}`||"";return n&&!n.endsWith(":")&&(n+=":"),e.slashes||(!n||a.test(n))&&!1!==c?(c="//"+(c||""),o&&"/"!==o[0]&&(o="/"+o)):c||(c=""),l&&"#"!==l[0]&&(l="#"+l),u&&"?"!==u[0]&&(u="?"+u),o=o.replace(/[?#]/g,encodeURIComponent),u=u.replace("#","%23"),`${n}${c}${o}${u}${l}`}let s=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return l(e)}},8945,e=>{"use strict";var t=e.i(43476),r=e.i(71645);function n({duration:e=500,toggled:o,className:i,type:a="button",title:l="Toggle theme","aria-label":s="Toggle theme","aria-pressed":c,...u}){let f=(0,r.useId)(),d=`toggles.dev-around-main-${f}`;return(0,t.jsx)("button",{...u,type:a,title:l,"aria-label":s,"aria-pressed":o??c,className:[i,!0===o?"dark":!1===o?"light":void 0].filter(Boolean).join(" "),children:(0,t.jsxs)("svg",{width:"1em",height:"1em",viewBox:"0 0 32 32","aria-hidden":"true",fill:"currentColor",style:{"--toggles-around--duration":`${e}ms`},children:[(0,t.jsx)("defs",{children:(0,t.jsx)("clipPath",{id:d,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:[transform:rotate(-90deg)] motion-safe:dark:[transition:transform_var(--toggles-around--duration)_ease]",children:(0,t.jsx)("path",{d:"M0 0h42v30a1 1 0 00-16 13H0Z",className:"motion-safe:transition-[d,translate] motion-safe:[transition-duration:calc(var(--toggles-around--duration)_*_0.6)] motion-safe:[transition-timing-function:ease] dark:[d:path('M-12_-14h42v30a1_1_0_00-16_13H0Z')] dark:not-supports-[d:path('M0_0')]:-translate-x-[12px] dark:not-supports-[d:path('M0_0')]:-translate-y-[14px] motion-safe:dark:[transition-duration:var(--toggles-around--duration)]"})})}),(0,t.jsxs)("g",{clipPath:`url(#${d})`,children:[(0,t.jsx)("circle",{cx:16,cy:16,r:8.4,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] dark:[transform:scale(1.4)] motion-safe:dark:[transition:transform_var(--toggles-around--duration)_ease]"}),(0,t.jsxs)("g",{children:[(0,t.jsx)("circle",{cx:16,cy:3.3,r:2.3,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.253)] dark:[transform:scale(0)] motion-safe:dark:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"}),(0,t.jsx)("circle",{cx:27,cy:9.7,r:2.3,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.348)] dark:[transform:scale(0)] motion-safe:dark:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"}),(0,t.jsx)("circle",{cx:27,cy:22.3,r:2.3,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.443)] dark:[transform:scale(0)] motion-safe:dark:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"}),(0,t.jsx)("circle",{cx:16,cy:28.7,r:2.3,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.538)] dark:[transform:scale(0)] motion-safe:dark:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"}),(0,t.jsx)("circle",{cx:5,cy:22.3,r:2.3,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.633)] dark:[transform:scale(0)] motion-safe:dark:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"}),(0,t.jsx)("circle",{cx:5,cy:9.7,r:2.3,className:"[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.728)] dark:[transform:scale(0)] motion-safe:dark:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"})]})]})]})})}e.i(46932);var o=e.i(56420);let i={name:"grip-horizontal",size:24,node:[["circle",{cx:"12",cy:"9",r:"1",key:"124mty"}],["circle",{cx:"19",cy:"9",r:"1",key:"1ruzo2"}],["circle",{cx:"5",cy:"9",r:"1",key:"1a8b28"}],["circle",{cx:"12",cy:"15",r:"1",key:"1e56xg"}],["circle",{cx:"19",cy:"15",r:"1",key:"1a92ep"}],["circle",{cx:"5",cy:"15",r:"1",key:"5r1jwy"}]]};i.node,(0,o.default)(i);var a=e.i(63178),l=e.i(79862);let s=e=>{switch(e){case"top-left":return{cx:"0",cy:"0"};case"top-right":return{cx:"40",cy:"0"};case"bottom-left":return{cx:"0",cy:"40"};case"bottom-right":return{cx:"40",cy:"40"};case"top-center":return{cx:"20",cy:"0"};case"bottom-center":return{cx:"20",cy:"40"};case"bottom-up":case"top-down":case"left-right":case"right-left":return{cx:"20",cy:"20"}}},c=(e,t="center",r=!1,n)=>{let o=((e,t)=>{if("circle-blur"===e){if("center"===t)return'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>';let e=s(t);if(!e)throw Error(`Invalid start position: ${t}`);let{cx:r,cy:n}=e;return`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${r}" cy="${n}" r="18" fill="white" filter="url(%23blur)"/></svg>`}if("center"===t)return;if("rectangle"===e)return"";let r=s(t);if(!r)throw Error(`Invalid start position: ${t}`);let{cx:n,cy:o}=r;return"circle"===e?`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${n}" cy="${o}" r="20" fill="white"/></svg>`:""})(e,t),i=(e=>{switch(e){case"top-left":return"top left";case"top-right":return"top right";case"bottom-left":return"bottom left";case"bottom-right":return"bottom right";case"top-center":return"top center";case"bottom-center":return"bottom center";case"bottom-up":case"top-down":case"left-right":case"right-left":return"center"}})(t);if("rectangle"===e){let n=(e=>{switch(e){case"bottom-up":default:return{from:"polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"top-down":return{from:"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"left-right":return{from:"polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"right-left":return{from:"polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"top-left":return{from:"polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"top-right":return{from:"polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"bottom-left":return{from:"polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"};case"bottom-right":return{from:"polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",to:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"}}})(t);return{name:`${e}-${t}${r?"-blur":""}`,css:`
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${t}${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${t}${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      @keyframes reveal-dark-${t}${r?"-blur":""} {
        from {
          clip-path: ${n.from};
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: ${n.to};
          ${r?"filter: blur(0px);":""}
        }
      }

      @keyframes reveal-light-${t}${r?"-blur":""} {
        from {
          clip-path: ${n.from};
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: ${n.to};
          ${r?"filter: blur(0px);":""}
        }
      }
      `}}if("circle"===e&&"center"==t)return{name:`${e}-${t}${r?"-blur":""}`,css:`
       ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      @keyframes reveal-dark${r?"-blur":""} {
        from {
          clip-path: circle(0% at 50% 50%);
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: circle(100.0% at 50% 50%);
          ${r?"filter: blur(0px);":""}
        }
      }

      @keyframes reveal-light${r?"-blur":""} {
        from {
           clip-path: circle(0% at 50% 50%);
           ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: circle(100.0% at 50% 50%);
          ${r?"filter: blur(0px);":""}
        }
      }
      `};if("gif"===e)return{name:`${e}-${t}`,css:`
      ::view-transition-group(root) {
  animation-timing-function: var(--expo-in);
}

::view-transition-new(root) {
  mask: url('${n}') center / 0 no-repeat;
  animation: scale 3s;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: scale 3s;
}

@keyframes scale {
  0% {
    mask-size: 0;
  }
  10% {
    mask-size: 50vmax;
  }
  90% {
    mask-size: 50vmax;
  }
  100% {
    mask-size: 2000vmax;
  }
}`};if("circle-blur"===e)return"center"===t?{name:`${e}-${t}`,css:`
        ::view-transition-group(root) {
          animation-timing-function: var(--expo-out);
        }

        ::view-transition-new(root) {
          mask: url('${o}') center / 0 no-repeat;
          mask-origin: content-box;
          animation: scale 1s;
          transform-origin: center;
        }

        ::view-transition-old(root),
        .dark::view-transition-old(root) {
          animation: scale 1s;
          transform-origin: center;
          z-index: -1;
        }

        @keyframes scale {
          to {
            mask-size: 350vmax;
          }
        }
        `}:{name:`${e}-${t}`,css:`
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        mask: url('${o}') ${t.replace("-"," ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale 1s;
        transform-origin: ${i};
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale 1s;
        transform-origin: ${i};
        z-index: -1;
      }

      @keyframes scale {
        to {
          mask-size: 350vmax;
        }
      }
      `};if("polygon"===e){let n=(e=>{switch(e){case"top-left":default:return{darkFrom:"polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)",darkTo:"polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)",lightFrom:"polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)",lightTo:"polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)"};case"top-right":return{darkFrom:"polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)",darkTo:"polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)",lightFrom:"polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)",lightTo:"polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)"}}})(t);return{name:`${e}-${t}${r?"-blur":""}`,css:`
      ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${t}${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${t}${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      @keyframes reveal-dark-${t}${r?"-blur":""} {
        from {
          clip-path: ${n.darkFrom};
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: ${n.darkTo};
          ${r?"filter: blur(0px);":""}
        }
      }

      @keyframes reveal-light-${t}${r?"-blur":""} {
        from {
          clip-path: ${n.lightFrom};
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: ${n.lightTo};
          ${r?"filter: blur(0px);":""}
        }
      }
      `}}if("circle"===e&&"center"!==t){let n=(e=>{switch(e){case"top-left":return"0% 0%";case"top-right":return"100% 0%";case"bottom-left":return"0% 100%";case"bottom-right":return"100% 100%";case"top-center":return"50% 0%";case"bottom-center":return"50% 100%";default:return"50% 50%"}})(t);return{name:`${e}-${t}${r?"-blur":""}`,css:`
       ::view-transition-group(root) {
        animation-duration: 1s;
        animation-timing-function: var(--expo-out);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${t}${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${t}${r?"-blur":""};
        ${r?"filter: blur(2px);":""}
      }

      @keyframes reveal-dark-${t}${r?"-blur":""} {
        from {
          clip-path: circle(0% at ${n});
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: circle(150.0% at ${n});
          ${r?"filter: blur(0px);":""}
        }
      }

      @keyframes reveal-light-${t}${r?"-blur":""} {
        from {
           clip-path: circle(0% at ${n});
           ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          clip-path: circle(150.0% at ${n});
          ${r?"filter: blur(0px);":""}
        }
      }
      `}}return{name:`${e}-${t}${r?"-blur":""}`,css:`
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-in);
      }
      ::view-transition-new(root) {
        mask: url('${o}') ${t.replace("-"," ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${t}${r?"-blur":""} 1s;
        transform-origin: ${i};
        ${r?"filter: blur(2px);":""}
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale-${t}${r?"-blur":""} 1s;
        transform-origin: ${i};
        z-index: -1;
      }
      @keyframes scale-${t}${r?"-blur":""} {
        from {
          ${r?"filter: blur(8px);":""}
        }
        ${r?"50% { filter: blur(4px); }":""}
        to {
          mask-size: 2000vmax;
          ${r?"filter: blur(0px);":""}
        }
      }
    `}};e.s(["ThemeToggle",0,function({className:e,tone:o="default"}){let{toggleTheme:i}=(({variant:e="circle",start:t="center",blur:n=!1,gifUrl:o=""}={})=>{let{theme:i,setTheme:l,resolvedTheme:s}=(0,a.useTheme)(),u="theme-transition-styles",f=(0,r.useCallback)(e=>{let t=document.getElementById(u);t||((t=document.createElement("style")).id=u,document.head.appendChild(t)),t.textContent=e},[]),d=(0,r.useCallback)(()=>{f(c(e,t,n,o).css);let r=()=>{l("light"===i?"dark":"light")};document.startViewTransition?document.startViewTransition(r):r()},[i,l,e,t,n,o,f]),m=(0,r.useCallback)(()=>{f(c(e,t,n,o).css);let r=()=>{l("light")};document.startViewTransition?document.startViewTransition(r):r()},[l,e,t,n,o,f]);return{isDark:"dark"===s,toggleTheme:d,setCrazyLightTheme:m,setCrazyDarkTheme:(0,r.useCallback)(()=>{f(c(e,t,n,o).css);let r=()=>{l("dark")};document.startViewTransition?document.startViewTransition(r):r()},[l,e,t,n,o,f]),setCrazySystemTheme:(0,r.useCallback)(()=>{f(c(e,t,n,o).css);let r=()=>{l("system")};document.startViewTransition?document.startViewTransition(r):r()},[l,e,t,n,o,f])}})({variant:"circle-blur",blur:!0,start:"top-right"});return(0,t.jsx)(n,{onClick:i,"aria-label":"Toggle theme",className:(0,l.cn)("inline-flex size-8 items-center justify-center rounded-full p-0 [&_svg]:size-6","inverted"===o?"!bg-foreground !text-background dark:!bg-white dark:!text-zinc-950":"border border-black/10 dark:border-white/20","focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",e)})}],8945)}]);