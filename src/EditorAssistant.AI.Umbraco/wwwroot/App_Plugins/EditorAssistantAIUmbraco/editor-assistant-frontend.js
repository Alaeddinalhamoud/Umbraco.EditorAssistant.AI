import{y as K,i as Y,r as S,t as G}from"./assets/state-G4_ANB4m.js";const M=globalThis,j=r=>r,O=M.trustedTypes,I=O?O.createPolicy("lit-html",{createHTML:r=>r}):void 0,V="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,F="?"+m,Q=`<${F}>`,$=document,H=()=>$.createComment(""),C=r=>r===null||typeof r!="object"&&typeof r!="function",P=Array.isArray,X=r=>P(r)||typeof r?.[Symbol.iterator]=="function",z=`[ 	
\f\r]`,y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,D=/>/g,f=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,W=/"/g,q=/^(?:script|style|textarea|title)$/i,ee=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),b=ee(1),A=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),Z=new WeakMap,x=$.createTreeWalker($,129);function J(r,e){if(!P(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return I!==void 0?I.createHTML(e):e}const te=(r,e)=>{const t=r.length-1,i=[];let s,n=e===2?"<svg>":e===3?"<math>":"",o=y;for(let c=0;c<t;c++){const a=r[c];let h,d,l=-1,u=0;for(;u<a.length&&(o.lastIndex=u,d=o.exec(a),d!==null);)u=o.lastIndex,o===y?d[1]==="!--"?o=R:d[1]!==void 0?o=D:d[2]!==void 0?(q.test(d[2])&&(s=RegExp("</"+d[2],"g")),o=f):d[3]!==void 0&&(o=f):o===f?d[0]===">"?(o=s??y,l=-1):d[1]===void 0?l=-2:(l=o.lastIndex-d[2].length,h=d[1],o=d[3]===void 0?f:d[3]==='"'?W:U):o===W||o===U?o=f:o===R||o===D?o=y:(o=f,s=void 0);const g=o===f&&r[c+1].startsWith("/>")?" ":"";n+=o===y?a+Q:l>=0?(i.push(h),a.slice(0,l)+V+a.slice(l)+m+g):a+m+(l===-2?c:g)}return[J(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class k{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let n=0,o=0;const c=e.length-1,a=this.parts,[h,d]=te(e,t);if(this.el=k.createElement(h,i),x.currentNode=this.el.content,t===2||t===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=x.nextNode())!==null&&a.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(const l of s.getAttributeNames())if(l.endsWith(V)){const u=d[o++],g=s.getAttribute(l).split(m),T=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:T[2],strings:g,ctor:T[1]==="."?se:T[1]==="?"?re:T[1]==="@"?ne:E}),s.removeAttribute(l)}else l.startsWith(m)&&(a.push({type:6,index:n}),s.removeAttribute(l));if(q.test(s.tagName)){const l=s.textContent.split(m),u=l.length-1;if(u>0){s.textContent=O?O.emptyScript:"";for(let g=0;g<u;g++)s.append(l[g],H()),x.nextNode(),a.push({type:2,index:++n});s.append(l[u],H())}}}else if(s.nodeType===8)if(s.data===F)a.push({type:2,index:n});else{let l=-1;for(;(l=s.data.indexOf(m,l+1))!==-1;)a.push({type:7,index:n}),l+=m.length-1}n++}}static createElement(e,t){const i=$.createElement("template");return i.innerHTML=e,i}}function v(r,e,t=r,i){if(e===A)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const n=C(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=v(r,s._$AS(r,e.values),s,i)),e}class ie{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??$).importNode(t,!0);x.currentNode=s;let n=x.nextNode(),o=0,c=0,a=i[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new L(n,n.nextSibling,this,e):a.type===1?h=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(h=new oe(n,this,e)),this._$AV.push(h),a=i[++c]}o!==a?.index&&(n=x.nextNode(),o++)}return x.currentNode=$,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class L{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=v(this,e,t),C(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):X(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&C(this._$AH)?this._$AA.nextSibling.data=e:this.T($.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=k.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const n=new ie(s,this),o=n.u(this.options);n.p(t),this.T(o),this._$AH=n}}_$AC(e){let t=Z.get(e.strings);return t===void 0&&Z.set(e.strings,t=new k(e)),t}k(e){P(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const n of e)s===t.length?t.push(i=new L(this.O(H()),this.O(H()),this,this.options)):i=t[s],i._$AI(n),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=j(e).nextSibling;j(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class E{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(e,t=this,i,s){const n=this.strings;let o=!1;if(n===void 0)e=v(this,e,t,0),o=!C(e)||e!==this._$AH&&e!==A,o&&(this._$AH=e);else{const c=e;let a,h;for(e=n[0],a=0;a<n.length-1;a++)h=v(this,c[i+a],t,a),h===A&&(h=this._$AH[a]),o||=!C(h)||h!==this._$AH[a],h===p?e=p:e!==p&&(e+=(h??"")+n[a+1]),this._$AH[a]=h}o&&!s&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends E{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class re extends E{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class ne extends E{constructor(e,t,i,s,n){super(e,t,i,s,n),this.type=5}_$AI(e,t=this){if((e=v(this,e,t,0)??p)===A)return;const i=this._$AH,s=e===p&&i!==p||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==p&&(i===p||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){v(this,e)}}const ae=M.litHtmlPolyfillSupport;ae?.(k,L),(M.litHtmlVersions??=[]).push("3.3.3");const le=(r,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const n=t?.renderBefore??null;i._$litPart$=s=new L(e.insertBefore(H(),n),n,void 0,t??{})}return s._$AI(r),s};const B=globalThis;class w extends K{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=le(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}}w._$litElement$=!0,w.finalized=!0,B.litElementHydrateSupport?.({LitElement:w});const he=B.litElementPolyfillSupport;he?.({LitElement:w});(B.litElementVersions??=[]).push("4.2.2");var pe=Object.defineProperty,de=Object.getOwnPropertyDescriptor,N=(r,e,t,i)=>{for(var s=i>1?void 0:i?de(e,t):e,n=r.length-1,o;n>=0;n--)(o=r[n])&&(s=(i?o(e,t,s):o(s))||s);return i&&s&&pe(e,t,s),s};let _=class extends w{constructor(){super(...arguments),this._summary="",this._isOpen=!1,this._isLoading=!1,this._error=""}_summaryPoints(){return this._summary.split(/\r?\n/).map(r=>r.replace(/^\s*(?:[-*•]|\d+[.)])\s*/,"").trim()).map(r=>r.replace(/\*\*(.*?)\*\*/g,"$1").replace(/^#+\s*/,"")).filter(Boolean)}async _summarize(){this._isLoading=!0,this._error="";try{const r=await fetch("/umbraco/editorassistantaiumbraco/api/v1/Summarize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:document.body.innerText})});if(!r.ok){const t=await r.json().catch(()=>{});throw new Error(t?.detail??"The page could not be summarized.")}const e=await r.json();this._summary=e.summary,this._isOpen=!0}catch(r){this._error=r instanceof Error?r.message:"The page could not be summarized.",this._isOpen=!0}finally{this._isLoading=!1}}render(){return b`
      <button class="trigger" @click=${this._summarize} ?disabled=${this._isLoading}>
        <svg class="trigger-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path>
          <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"></path>
        </svg>
        <span>${this._isLoading?"Summarizing...":"Summarize page"}</span>
      </button>
      ${this._isOpen?b`
        <div class="overlay" role="presentation" @click=${r=>{r.target===r.currentTarget&&(this._isOpen=!1)}}>
          <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="summary-title">
            <button class="close" aria-label="Close" @click=${()=>this._isOpen=!1}>×</button>
            <div class="dialog-header">
              <div class="header-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path>
                  <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"></path>
                </svg>
              </div>
              <div>
                <h2 id="summary-title">Page summary</h2>
                <p class="subtitle">Here are the key points from this page.</p>
              </div>
            </div>
            ${this._error?b`
                <div class="error-card" role="alert">
                  <span class="status-icon" aria-hidden="true">!</span>
                  <p class="error">${this._error}</p>
                </div>
              `:b`
                <ul class="summary-list">
                  ${this._summaryPoints().map(r=>b`
                    <li>
                      <span class="point-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="m7 12 3 3 7-7"></path>
                        </svg>
                      </span>
                      <span>${r}</span>
                    </li>
                  `)}
                </ul>
              `}
          </section>
        </div>
      `:""}
    `}};_.styles=Y`
    :host {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 10000;
      display: block;
      margin: 0;
      pointer-events: none;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .trigger {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid #ffffff33; border-radius: 999px; padding: 13px 19px;
      color: white; background: linear-gradient(135deg, #4338ca, #7c3aed);
      box-shadow: 0 8px 24px #312e8166, inset 0 1px #ffffff44;
      cursor: pointer; font: 600 14px/1 inherit; transition: transform .18s, box-shadow .18s;
      pointer-events: auto;
    }
    .trigger-icon { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .trigger:hover { transform: translateY(-2px); box-shadow: 0 12px 28px #312e8180, inset 0 1px #ffffff55; }
    .trigger:disabled { opacity: .7; cursor: wait; }
    .overlay {
      position: fixed; inset: 0; display: grid; place-items: center;
      padding: 16px; background: #0008; z-index: 10001;
      pointer-events: auto;
    }
    .dialog {
      position: relative; box-sizing: border-box; width: min(560px, 100%);
      max-height: min(80vh, 720px);
      overflow: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 20px;
      background: linear-gradient(180deg, #ffffff, #f8faff); color: #1f2937;
      box-shadow: 0 24px 70px #11182740;
    }
    .dialog-header { display: flex; align-items: center; gap: 14px; padding-right: 28px; }
    .header-icon {
      display: grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px;
      border-radius: 14px; color: #4f46e5; background: #eef2ff;
    }
    .header-icon svg { width: 25px; height: 25px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    h2 { margin: 0; font-size: 1.3rem; letter-spacing: -.02em; }
    .subtitle { margin: 4px 0 0; color: #667085; font-size: .9rem; line-height: 1.4; }
    .summary-list { display: grid; gap: 12px; margin: 26px 0 0; padding: 0; list-style: none; }
    .summary-list li {
      display: flex; align-items: flex-start; gap: 12px; padding: 15px 16px;
      border: 1px solid #e6e9f2; border-radius: 13px; background: #fff;
      line-height: 1.55; color: #344054;
    }
    .point-icon {
      display: grid; place-items: center; flex: 0 0 23px; width: 23px; height: 23px;
      margin-top: 1px; border-radius: 50%; color: #fff; background: #6366f1;
    }
    .point-icon svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .error-card { display: flex; gap: 12px; align-items: flex-start; margin-top: 24px; padding: 15px; border: 1px solid #fecaca; border-radius: 13px; background: #fff1f2; }
    .status-icon { display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 22px; border-radius: 50%; color: #fff; background: #dc2626; font-weight: 700; }
    .error { margin: 0; color: #b42318; line-height: 1.5; white-space: pre-wrap; }
    .close {
      position: absolute; top: 12px; right: 16px; border: 0; background: none;
      width: 40px; height: 40px; padding: 0; font-size: 1.7rem; cursor: pointer; color: #667085;
    }
    @media (max-width: 600px) {
      :host { right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); }
      .trigger { padding: 12px 15px; }
      .trigger span { display: none; }
      .overlay {
        place-items: end center;
        padding: 12px max(12px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-bottom));
      }
      .dialog {
        width: 100%; max-height: calc(100dvh - 24px); padding: 24px 16px 16px;
        border-radius: 16px;
      }
      .dialog-header { gap: 10px; padding-right: 32px; }
      .header-icon { flex-basis: 38px; width: 38px; height: 38px; border-radius: 12px; }
      .header-icon svg { width: 21px; height: 21px; }
      h2 { font-size: 1.15rem; }
      .subtitle { font-size: .84rem; }
      .summary-list { gap: 8px; margin-top: 18px; }
      .summary-list li { gap: 10px; padding: 12px; line-height: 1.45; }
      .error-card { gap: 10px; margin-top: 18px; padding: 12px; }
      .close { top: 8px; right: 8px; }
    }
  `;N([S()],_.prototype,"_summary",2);N([S()],_.prototype,"_isOpen",2);N([S()],_.prototype,"_isLoading",2);N([S()],_.prototype,"_error",2);_=N([G("editor-assistant-floating-button")],_);if(!window.location.pathname.startsWith("/umbraco")){const r=await fetch("/umbraco/editorassistantaiumbraco/api/v1/Status"),e=r.ok?await r.json():void 0;if(e?.enabled&&e.hasApiKey&&!document.querySelector("editor-assistant-floating-button")){const t=document.createElement("editor-assistant-floating-button");document.body.appendChild(t)}}
//# sourceMappingURL=editor-assistant-frontend.js.map
