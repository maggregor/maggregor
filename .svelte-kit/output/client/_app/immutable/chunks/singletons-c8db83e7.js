import{w as c}from"./index-cd8917bb.js";const m="";let h="";function w(e){h=e}let _="";function A(e){_=e}const R="sveltekit:snapshot",I="sveltekit:scroll",S="sveltekit:index",f={tap:1,hover:2,viewport:3,eager:4,off:-1};function y(e){let t=e.baseURI;if(!t){const n=e.getElementsByTagName("base");t=n.length?n[0].href:e.URL}return t}function T(){return{x:pageXOffset,y:pageYOffset}}function l(e,t){return e.getAttribute(`data-sveltekit-${t}`)}const d={...f,"":f.hover};function g(e){let t=e.assignedSlot??e.parentNode;return(t==null?void 0:t.nodeType)===11&&(t=t.host),t}function x(e,t){for(;e&&e!==t;){if(e.nodeName.toUpperCase()==="A"&&e.hasAttribute("href"))return e;e=g(e)}}function O(e,t){let n;try{n=new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI)}catch{}const a=e instanceof SVGAElement?e.target.baseVal:e.target,s=!n||!!a||v(n,t)||(e.getAttribute("rel")||"").split(/\s+/).includes("external")||e.hasAttribute("download");return{url:n,external:s,target:a}}function U(e){let t=null,n=null,a=null,s=null,o=e;for(;o&&o!==document.documentElement;)n===null&&(n=l(o,"preload-code")),a===null&&(a=l(o,"preload-data")),t===null&&(t=l(o,"noscroll")),s===null&&(s=l(o,"reload")),o=g(o);return{preload_code:d[n??"off"],preload_data:d[a??"off"],noscroll:t==="off"?!1:t===""?!0:null,reload:s==="off"?!1:s===""?!0:null}}function p(e){const t=c(e);let n=!0;function a(){n=!0,t.update(r=>r)}function s(r){n=!1,t.set(r)}function o(r){let i;return t.subscribe(u=>{(i===void 0||n&&u!==i)&&r(i=u)})}return{notify:a,set:s,subscribe:o}}function b(){const{set:e,subscribe:t}=c(!1);let n;async function a(){clearTimeout(n);const s=await fetch(`${h}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(s.ok){const r=(await s.json()).version!==_;return r&&(e(!0),clearTimeout(n)),r}else throw new Error(`Version check failed: ${s.status}`)}return{subscribe:t,check:a}}function v(e,t){return e.origin!==location.origin||!e.pathname.startsWith(t)}let E;function L(e){E=e.client}const N={url:p({}),page:p({}),navigating:c(null),updated:b()};export{S as I,f as P,I as S,R as a,O as b,U as c,T as d,m as e,x as f,y as g,L as h,v as i,w as j,A as k,E as l,N as s};
