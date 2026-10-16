/*
 * seed-sources.js — 把内置点播源写进 LibreTV 的持久化存储，使其成为默认源。
 * 运行于 TvOverlay 的原生 WebView（仅加载 LibreTV 的页面），不影响 Vue 设置页。
 * LibreTV 用 zustand persist 把全量设置存在 localStorage['libretv-settings']，
 * 结构: { state: { customAPIs: [{key,name,url,detail?}], selectedKeys: [] }, version: 2 }
 */
(function () {
  try {
    if (!window.location || window.location.protocol.indexOf('http') !== 0) return;

    var SEED = [
      { key: 'cast_ffzy',     name: '非凡资源', url: 'https://api.ffzyapi.com/api.php/provide/vod/',     detail: 'https://api.ffzyapi.com' },
      { key: 'cast_apibdzy',  name: '百度云资源', url: 'https://api.apibdzy.com/api.php/provide/vod/',     detail: 'https://api.apibdzy.com' },
      { key: 'cast_guangsu',  name: '光速资源', url: 'https://api.guangsuapi.com/api.php/provide/vod/',     detail: 'https://api.guangsuapi.com' },
      { key: 'cast_wujin',    name: '无尽资源', url: 'https://api.wujinapi.com/api.php/provide/vod/',       detail: 'https://api.wujinapi.com' },
      { key: 'cast_huya',     name: '虎牙资源', url: 'https://www.huyaapi.com/api.php/provide/vod/',        detail: 'https://www.huyaapi.com' }
    ];

    var KEY = 'libretv-settings';
    var raw = localStorage.getItem(KEY);
    var obj = null;
    if (raw) { try { obj = JSON.parse(raw); } catch (e) { obj = null; } }
    if (!obj || !obj.state) obj = { state: {}, version: 2 };
    if (!Array.isArray(obj.state.customAPIs)) obj.state.customAPIs = [];
    if (!Array.isArray(obj.state.selectedKeys)) obj.state.selectedKeys = [];

    var changed = false;
    SEED.forEach(function (s) {
      if (!obj.state.customAPIs.some(function (x) { return x.key === s.key; })) {
        obj.state.customAPIs.push(s);
        changed = true;
      }
      if (obj.state.selectedKeys.indexOf(s.key) < 0) {
        obj.state.selectedKeys.push(s.key);
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(KEY, JSON.stringify(obj));
      // 阻止本页卸载时 zustand 节流 flush 用（尚未含种子的）内存态覆盖刚写入的种子
      var realSet = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k, v) { if (k !== KEY) return realSet(k, v); };
      location.reload();
    }
  } catch (e) { /* 注入失败不影响页面正常加载 */ }
})();
