
window.webtrendsAsyncInit = function() {
  var dcs = new Webtrends.dcs().init({
    dcsid: 'dcsomdxbr10000ch9wkdut5eo_1z4j',
    domain: 'sdc.scmccboss.com',
    timezone: 8,
    i18n: true,
    metanames: '',
    paidsearchparams: 'gclid,ad_id',
    adimpressions: true,
    adsparam: 'WT.ac',
    dcsdelay: 500
  });

  dcs.WT.branch = 'web';
  // dcs.track();
};

(function() {
  var s = document.createElement('script'); s.async = true; s.src = 'static/js/webtrends.min.js';
  var s2 = document.getElementsByTagName('script')[0]; s2.parentNode.insertBefore(s, s2);
}());
