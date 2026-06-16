(function(h,u){typeof exports=="object"&&typeof module<"u"?u(exports):typeof define=="function"&&define.amd?define(["exports"],u):(h=typeof globalThis<"u"?globalThis:h||self,u(h.TackSuiteChat={}))})(this,(function(h){"use strict";const u="https://app.tacksuite.it",m="#517569",w="#25D366",y="#f3f4f6",x="right";function C(l){const t=l.replace("#","").trim();if(t.length!==3&&t.length!==6)return"#111827";const e=t.length===3?t.split("").map(o=>o+o).join(""):t,s=parseInt(e.slice(0,2),16),i=parseInt(e.slice(2,4),16),n=parseInt(e.slice(4,6),16);return[s,i,n].some(o=>Number.isNaN(o))||(.299*s+.587*i+.114*n)/255>.6?"#111827":"#ffffff"}const k='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',_='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>',T='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';function v(l,t,e,s,i){const n=t,c=t==="right"?"left":"right",o=t==="right"?"bottom right":"bottom left",b=Math.round(e*(24/56)),p=Math.round(e*.55),a=e+32,r=e+30,d=Math.max(8,Math.round(e/2-6));return`
    :host {
      position: fixed;
      bottom: 20px;
      ${n}: 20px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .ts-button {
      width: ${e}px;
      height: ${e}px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: ${l};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      padding: 0;
      outline: none;
    }

    .ts-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .ts-button:active {
      transform: scale(0.97);
    }

    .ts-button svg {
      width: ${b}px;
      height: ${b}px;
      pointer-events: none;
    }

    .ts-button--whatsapp svg {
      width: ${p}px;
      height: ${p}px;
    }

    .ts-panel {
      position: fixed;
      bottom: ${a}px;
      ${n}: 20px;
      ${c}: auto;
      width: 400px;
      height: min(680px, calc(100dvh - ${a+20}px));
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
      transform-origin: ${o};
      transition: opacity 0.2s ease-out, transform 0.2s ease-out;
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    .ts-panel.ts-hidden {
      opacity: 0;
      transform: scale(0.95) translateY(8px);
      pointer-events: none;
    }

    .ts-panel iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: white;
    }

    .ts-bubble {
      position: fixed;
      bottom: ${r}px;
      ${n}: 20px;
      ${c}: auto;
      max-width: min(260px, calc(100vw - 80px));
      background: ${s};
      color: ${i};
      padding: 10px 14px;
      padding-right: 32px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.35;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      transition: opacity 0.25s ease-out, transform 0.25s ease-out;
      cursor: pointer;
      word-wrap: break-word;
    }

    .ts-bubble.ts-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .ts-bubble::after {
      content: "";
      position: absolute;
      bottom: -5px;
      ${n}: ${d}px;
      width: 12px;
      height: 12px;
      background: ${s};
      border-radius: 2px;
      transform: rotate(45deg);
    }

    .ts-bubble-text {
      display: block;
    }

    .ts-bubble.ts-typing {
      padding: 10px 16px;
      text-align: center;
    }

    .ts-bubble.ts-typing .ts-bubble-text,
    .ts-bubble.ts-typing .ts-bubble-close {
      display: none;
    }

    .ts-bubble-typing {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 2px 0;
    }

    .ts-bubble.ts-typing .ts-bubble-typing {
      display: inline-flex;
    }

    .ts-bubble-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.4;
      animation: ts-bubble-typing-bounce 1.2s infinite ease-in-out;
    }

    .ts-bubble-typing-dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .ts-bubble-typing-dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes ts-bubble-typing-bounce {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.35;
      }
      40% {
        transform: translateY(-3px);
        opacity: 1;
      }
    }

    .ts-bubble-close {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: ${i};
      opacity: 0.7;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      border-radius: 50%;
      transition: opacity 0.15s ease, background-color 0.15s ease;
    }

    .ts-bubble-close:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.08);
    }

    @media (max-width: 768px) {
      :host(.ts-open) .ts-button {
        display: none;
      }

      :host(.ts-open) .ts-bubble {
        display: none;
      }

      .ts-panel {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        bottom: 0;
        ${n}: 0;
        transform-origin: bottom center;
      }

      .ts-panel.ts-hidden {
        transform: translateY(100%);
        opacity: 0;
      }
    }
  `}const g="tacksuite-chat-host-styles";function E(){if(typeof document>"u"||document.getElementById(g))return;const l=document.createElement("style");l.id=g,l.textContent=`
    @media (max-width: 768px) {
      html:has(tacksuite-chat.ts-open),
      body:has(tacksuite-chat.ts-open) {
        overflow: hidden;
        overscroll-behavior: none;
      }
    }
  `,(document.head||document.documentElement).appendChild(l)}const R=typeof window<"u"?window.HTMLElement:class{};class f extends R{constructor(){super(),this._isOpen=!1,this._iframeLoaded=!1,this._workspaceConfig=null,this._configRequestController=null,this._configRequestId=0,this._button=null,this._panel=null,this._bubble=null,this._bubbleRevealTimer=null,this._bubbleTypingTimer=null,this._bubbleDismissedForSession=!1,this._config={workspace:"",baseUrl:u,customColor:null,customIcon:null,customPosition:null},this._handlePostMessage=t=>{const e=new URL(this._config.baseUrl).origin;t.origin===e&&this._isCloseMessage(t.data)&&this._close()},this.attachShadow({mode:"open"})}static get observedAttributes(){return["workspace","base-url","color","icon","position"]}attributeChangedCallback(t,e,s){if(e!==s){switch(t){case"workspace":this._config.workspace=s;break;case"base-url":this._config.baseUrl=s||u;break;case"color":this._config.customColor=s||null;break;case"icon":this._config.customIcon=s||null;break;case"position":this._config.customPosition=s==="left"||s==="right"?s:null;break}if(this.isConnected){if(t==="workspace"||t==="base-url"){this._resetWidget(),this._loadWorkspaceConfig();return}this._canRenderWidget()&&this.render()}}}connectedCallback(){E(),this._setupListeners(),this._loadWorkspaceConfig()}disconnectedCallback(){this._configRequestController?.abort(),this._configRequestController=null,this._clearBubbleRevealTimer(),this._teardownListeners()}_isCloseMessage(t){if(t==="close")return!0;if(typeof t!="object"||t===null)return!1;const e=t;return e.type==="close"||e.type==="tacksuite-chat:close"||e.event==="close"||e.action==="close"||e.namespace==="chat-widget/close"}_setupListeners(){window.addEventListener("message",this._handlePostMessage)}_teardownListeners(){window.removeEventListener("message",this._handlePostMessage)}_toggle(){if(this._isWhatsapp()){this._openWhatsapp();return}this._isOpen?this._close():this._open()}_openWhatsapp(){const t=this._getWhatsappHref();if(!t){console.warn("[tacksuite-chat] WhatsApp mode is missing a valid 'phoneNumber'.");return}this._dismissBubble(!0),window.open(t,"_blank","noopener,noreferrer")}_open(){if(!this._config.workspace){console.warn("[tacksuite-chat] Missing required 'workspace' attribute.");return}if(this._canRenderWidget()){if(this._isWhatsapp()){this._openWhatsapp();return}if(this._isOpen=!0,this._dismissBubble(!0),!this._iframeLoaded&&this._panel){const t=document.createElement("iframe");t.src=`${this._config.baseUrl}/chat/${this._config.workspace}`,t.allow="microphone",t.title="TackSuite Chat",this._panel.appendChild(t),this._iframeLoaded=!0}this._updateState()}}_close(){this._isOpen=!1,this._updateState()}_updateState(){this.classList.toggle("ts-open",this._isOpen),this._panel&&this._panel.classList.toggle("ts-hidden",!this._isOpen),this._button&&(this._button.innerHTML=this._isOpen?_:this._getIcon(),this._button.setAttribute("aria-label",this._isOpen?"Close chat":"Open chat"))}_canRenderWidget(){return this._workspaceConfig?.active!==!0?!1:this._isWhatsapp()?this._getWhatsappHref()!==null:!0}_isWhatsapp(){return this._workspaceConfig?.publicChat?.mode==="whatsapp"}_getIcon(){return this._config.customIcon??(this._isWhatsapp()?T:k)}_getWhatsappHref(){const t=this._workspaceConfig?.publicChat?.phoneNumber;if(typeof t!="string")return null;const e=t.replace(/[^\d]/g,"");if(!e)return null;const s=this._workspaceConfig?.publicChat?.whatsappDefaultMessage,i=s?`?text=${encodeURIComponent(s)}`:"";return`https://wa.me/${e}${i}`}_getLauncherColor(){return this._config.customColor??this._workspaceConfig?.publicChat?.primaryColor??(this._isWhatsapp()?w:m)}_getPosition(){return this._config.customPosition??this._workspaceConfig?.publicChat?.buttonPosition??x}_getButtonSize(){const t=this._workspaceConfig?.publicChat?.buttonSize;return typeof t=="number"&&t>0?t:64}_getBubbleMessage(){const t=this._workspaceConfig?.publicChat?.bubbleMessage,e=typeof t=="string"?t.trim():"";if(e)return e;if(this._isWhatsapp()){const s=this._workspaceConfig?.publicChat?.whatsappTitle;return typeof s=="string"?s.trim():""}return e}_getBubbleBackground(){return this._workspaceConfig?.publicChat?.secondaryColor??y}_bubbleStorageKey(){return`tacksuite-chat:bubble-dismissed:${this._config.workspace}`}_readBubbleDismissedFromStorage(){try{return window.sessionStorage?.getItem(this._bubbleStorageKey())==="1"}catch{return!1}}_persistBubbleDismissed(){try{window.sessionStorage?.setItem(this._bubbleStorageKey(),"1")}catch{}}_scheduleBubbleReveal(){this._bubbleRevealTimer==null&&(this._bubbleDismissedForSession||this._isOpen||this._getBubbleMessage()&&this._bubble&&(this._bubbleRevealTimer=window.setTimeout(()=>{this._bubbleRevealTimer=null,!(this._bubbleDismissedForSession||this._isOpen)&&this._bubble&&(this._bubble.classList.add("ts-visible"),this._bubbleTypingTimer=window.setTimeout(()=>{this._bubbleTypingTimer=null,this._bubble&&this._bubble.classList.remove("ts-typing")},1200))},500)))}_clearBubbleRevealTimer(){this._bubbleRevealTimer!=null&&(window.clearTimeout(this._bubbleRevealTimer),this._bubbleRevealTimer=null),this._bubbleTypingTimer!=null&&(window.clearTimeout(this._bubbleTypingTimer),this._bubbleTypingTimer=null)}_dismissBubble(t){this._clearBubbleRevealTimer(),this._bubbleDismissedForSession=!0,this._bubble&&this._bubble.classList.remove("ts-visible"),t&&this._persistBubbleDismissed()}_clearRender(){this.classList.remove("ts-open"),this.shadowRoot?.replaceChildren(),this._button=null,this._panel=null,this._bubble=null}_resetWidget(){this._configRequestController?.abort(),this._configRequestController=null,this._workspaceConfig=null,this._isOpen=!1,this._iframeLoaded=!1,this._clearBubbleRevealTimer(),this._bubbleDismissedForSession=!1,this._clearRender()}async _loadWorkspaceConfig(){if(!this._config.workspace){this._resetWidget(),console.warn("[tacksuite-chat] Missing required 'workspace' attribute.");return}this._resetWidget();const t=++this._configRequestId,e=new AbortController;this._configRequestController=e;try{const s=await fetch(new URL(`/api/workspace/${this._config.workspace}/config`,this._config.baseUrl).toString(),{signal:e.signal});if(!s.ok)throw new Error(`Config request failed with status ${s.status}`);const i=await s.json();if(t!==this._configRequestId||!this.isConnected||this._configRequestController!==e)return;if(this._workspaceConfig=i,this._bubbleDismissedForSession=this._readBubbleDismissedFromStorage(),!this._canRenderWidget()){this._clearRender();return}this.render()}catch(s){if(s.name==="AbortError")return;t===this._configRequestId&&this._configRequestController===e&&(this._workspaceConfig=null,this._clearRender())}finally{this._configRequestController===e&&(this._configRequestController=null)}}render(){const t=this.shadowRoot;if(!t||!this._canRenderWidget()){this._clearRender();return}const e=t.querySelector("iframe");this._clearBubbleRevealTimer(),t.innerHTML="",this._bubble=null;const s=this._getBubbleBackground(),i=C(s),n=document.createElement("style");n.textContent=v(this._getLauncherColor(),this._getPosition(),this._getButtonSize(),s,i),t.appendChild(n);const c=this._isWhatsapp();this._button=document.createElement("button"),this._button.className=c?"ts-button ts-button--whatsapp":"ts-button",this._button.innerHTML=this._isOpen?_:this._getIcon(),this._button.setAttribute("aria-label",c?this._getBubbleMessage()||"Open WhatsApp":this._isOpen?"Close chat":"Open chat"),this._button.addEventListener("click",()=>this._toggle()),c||(this._panel=document.createElement("div"),this._panel.className=`ts-panel${this._isOpen?"":" ts-hidden"}`,e&&this._panel.appendChild(e));const o=this._getBubbleMessage();if(o){this._bubble=document.createElement("div"),this._bubble.className="ts-bubble ts-typing",this._bubble.setAttribute("role","button"),this._bubble.setAttribute("tabindex","0"),this._bubble.setAttribute("aria-label",o);const b=document.createElement("span");b.className="ts-bubble-typing",b.setAttribute("aria-hidden","true");for(let r=0;r<3;r++){const d=document.createElement("span");d.className="ts-bubble-typing-dot",b.appendChild(d)}this._bubble.appendChild(b);const p=document.createElement("span");p.className="ts-bubble-text",p.textContent=o,this._bubble.appendChild(p);const a=document.createElement("button");a.className="ts-bubble-close",a.type="button",a.setAttribute("aria-label","Dismiss"),a.textContent="×",a.addEventListener("click",r=>{r.stopPropagation(),this._dismissBubble(!0)}),this._bubble.appendChild(a),this._bubble.addEventListener("click",()=>{this._open()}),this._bubble.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),this._open())})}this._panel&&t.appendChild(this._panel),t.appendChild(this._button),this._bubble&&(t.appendChild(this._bubble),this._scheduleBubbleReveal())}}typeof window<"u"&&window.customElements&&(customElements.get("tacksuite-chat")||customElements.define("tacksuite-chat",f)),h.TackSuiteChat=f,Object.defineProperty(h,Symbol.toStringTag,{value:"Module"})}));
