function h(){}function J(t,e){for(const n in e)t[n]=e[n];return t}function L(t){return t()}function M(){return Object.create(null)}function g(t){t.forEach(L)}function T(t){return typeof t=="function"}function at(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let b;function dt(t,e){return b||(b=document.createElement("a")),b.href=e,t===b.href}function K(t){return Object.keys(t).length===0}function Q(t,...e){if(t==null)return h;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function _t(t,e,n){t.$$.on_destroy.push(Q(e,n))}function ht(t,e,n,i){if(t){const r=P(t,e,n,i);return t[0](r)}}function P(t,e,n,i){return t[1]&&i?J(n.ctx.slice(),t[1](i(e))):n.ctx}function mt(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const u=[],o=Math.max(e.dirty.length,r.length);for(let s=0;s<o;s+=1)u[s]=e.dirty[s]|r[s];return u}return e.dirty|r}return e.dirty}function pt(t,e,n,i,r,u){if(r){const o=P(e,n,i,u);t.p(o,r)}}function yt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function gt(t){return t??""}function xt(t){return t&&T(t.destroy)?t.destroy:h}const z=typeof window<"u";let bt=z?()=>window.performance.now():()=>Date.now(),B=z?t=>requestAnimationFrame(t):h;const _=new Set;function H(t){_.forEach(e=>{e.c(t)||(_.delete(e),e.f())}),_.size!==0&&B(H)}function wt(t){let e;return _.size===0&&B(H),{promise:new Promise(n=>{_.add(e={c:t,f:n})}),abort(){_.delete(e)}}}let v=!1;function U(){v=!0}function V(){v=!1}function X(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function Y(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let l=0;l<e.length;l++){const a=e[l];a.claim_order!==void 0&&c.push(a)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let c=0;c<e.length;c++){const l=e[c].claim_order,a=(r>0&&e[n[r]].claim_order<=l?r+1:X(1,r,x=>e[n[x]].claim_order,l))-1;i[c]=n[a]+1;const f=a+1;n[f]=c,r=Math.max(f,r)}const u=[],o=[];let s=e.length-1;for(let c=n[r]+1;c!=0;c=i[c-1]){for(u.push(e[c-1]);s>=c;s--)o.push(e[s]);s--}for(;s>=0;s--)o.push(e[s]);u.reverse(),o.sort((c,l)=>c.claim_order-l.claim_order);for(let c=0,l=0;c<o.length;c++){for(;l<u.length&&o[c].claim_order>=u[l].claim_order;)l++;const a=l<u.length?u[l]:null;t.insertBefore(o[c],a)}}function Z(t,e){if(v){for(Y(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function $t(t,e,n){v&&!n?Z(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function tt(t){t.parentNode&&t.parentNode.removeChild(t)}function Et(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function et(t){return document.createElement(t)}function nt(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function j(t){return document.createTextNode(t)}function vt(){return j(" ")}function Nt(){return j("")}function At(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function St(t){return function(e){return e.preventDefault(),t.call(this,e)}}function Tt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function it(t){return Array.from(t.childNodes)}function rt(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function O(t,e,n,i,r=!1){rt(t);const u=(()=>{for(let o=t.claim_info.last_index;o<t.length;o++){const s=t[o];if(e(s)){const c=n(s);return c===void 0?t.splice(o,1):t[o]=c,r||(t.claim_info.last_index=o),s}}for(let o=t.claim_info.last_index-1;o>=0;o--){const s=t[o];if(e(s)){const c=n(s);return c===void 0?t.splice(o,1):t[o]=c,r?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=o,s}}return i()})();return u.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,u}function F(t,e,n,i){return O(t,r=>r.nodeName===e,r=>{const u=[];for(let o=0;o<r.attributes.length;o++){const s=r.attributes[o];n[s.name]||u.push(s.name)}u.forEach(o=>r.removeAttribute(o))},()=>i(e))}function jt(t,e,n){return F(t,e,n,et)}function Ct(t,e,n){return F(t,e,n,nt)}function ot(t,e){return O(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>j(e),!0)}function Dt(t){return ot(t," ")}function Mt(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function kt(t,e,n,i){n===null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function qt(t,e,n){t.classList[n?"add":"remove"](e)}function Lt(t,e){const n=[];let i=0;for(const r of e.childNodes)if(r.nodeType===8){const u=r.textContent.trim();u===`HEAD_${t}_END`?(i-=1,n.push(r)):u===`HEAD_${t}_START`&&(i+=1,n.push(r))}else i>0&&n.push(r);return n}function Pt(t,e){return new t(e)}let y;function p(t){y=t}function R(){if(!y)throw new Error("Function called outside component initialization");return y}function zt(t){R().$$.on_mount.push(t)}function Bt(t){R().$$.after_update.push(t)}const m=[],k=[],$=[],q=[],W=Promise.resolve();let A=!1;function G(){A||(A=!0,W.then(I))}function Ht(){return G(),W}function S(t){$.push(t)}const N=new Set;let w=0;function I(){const t=y;do{for(;w<m.length;){const e=m[w];w++,p(e),ct(e.$$)}for(p(null),m.length=0,w=0;k.length;)k.pop()();for(let e=0;e<$.length;e+=1){const n=$[e];N.has(n)||(N.add(n),n())}$.length=0}while(m.length);for(;q.length;)q.pop()();A=!1,N.clear(),p(t)}function ct(t){if(t.fragment!==null){t.update(),g(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(S)}}const E=new Set;let d;function Ot(){d={r:0,c:[],p:d}}function Ft(){d.r||g(d.c),d=d.p}function lt(t,e){t&&t.i&&(E.delete(t),t.i(e))}function Rt(t,e,n,i){if(t&&t.o){if(E.has(t))return;E.add(t),d.c.push(()=>{E.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}const Wt=typeof window<"u"?window:typeof globalThis<"u"?globalThis:global;function Gt(t){t&&t.c()}function It(t,e){t&&t.l(e)}function st(t,e,n,i){const{fragment:r,after_update:u}=t.$$;r&&r.m(e,n),i||S(()=>{const o=t.$$.on_mount.map(L).filter(T);t.$$.on_destroy?t.$$.on_destroy.push(...o):g(o),t.$$.on_mount=[]}),u.forEach(S)}function ut(t,e){const n=t.$$;n.fragment!==null&&(g(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function ft(t,e){t.$$.dirty[0]===-1&&(m.push(t),G(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Jt(t,e,n,i,r,u,o,s=[-1]){const c=y;p(t);const l=t.$$={fragment:null,ctx:[],props:u,update:h,not_equal:r,bound:M(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:M(),dirty:s,skip_bound:!1,root:e.target||c.$$.root};o&&o(l.root);let a=!1;if(l.ctx=n?n(t,e.props||{},(f,x,...C)=>{const D=C.length?C[0]:x;return l.ctx&&r(l.ctx[f],l.ctx[f]=D)&&(!l.skip_bound&&l.bound[f]&&l.bound[f](D),a&&ft(t,f)),x}):[],l.update(),a=!0,g(l.before_update),l.fragment=i?i(l.ctx):!1,e.target){if(e.hydrate){U();const f=it(e.target);l.fragment&&l.fragment.l(f),f.forEach(tt)}else l.fragment&&l.fragment.c();e.intro&&lt(t.$$.fragment),st(t,e.target,e.anchor,e.customElement),V(),I()}p(c)}class Kt{$destroy(){ut(this,1),this.$destroy=h}$on(e,n){if(!T(n))return h;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const r=i.indexOf(n);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!K(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}export{ut as A,Ht as B,h as C,nt as D,Ct as E,dt as F,Z as G,_t as H,ht as I,pt as J,yt as K,mt as L,bt as M,wt as N,At as O,g as P,Lt as Q,qt as R,Kt as S,xt as T,Et as U,Wt as V,T as W,St as X,gt as Y,vt as a,$t as b,Dt as c,Ft as d,Nt as e,lt as f,Ot as g,tt as h,Jt as i,Bt as j,et as k,jt as l,it as m,Tt as n,zt as o,kt as p,j as q,ot as r,at as s,Rt as t,Mt as u,k as v,Pt as w,Gt as x,It as y,st as z};
