(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,43698,e=>{"use strict";var t=e.i(43476),r=e.i(71645);let a={heykeller:"#c5a059",saraylar:"#9b6fd0","tarihi-yapilar":"#4a9ead",spor:"#e11d48","dini-kamusal":"#5a9a6b"},o={heykeller:"🗿",saraylar:"🏰","tarihi-yapilar":"🏛️",spor:"🏟️","dini-kamusal":"⛪"};e.s(["default",0,function({pins:n,onPinClick:s}){let l=(0,r.useRef)(null),i=(0,r.useRef)(null),c=(0,r.useRef)(null),u=(0,r.useRef)(s),[p,d]=(0,r.useState)(!1),[m,f]=(0,r.useState)(14);return(0,r.useEffect)(()=>{u.current=s},[s]),(0,r.useEffect)(()=>{if(!l.current||i.current)return;let t=!1;return Promise.all([e.A(71400),e.A(97880)]).then(([e])=>{if(t||!l.current)return;let r=e.default||e;r.Icon&&r.Icon.Default&&r.Icon.Default.prototype&&r.Icon.Default.prototype._getIconUrl&&(delete r.Icon.Default.prototype._getIconUrl,r.Icon.Default.mergeOptions({iconRetinaUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"}));let a=r.map(l.current,{center:[41.043,29.005],zoom:14.5,minZoom:13.5,maxZoom:18,zoomControl:!0,attributionControl:!1});r.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(a),f(a.getZoom()),a.on("zoomend",()=>{f(Math.round(10*a.getZoom())/10)}),i.current=a,d(!0)}),()=>{t=!0,i.current&&(i.current.remove(),i.current=null)}},[]),(0,r.useEffect)(()=>{p&&i.current&&e.A(71400).then(e=>{if(!i.current)return;c.current&&(c.current.clearLayers(),i.current.removeLayer(c.current));let t=e.markerClusterGroup({showCoverageOnHover:!1,maxClusterRadius:40});n.forEach(r=>{let n=a[r.category]??"#c5a059",s=o[r.category]??"📍",l=36;m<=12?l=28:13===m?l=32:14===m?l=36:15===m?l=40:m>=16&&(l=44);let i=e.divIcon({html:`
            <div style="
              width:${l}px;height:${l}px;
              border-radius:50%;
              background:${n}28;
              border:2px solid ${n};
              display:flex;align-items:center;justify-content:center;
              font-size:${.45*l}px;
              cursor:pointer;
              box-shadow:0 4px 20px rgba(0,0,0,0.7);
              position:relative;
            ">
              ${s}
              <span style="
                position:absolute;
                inset:-6px;
                border-radius:50%;
                border:1.5px solid ${n};
                animation:pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite;
                opacity:0.5;
                pointer-events:none;
              "></span>
            </div>
          `,className:"",iconSize:[l,l],iconAnchor:[l/2,l/2],popupAnchor:[0,-l/2]}),c=e.marker(r.coordinates,{icon:i}).on("click",()=>u.current(r));c.bindTooltip(`<div style="
            background:#14161d;
            border:2px solid rgba(255,255,255,0.2);
            border-radius:8px;padding:7px 12px;
            font-family:Inter,sans-serif;font-size:12px;
            color:#f3f4f6;white-space:nowrap;
            box-shadow:0 4px 16px rgba(0,0,0,0.5);
          ">
            <strong style="color:${n}">${r.title}</strong><br>
            <span style="color:#9ca3af;font-size:11px">${r.categoryLabel}</span>
            ${r.era?`<br><span style="color:#6b7280;font-size:10px">📅 ${r.era}</span>`:""}
          </div>`,{permanent:!1,direction:"top",offset:[0,-8],className:"custom-tooltip",opacity:1}),t.addLayer(c)}),i.current.addLayer(t),c.current=t})},[n,p,m]),(0,t.jsxs)("div",{className:"relative w-full h-full",style:{minHeight:"100vh"},children:[(0,t.jsx)("div",{ref:l,id:"besiktas-interactive-map",className:"w-full h-full absolute inset-0"}),(0,t.jsxs)("div",{className:"absolute bottom-6 right-6 z-[1000] bg-[#14161d]/90 border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-none",children:[(0,t.jsx)("span",{className:"w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"}),(0,t.jsx)("span",{className:"text-xs font-medium text-gray-300",children:"Yakınlaştırma:"}),(0,t.jsxs)("span",{className:"text-sm font-bold text-[var(--accent)] font-mono tabular-nums",children:[m,"x"]})]})]})}])},70199,function(e){e.n(e.i(43698))},97880,e=>{e.v(t=>Promise.all(["static/chunks/09xnn6_np7kx4.js"].map(t=>e.l(t))).then(()=>t(15258)))},71400,e=>{e.v(t=>Promise.all(["static/chunks/37ux7yg4q_1bo.js"].map(t=>e.l(t))).then(()=>t(32322)))}]);