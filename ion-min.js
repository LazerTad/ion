// Generated by CoffeeScript 1.3.3
(function(){var e,t,n,r,i,s,o,u,a;t=function(){function e(e,t,n,r){this.symbol=e,this.type=t,this.text=n!=null?n:this.type,this.value=r}return e.prototype.toJSON=function(){return this.symbol?this.type:this.value},e.prototype.toString=function(){return this.text},e}(),a=function(e){return e.match(/^\s*null\s*$/)?null:e.match(/^\s*(true|false)\s*$/)?Boolean(e.trim()):e.match(/^\s*[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?\s*$/)?Number(e.trim()):e.match(/^\s*\d\d\d\d-\d\d-\d\d(T\d\d:\d\d(:\d\d(\.\d{1,3})?)?(Z|([+-]\d\d:\d\d))?)?\s*$/)?new Date(e.trim()):e.match(/^\s*{}\s*$/)?{}:e.trim()},u=[[/^\s*#.*/,function(e){return null}],[/^\s*\[/,function(e){return new t(!0,"[",e)}],[/^\s*\]/,function(e){return new t(!0,"]",e)}],[/^\s*:/,function(e){return new t(!0,":",e)}],[/^\s*,/,function(e){return new t(!0,",",e)}],[/^\s*"([^"\\]|(\\([\/'"\\bfnrt]|(u[a-fA-F0-9]{4}))))*"/,function(e){return new t(!1,"quoted",e,JSON.parse(e))}],[/^[^,:\[\]#]+/,function(e){return new t(!1,"unquoted",e,a(e))}]],o=function(e){var t,n,r,i,s,o,a,f;if(e.trim().length===0)return null;s=[];while(e.trim().length>0){n=!1;for(a=0,f=u.length;a<f;a++){o=u[a],t=e.match(o[0]);if(t!=null){n=!0,i=o[1](r=t[0]),i!=null&&s.push(i),e=e.substring(r.length);break}}if(!n)throw new Error(e)}return s},e=function(){function e(e,t,n){var r,s,u,a;this.lineNumber=e,this.line=t,this.indent=n,t!=null&&(this.tokens=o(t),this.isText=i(this.tokens),((s=this.tokens)!=null?s.length:void 0)>=2&&!(r=this.tokens[0]).symbol&&this.tokens[1].type===":"&&(this.key=r.value),this.hasColon=this.key!=null||((u=this.tokens)!=null?(a=u[0])!=null?a.type:void 0:void 0)===":")}return e.prototype.error=function(e,t){var n;return n=new Error(""+e+", line:"+this.lineNumber),n.lineNumber=this.lineNumber,n.line=this.line,n},e.prototype.getAllDescendantLines=function(e,t){var n,r,i,s;e==null&&(e=[]),t==null&&(t=this.indent+1);if(this.children!=null){s=this.children;for(r=0,i=s.length;r<i;r++)n=s[r],e.push(n.line.substring(t)),n.getAllDescendantLines(e,t)}return e},e.prototype.getComplexType=function(){var e,t,n,r,i,s,o,u,a,f,l;n=((a=this.tokens)!=null?a.length:void 0)>=3?(f=this.tokens)!=null?f.slice(2).join("").trim():void 0:void 0;if(n!=null)return n;s=0,r=0,i={},t=!1,l=this.children;for(o=0,u=l.length;o<u;o++){e=l[o];if(e.isText&&!e.key||e.children!=null&&!e.hasColon)return'""';e.tokens&&(s++,e.key&&(r++,i[e.key]&&(t=!0),i[e.key]=!0))}if(t||s>0&&r===0)return"[]";if(r===s)return"{}";throw this.error("Inconsistent child keyCount")},e.prototype.getSimpleValue=function(){var e,t;e=this.tokens;if(e.length===0)return void 0;this.key?e=e.slice(2):this.hasColon&&(e=e.slice(1));if(e.length===0)return null;if(e.length>=2&&e[0].type==="["&&e[e.length-1].type==="]"&&(t=n(e.slice(1,-1))))return t;if(!this.isText){if(e.length===1)return e[0].value;if(t=n(e))return t}return e.join("").trim()},e.prototype.doChildrenHaveKeys=function(){var e,t,n,r;r=this.children;for(t=0,n=r.length;t<n;t++){e=r[t];if(e.key!=null)return!0}return!1},e.prototype.getComplexValue=function(){var e,t,n,r,i,s,o,u,a,f,l;r=this.getComplexType();if(r==='""')i=this.getAllDescendantLines().join("\n");else if(r==="[]")if(this.doChildrenHaveKeys()){i=[],t=null,f=this.children;for(s=0,u=f.length;s<u;s++){e=f[s];if(!e.tokens)continue;n=e.key,(t===null||t.hasOwnProperty(n))&&i.push(t={}),t[n]=e.getValue()}}else i=function(){var t,n,r,i;r=this.children,i=[];for(t=0,n=r.length;t<n;t++)e=r[t],e.tokens&&i.push(e.getValue());return i}.call(this);else{i={},l=this.children;for(o=0,a=l.length;o<a;o++)e=l[o],e.tokens&&(i[e.key]=e.getValue())}return i},e.prototype.getValue=function(){var e;if(this.children!=null){if(this.isText)throw this.children[0].error("Children not expected");e=this.getComplexValue()}else e=this.getSimpleValue();return e},e}(),i=function(e){var t,n,r,i,s;if(e){t=/[^\s\w]/;for(i=0,s=e.length;i<s;i++){n=e[i];if(n.type==="unquoted"){r=n.value;if(typeof r=="string"&&t.test(r))return!0}}}return!1},n=function(e){var t,n,r,i,s;for(t=i=0,s=e.length;i<s;t=++i){r=e[t];if(t%2===0){if(r.symbol)return null}else if(r.type!==",")return null}return function(){var t,r,i,s;i=[];for(t=0,r=e.length,s=2;t<r;t+=s)n=e[t],i.push(n.value);return i}()},s=function(t){var n,r,i,s,o,u,a;i=new e(null,null,-1),s=[i];for(o=0,u=t.length;o<u;o++){n=t[o];while(n.indent<=(r=s[s.length-1]).indent)s.pop();((a=r.children)!=null?a:r.children=[]).push(n),s.push(n)}return i},r={parse:function(t,n){var r,i,o,u,a,f,l,c,h,p,d,v;t=t.trim(),u=[],h=t.split("\r\n");for(i=l=0,c=h.length;l<c;i=++l){o=h[i];if(o.trim()[0]==="#")continue;r=(p=o.trim().length===0?r:r=(d=o.match(/^\s*/))!=null?(v=d[0])!=null?v.length:void 0:void 0)!=null?p:0,u.push(new e(i+1,o,r))}return a=s(u),f=a.getValue(),f}},typeof module=="undefined"?function(){return this.ion=r}():module.exports=r}).call(this);